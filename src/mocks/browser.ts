declare global {
  interface Window {
    __mswWorkerStarted?: boolean;
    __mswStartPromise?: Promise<void>;
  }
}

type WorkerInstance = Awaited<ReturnType<typeof initializeWorker>>;

let worker: WorkerInstance | null = null;

async function initializeWorker() {
  const { setupWorker } = await import("msw/browser");
  const {
    scheduleHandlers,
    authHandlers,
    githubHandlers,
    agentHandlers,
    schedulerPollHandlers,
  } = await import("@/mocks/handlers");

  console.log("[MSW] Setting up handlers:", {
    scheduleHandlers: scheduleHandlers.length,
    authHandlers: authHandlers.length,
    githubHandlers: githubHandlers.length,
    agentHandlers: agentHandlers.length,
    schedulerPollHandlers: schedulerPollHandlers.length,
  });

  return setupWorker(
    ...scheduleHandlers,
    ...authHandlers,
    ...githubHandlers,
    ...agentHandlers,
    ...schedulerPollHandlers,
  );
}

export function startMockServiceWorker() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.__mswStartPromise) {
    return window.__mswStartPromise;
  }

  window.__mswStartPromise = (async () => {
    const shouldMock = process.env.NEXT_PUBLIC_API_MOCKING !== "false";
    console.log(
      "[MSW] shouldMock:",
      shouldMock,
      "NODE_ENV:",
      process.env.NODE_ENV,
    );
    if (!shouldMock || process.env.NODE_ENV === "production") {
      return;
    }

    if (window.__mswWorkerStarted) {
      console.log("[MSW] Worker already started");
      return;
    }

    console.log("[MSW] Initializing worker...");
    worker = worker ?? (await initializeWorker());

    console.log("[MSW] Starting worker...");
    await worker?.start({
      onUnhandledRequest(request, print) {
        // Next.js 内部リクエストとルートパスは無視
        const url = new URL(request.url);
        if (
          url.pathname === "/" ||
          url.pathname.startsWith("/_next/") ||
          url.pathname.startsWith("/__nextjs")
        ) {
          return;
        }
        // その他の未処理リクエストは警告を出す
        print.warning();
      },
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
    });
    window.__mswWorkerStarted = true;
    console.log("[MSW] Worker started successfully");
  })();

  return window.__mswStartPromise;
}
