import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 背景色に基づいて、視認性の高い文字色（黒または白）を返します
 * @param hexColor 背景色のHEX値 (例: "#ff0000", "ff0000")
 * @returns 文字色のHEX値 ("#ffffff" or "#000000")
 */
export function getContrastTextColor(hexColor?: string): string {
  if (!hexColor) return "#000000";

  // #を除去
  const hex = hexColor.replace("#", "");

  // 短縮形 (例: f00) の場合は展開
  const fullHex =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;

  // RGB値を取得
  const r = Number.parseInt(fullHex.substring(0, 2), 16);
  const g = Number.parseInt(fullHex.substring(2, 4), 16);
  const b = Number.parseInt(fullHex.substring(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return "#000000";
  }

  // 輝度を計算 (YIQ formula)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // 輝度が128以上なら黒文字（明るい背景）、それ以外は白文字（暗い背景）
  return yiq >= 128 ? "#000000" : "#ffffff";
}
