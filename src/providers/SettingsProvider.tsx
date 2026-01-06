"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type SettingsContextType = {
  isGamingHoliday: boolean;
  setGamingHoliday: (value: boolean) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  // デフォルトはオフ
  const [isGamingHoliday, setIsGamingHoliday] = useState(false);
  useEffect(() => {
    // ローカルストレージから読み込み
    const saved = localStorage.getItem("calendar-settings-gaming-holiday");
    if (saved !== null) {
      setIsGamingHoliday(saved === "true");
    }
  }, []);

  const setGamingHoliday = (value: boolean) => {
    setIsGamingHoliday(value);
    localStorage.setItem("calendar-settings-gaming-holiday", String(value));
  };

  // 初期ロード完了まではデフォルト値を返す（SSRとの不整合を防ぐため、必要ならレンダリングを遅延させるが、今回はCSSクラスの付け替えだけなので許容）
  // ちらつき防止が重要なら isLoaded を使う

  return (
    <SettingsContext.Provider value={{ isGamingHoliday, setGamingHoliday }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
