"use client";

import { useEffect, useState } from "react";
import { startMockServiceWorker } from "@/mocks/browser";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  iconUrl?: string; // ユーザーアイコン画像
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      if (typeof window !== "undefined") {
        await startMockServiceWorker();
      }
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/user");
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        const json = (await response.json()) as User;
        if (isMounted) {
          setUser(json);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    user,
    isLoading,
    error,
  };
}
