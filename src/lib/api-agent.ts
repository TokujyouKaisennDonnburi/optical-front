import type { AgentMessage } from "@/components/organisms/AgentChat/AgentMessageItem";
import { apiPost } from "@/lib/api-client";

export type SendChatMessageRequest = {
  message: string;
  calendarId?: string;
};

export type SendChatMessageResponse = AgentMessage;

export async function sendChatMessage(message: string, calendarId?: string) {
  return apiPost<SendChatMessageResponse>("/agent/chat", {
    message,
    calendarId,
  });
}
