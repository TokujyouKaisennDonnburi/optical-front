import { HttpResponse, http } from "msw";
import { mockAgentResponses, mockOptionProposals } from "../data/agent";

export const agentHandlers = [
  http.post("http://localhost:8000/agent/chat", async ({ request }) => {
    console.log("[MSW] POST /agent/chat handler called");

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const body = (await request.json()) as { message: string };
      const text = body.message.toLowerCase();

      // GitHub連携についての質問
      if (
        text.includes("github連携") ||
        (text.includes("github") && text.includes("教えて"))
      ) {
        return HttpResponse.json({
          id: (Date.now() + 1).toString(),
          role: "agent",
          type: "text",
          content: mockAgentResponses.githubInfo,
        });
      }

      // オプション提案リクエスト
      const isOptionRequest =
        text.includes("オプション") ||
        text.includes("option") ||
        text.includes("おすすめ");

      if (isOptionRequest) {
        return HttpResponse.json({
          id: (Date.now() + 1).toString(),
          role: "agent",
          type: "option-proposal",
          content: mockAgentResponses.optionProposal,
          data: mockOptionProposals,
        });
      }

      return HttpResponse.json({
        id: (Date.now() + 1).toString(),
        role: "agent",
        type: "text",
        content: mockAgentResponses.defaultResponse,
      });
    } catch (e: unknown) {
      console.error("[MSW] Failed to parse request body", e);
      return HttpResponse.json({ error: "Invalid request" }, { status: 400 });
    }
  }),
];
