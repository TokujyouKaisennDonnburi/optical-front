import { HttpResponse, http } from "msw";

export const agentHandlers = [
  http.post("http://localhost:8000/agent/chat", async ({ request }) => {
    console.log("[MSW] POST /agent/chat handler called");

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const body = (await request.json()) as { message: string };
      const text = body.message;
      const isOptionRequest =
        text.includes("オプション") ||
        text.includes("option") ||
        text.includes("GitHub");

      if (isOptionRequest) {
        return HttpResponse.json({
          id: (Date.now() + 1).toString(),
          role: "agent",
          type: "option-proposal",
          content: "こちらのオプションがおすすめです。",
          data: [
            {
              id: 1,
              name: "GitHub Integration",
              description: "開発スプリントと連携します",
            },
          ],
        });
      }

      return HttpResponse.json({
        id: (Date.now() + 1).toString(),
        role: "agent",
        type: "text",
        content: "承知いたしました。他にお手伝いできることはありますか？",
      });
    } catch (e: unknown) {
      console.error("[MSW] Failed to parse request body", e);
      return HttpResponse.json({ error: "Invalid request" }, { status: 400 });
    }
  }),
];
