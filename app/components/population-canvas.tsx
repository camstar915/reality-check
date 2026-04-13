"use client";

import { useDeferredValue, useEffect, useRef } from "react";

type Props = {
  probability: number;
  hasMatches: boolean;
};

function draw(
  canvas: HTMLCanvasElement,
  probability: number,
  hasMatches: boolean
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { width, height } = canvas;
  const dpr = window.devicePixelRatio || 1;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#f3f3f0";
  ctx.fillRect(0, 0, width, height);

  const cols = width > height ? 100 : 60;
  const rows = Math.max(1, Math.floor(cols * (height / width)));
  const total = cols * rows;
  const survivors = hasMatches
    ? Math.max(1, Math.round(total * probability))
    : 0;
  const gapX = width / cols;
  const gapY = height / rows;
  const radius = Math.max(1.2 * dpr, Math.min(gapX, gapY) * 0.22);

  for (let i = 0; i < total; i++) {
    const x = (i % cols) * gapX + gapX / 2;
    const y = Math.floor(i / cols) * gapY + gapY / 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = i < survivors ? "#111" : "#d8d8d4";
    ctx.fill();
  }
}

export function PopulationCanvas({ probability, hasMatches }: Props) {
  const deferred = useDeferredValue(probability);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const redraw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      draw(canvas, deferred, hasMatches);
    };

    const observer = new ResizeObserver(redraw);
    observer.observe(canvas);
    redraw();
    return () => observer.disconnect();
  }, [deferred, hasMatches]);

  return (
    <canvas
      ref={ref}
      className="block h-32 w-full rounded-lg sm:h-40"
      aria-label="Each dot is a person. Highlighted dots are matches."
    />
  );
}
