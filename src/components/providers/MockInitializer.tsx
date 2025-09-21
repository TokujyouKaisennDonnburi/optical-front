"use client";

import { useEffect } from "react";

import { startMockServiceWorker } from "@/mocks/browser";

export function MockInitializer() {
  useEffect(() => {
    void startMockServiceWorker();
  }, []);

  return null;
}
