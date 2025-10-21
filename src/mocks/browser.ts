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
  const { scheduleHandlers } = await import("@/mocks/handlers");
  const { userHandlers } = await import("@/mocks/handlers/userHandlers");

  return setupWorker(...scheduleHandlers, ...userHandlers);
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
    if (!shouldMock || process.env.NODE_ENV === "production") {
      return;
    }

    if (window.__mswWorkerStarted) {
      return;
    }

    worker = worker ?? (await initializeWorker());

    await worker?.start({ onUnhandledRequest: "bypass" });
    window.__mswWorkerStarted = true;
  })();

  return window.__mswStartPromise;
}
