import type { AgentMessage } from "@/components/organisms/AgentChat/AgentMessageItem";
import { apiPost } from "@/lib/api-client";

export type SendChatMessageRequest = {
  message: string;
};

export type SendChatMessageResponse = AgentMessage;

export async function sendChatMessage(message: string) {
  return apiPost<SendChatMessageResponse>("/agent/chat", { message });
}
