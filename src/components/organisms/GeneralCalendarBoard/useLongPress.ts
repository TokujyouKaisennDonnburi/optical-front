import { useCallback, useRef } from "react";

// 長押し判定時間の定数（ミリ秒）
const LONG_PRESS_DURATION = 600;

/**
 * 長押し判定のカスタムフック
 * タッチデバイスとマウスデバイス両方に対応
 * @param onLongPress - 長押し成功時に呼び出されるコールバック
 * @returns イベントハンドラオブジェクト
 */
export function useLongPress(onLongPress: () => void) {
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  // 長押し判定を開始
  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // イベントカード内のクリックは無視（children 要素かどうかをチェック）
      if (
        e.target instanceof HTMLElement &&
        e.currentTarget instanceof HTMLElement
      ) {
        // イベントカード（button要素）をクリックした場合は長押し判定をキャンセル
        if (e.target.closest("button[type='button']")) {
          return;
        }
      }

      isLongPressRef.current = false;
      const pos =
        "touches" in e
          ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
          : { x: e.clientX, y: e.clientY };
      startPosRef.current = pos;

      timeoutIdRef.current = setTimeout(() => {
        // スクロール中でなければ長押し判定
        const currentPos =
          "touches" in e
            ? { x: e.touches[0]?.clientX ?? 0, y: e.touches[0]?.clientY ?? 0 }
            : { x: e.clientX, y: e.clientY };

        const movedDistance = startPosRef.current
          ? Math.hypot(
              currentPos.x - startPosRef.current.x,
              currentPos.y - startPosRef.current.y,
            )
          : 0;

        // 移動距離が10px以下なら長押し判定
        if (movedDistance <= 10) {
          isLongPressRef.current = true;
          onLongPress();
        }
      }, LONG_PRESS_DURATION);
    },
    [onLongPress],
  );

  // マウスアップ・タッチエンド時に長押しタイマーをクリア
  const handleEnd = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    isLongPressRef.current = false;
    startPosRef.current = null;
  }, []);

  // マウスムーブ・タッチムーブ時に移動距離をチェック
  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!startPosRef.current) return;

    const currentPos =
      "touches" in e
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : { x: e.clientX, y: e.clientY };

    const movedDistance = Math.hypot(
      currentPos.x - startPosRef.current.x,
      currentPos.y - startPosRef.current.y,
    );

    // 移動距離が10pxを超えたらタイマーをキャンセル（スクロール判定）
    if (movedDistance > 10 && timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  return {
    onMouseDown: handleStart,
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,
    onMouseMove: handleMove,
    onTouchStart: handleStart,
    onTouchEnd: handleEnd,
    onTouchMove: handleMove,
  };
}
