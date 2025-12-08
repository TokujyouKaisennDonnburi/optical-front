/**
 * API クライアントユーティリティ
 * JWT トークンの自動注入とエラーハンドリングを提供
 */

import { getToken } from "@/lib/auth";
import type { ApiError } from "@/types/auth";

/**
 * API のベース URL
 * 環境変数から取得、デフォルトは空文字（相対パス）
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
export const OPTICAL_API_URL =
  process.env.OPICAL_API_URL || "http://localhost:8000";

/**
 * API エラークラス
 */
export class ApiClientError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
  }
}

/**
 * API リクエストオプション
 */
interface ApiRequestOptions extends RequestInit {
  /** 認証トークンを自動で付与するか (デフォルト: true) */
  useAuth?: boolean;
}

/**
 * API リクエストを実行する
 *
 * @param endpoint - API エンドポイント（例: "/api/auth/login"）
 * @param options - fetch オプション
 * @returns レスポンスデータ
 * @throws ApiClientError - API エラーが発生した場合
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
  baseUrl?: string,
): Promise<T> {
  const { useAuth = true, headers = {}, ...fetchOptions } = options;

  // ヘッダーの構築
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // 追加のヘッダーをマージ
  if (headers) {
    Object.assign(requestHeaders, headers);
  }

  // JWT トークンの自動注入
  if (useAuth) {
    const token = getToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  // リクエストの実行
  try {
    const url = `${baseUrl || API_BASE_URL}${endpoint}`;
    console.log("[API Client] Sending request:", {
      url,
      method: fetchOptions.method || "GET",
      hasAuth: !!requestHeaders.Authorization,
    });

    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    console.log("[API Client] Response received:", {
      url,
      status: response.status,
      statusText: response.statusText,
    });

    // レスポンスの解析
    let data: T | ApiError;

    // レスポンスが空の場合（204 No Content など）の処理
    const contentType = response.headers.get("content-type");
    const hasJsonContent = contentType?.includes("application/json");

    if (response.ok && (response.status === 204 || !hasJsonContent)) {
      // 204 No Content または JSON以外のレスポンスの場合は空オブジェクトを返す
      return {} as T;
    }

    try {
      data = (await response.json()) as T | ApiError;
    } catch (error) {
      // JSON パースに失敗した場合
      console.warn("[API Client] JSON parse failed:", {
        url: endpoint,
        status: response.status,
        contentType,
        error,
      });

      // レスポンスが成功している場合は空オブジェクトを返す
      if (response.ok) {
        return {} as T;
      }
      throw new ApiClientError(
        response.status,
        "レスポンスの解析に失敗しました",
      );
    }

    // エラーレスポンスのチェック
    if (!response.ok) {
      const errorData = data as ApiError;
      throw new ApiClientError(
        errorData.error?.code || response.status,
        errorData.error?.message || "エラーが発生しました",
      );
    }

    return data as T;
  } catch (error) {
    // ネットワークエラーまたはその他のエラー
    if (error instanceof ApiClientError) {
      throw error;
    }

    if (error instanceof TypeError) {
      // ネットワークエラー
      throw new ApiClientError(
        0,
        "ネットワークエラーが発生しました。もう一度お試しください。",
      );
    }

    // その他の予期しないエラー
    throw new ApiClientError(
      500,
      "予期しないエラーが発生しました。しばらくしてからもう一度お試しください。",
    );
  }
}

/**
 * GET リクエスト
 */
export async function apiGet<T>(
  endpoint: string,
  options?: ApiRequestOptions,
  baseUrl?: string,
): Promise<T> {
  return apiRequest<T>(
    endpoint,
    {
      ...options,
      method: "GET",
    },
    baseUrl,
  );
}

/**
 * POST リクエスト
 */
export async function apiPost<T>(
  endpoint: string,
  body?: unknown,
  options?: ApiRequestOptions,
  baseUrl?: string,
): Promise<T> {
  return apiRequest<T>(
    endpoint,
    {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    },
    baseUrl,
  );
}
