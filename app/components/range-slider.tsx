"use client";

import { useCallback, useRef, useState } from "react";

type RangeSliderProps = {
  min: number;
  max: number;
  step: number;
  valueLow: number;
  valueHigh: number;
  onChangeLow: (v: number) => void;
  onChangeHigh: (v: number) => void;
};

function snap(value: number, step: number, min: number, max: number) {
  const v = Math.round((value - min) / step) * step + min;
  return Math.min(Math.max(v, min), max);
}

export function RangeSlider({
  min,
  max,
  step,
  valueLow,
  valueHigh,
  onChangeLow,
  onChangeHigh,
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeThumb = useRef<"low" | "high" | null>(null);
  const [dragging, setDragging] = useState(false);

  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const lowPct = pct(valueLow);
  const highPct = pct(valueHigh);

  const valueFromPointer = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      return snap(min + ratio * (max - min), step, min, max);
    },
    [min, max, step]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setDragging(true);
      const v = valueFromPointer(e.clientX);
      const distLow = Math.abs(v - valueLow);
      const distHigh = Math.abs(v - valueHigh);

      if (distLow < distHigh || (distLow === distHigh && v <= valueLow)) {
        activeThumb.current = "low";
        onChangeLow(Math.min(v, valueHigh));
      } else {
        activeThumb.current = "high";
        onChangeHigh(Math.max(v, valueLow));
      }

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [valueLow, valueHigh, valueFromPointer, onChangeLow, onChangeHigh]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!activeThumb.current) return;
      const v = valueFromPointer(e.clientX);
      if (activeThumb.current === "low") {
        if (v > valueHigh) {
          activeThumb.current = "high";
          onChangeHigh(v);
        } else {
          onChangeLow(v);
        }
      } else {
        if (v < valueLow) {
          activeThumb.current = "low";
          onChangeLow(v);
        } else {
          onChangeHigh(v);
        }
      }
    },
    [valueLow, valueHigh, valueFromPointer, onChangeLow, onChangeHigh]
  );

  const handlePointerUp = useCallback(() => {
    activeThumb.current = null;
    setDragging(false);
  }, []);

  return (
    <div
      ref={trackRef}
      className={`relative h-10 w-full select-none touch-none ${dragging ? "cursor-grabbing" : "cursor-pointer"}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* track */}
      <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-[var(--border)]" />

      {/* filled segment */}
      <div
        className="absolute top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-[var(--text)]"
        style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }}
      />

      {/* low thumb */}
      <div
        className={`absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--text)] shadow-sm ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ left: `${lowPct}%` }}
      />

      {/* high thumb */}
      <div
        className={`absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--text)] shadow-sm ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ left: `${highPct}%` }}
      />
    </div>
  );
}
