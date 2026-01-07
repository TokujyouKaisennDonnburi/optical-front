/**
 * SSE (Server-Sent Events) を使用したAIエージェントAPI
 * リアルタイムで処理ステータスを受信し、UXを向上させる
 */

import { getToken } from "@/lib/auth";

export type AgentResponse = {
  error?: string;
  content?: string;
  status?: string;
};

/**
 * AIエージェントの処理ステージ
 */
export const AllProcessingStage = [
  "connecting",
  "analyzing",
  "creating_events",
  "fetching_calendars",
  "fetching_events",
  "generating",
  "complete",
  "error",
] as const;
export type ProcessingStage = (typeof AllProcessingStage)[number];

/**
 * 処理ステージの日本語メッセージ
 */
export const STAGE_MESSAGES: Record<ProcessingStage, string> = {
  connecting: "接続中...",
  analyzing: "メッセージを分析中...",
  creating_events: "予定を作成中...",
  fetching_calendars: "カレンダーデータを取得中...",
  fetching_events: "予定データを取得中...",
  generating: "応答を生成中...",
  complete: "完了",
  error: "エラーが発生しました",
};

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
  onStatus: (status: StatusEvent) => void;
  onMessage: (message: string) => void;
  onError: (error: Error) => void;
  onFinish: (isCalendarEdited: boolean) => void;
};

/**
 * APIのベースURL
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_OPTICAL_API_URL || "http://localhost:8000";

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
  const { onStatus, onMessage, onError, onFinish } = callbacks;

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
      const apiUrl = calendarId
        ? `${API_BASE_URL}/agents/${calendarId}/chat`
        : `${API_BASE_URL}/agents/chat`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ message }),
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
        const data = (await response.json()) as AgentResponse;
        if (data.content) {
          onMessage(data.content);
        }
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
    } finally {
      onFinish(false);
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
  const { onStatus, onMessage, onError, onFinish } = callbacks;
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let isEdited = false;
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
      while (true) {
        const lineEnd = buffer.indexOf("\n");
        if (lineEnd === -1) {
          break;
        }
        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);
        if (!line.startsWith("data: ")) {
          continue;
        }
        const data = line.slice(6);
        if (data === "[DONE]") {
          break;
        }
        try {
          const response = JSON.parse(data) as AgentResponse;
          if (response.status) {
            const status = AllProcessingStage.find(
              (stage) => stage === response.status,
            );
            if (!status) {
              continue;
            }
            if (status === "creating_events") {
              isEdited = true;
            }
            onStatus({
              stage: status,
              message: STAGE_MESSAGES[status],
            });
            continue;
          }
          if (response.content) {
            onMessage(response.content);
          }
          if (response.error) {
            onError(new Error(response.error));
          }
        } catch {
          console.warn("[SSE] Failed to parse event data:", line);
        }
      }
    }
  } finally {
    reader.releaseLock();
    onFinish(isEdited);
  }
}
