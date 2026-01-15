"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type WeekdayLanguage = "ja" | "en";

type SettingsContextType = {
  isGamingHoliday: boolean;
  setGamingHoliday: (value: boolean) => void;
  weekdayLanguage: WeekdayLanguage;
  setWeekdayLanguage: (value: WeekdayLanguage) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  // デフォルトはオフ
  const [isGamingHoliday, setIsGamingHoliday] = useState(false);
  // 曜日表示: デフォルトは日本語
  const [weekdayLanguage, setWeekdayLanguageState] =
    useState<WeekdayLanguage>("ja");

  useEffect(() => {
    // ローカルストレージから読み込み
    const savedGaming = localStorage.getItem(
      "calendar-settings-gaming-holiday",
    );
    if (savedGaming !== null) {
      setIsGamingHoliday(savedGaming === "true");
    }

    const savedWeekday = localStorage.getItem(
      "calendar-settings-weekday-language",
    );
    if (savedWeekday === "ja" || savedWeekday === "en") {
      setWeekdayLanguageState(savedWeekday);
    }
  }, []);

  const setGamingHoliday = (value: boolean) => {
    setIsGamingHoliday(value);
    localStorage.setItem("calendar-settings-gaming-holiday", String(value));
  };

  const setWeekdayLanguage = (value: WeekdayLanguage) => {
    setWeekdayLanguageState(value);
    localStorage.setItem("calendar-settings-weekday-language", value);
  };

  return (
    <SettingsContext.Provider
      value={{
        isGamingHoliday,
        setGamingHoliday,
        weekdayLanguage,
        setWeekdayLanguage,
      }}
    >
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
