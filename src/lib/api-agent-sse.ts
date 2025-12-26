/**
 * SSE (Server-Sent Events) を使用したAIエージェントAPI
 * リアルタイムで処理ステータスを受信し、UXを向上させる
 */

import type { AgentMessage } from "@/components/organisms/AgentChat/AgentMessageItem";
import { getToken } from "@/lib/auth";

/**
 * AIエージェントの処理ステージ
 */
export type ProcessingStage =
  | "connecting"
  | "analyzing"
  | "fetching"
  | "generating"
  | "complete"
  | "error";

/**
 * ステータスイベントの型
 */
export type StatusEvent = {
  stage: ProcessingStage;
  message: string;
};

/**
 * SSEコールバック関数の型
 */
export type SSECallbacks = {
  /** ステータス更新時に呼ばれる */
  onStatus: (status: StatusEvent) => void;
  /** 処理完了時に呼ばれる */
  onComplete: (response: AgentMessage) => void;
  /** エラー発生時に呼ばれる */
  onError: (error: Error) => void;
};

/**
 * APIのベースURL
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_OPTICAL_API_URL || "http://localhost:8000";

/**
 * 処理ステージの日本語メッセージ
 */
export const STAGE_MESSAGES: Record<ProcessingStage, string> = {
  connecting: "接続中...",
  analyzing: "メッセージを分析中...",
  fetching: "カレンダーデータを取得中...",
  generating: "応答を生成中...",
  complete: "完了",
  error: "エラーが発生しました",
};

/**
 * SSEを使用してチャットメッセージを送信する
 * 同じ /agent/chat エンドポイントを使用し、Accept ヘッダーでSSEを要求
 *
 * @param message - ユーザーのメッセージ
 * @param calendarId - 対象カレンダーID（オプション）
 * @param callbacks - SSEイベントのコールバック関数
 * @returns キャンセル用のAbortController
 */
export function sendChatMessageSSE(
  message: string,
  calendarId: string | undefined,
  callbacks: SSECallbacks,
): AbortController {
  const controller = new AbortController();
  const { onStatus, onComplete, onError } = callbacks;

  // 接続開始を通知
  onStatus({ stage: "connecting", message: STAGE_MESSAGES.connecting });

  const performRequest = async () => {
    try {
      const token = getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        // SSEを要求するAcceptヘッダー
        Accept: "text/event-stream",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/agent/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message, calendarId }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");

      // SSEレスポンスの場合
      if (contentType?.includes("text/event-stream")) {
        await handleSSEResponse(response, callbacks, controller.signal);
      } else {
        // 通常のJSONレスポンスの場合（フォールバック）
        const data = (await response.json()) as AgentMessage;
        onComplete(data);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          // ユーザーによるキャンセル
          return;
        }
        onError(error);
      } else {
        onError(new Error("予期しないエラーが発生しました"));
      }
    }
  };

  performRequest();

  return controller;
}

/**
 * SSEレスポンスを処理する
 */
async function handleSSEResponse(
  response: Response,
  callbacks: SSECallbacks,
  signal: AbortSignal,
): Promise<void> {
  const { onStatus, onComplete, onError } = callbacks;
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      if (signal.aborted) {
        break;
      }

      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // SSEイベントをパース
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // 最後の不完全な行を保持

      let currentEvent = "";
      let currentData = "";

      for (const line of lines) {
        if (line.startsWith("event:")) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          currentData = line.slice(5).trim();
        } else if (line === "" && currentData) {
          // 空行でイベント完了
          try {
            const data = JSON.parse(currentData);

            if (currentEvent === "status") {
              onStatus(data as StatusEvent);
            } else if (currentEvent === "complete") {
              onComplete(data as AgentMessage);
            } else if (currentEvent === "error") {
              onError(new Error(data.message || "エラーが発生しました"));
            }
          } catch {
            console.warn("[SSE] Failed to parse event data:", currentData);
          }

          currentEvent = "";
          currentData = "";
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
