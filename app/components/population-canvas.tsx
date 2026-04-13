"use client";

import { useDeferredValue, useEffect, useRef } from "react";

type Props = {
  probability: number;
  hasMatches: boolean;
};

function seededShuffle(indices: Uint32Array, seed: number) {
  let s = seed | 0;
  for (let i = indices.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) | 0;
    const j = ((s >>> 0) % (i + 1)) | 0;
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }
}

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

  const baseCols = width > height ? 200 : 120;
  const cols = Math.max(baseCols, Math.floor(width / (3.5 * dpr)));
  const rows = Math.max(1, Math.floor(cols * (height / width)));
  const total = cols * rows;
  const survivors = hasMatches
    ? Math.max(1, Math.round(total * probability))
    : 0;

  const indices = new Uint32Array(total);
  for (let i = 0; i < total; i++) indices[i] = i;
  seededShuffle(indices, 314159);

  const survivorSet = new Set<number>();
  for (let i = 0; i < survivors; i++) survivorSet.add(indices[i]);

  const gapX = width / cols;
  const gapY = height / rows;
  const radius = Math.max(0.6 * dpr, Math.min(gapX, gapY) * 0.18);

  ctx.fillStyle = "#dcdcd8";
  ctx.beginPath();
  for (let i = 0; i < total; i++) {
    if (survivorSet.has(i)) continue;
    const x = (i % cols) * gapX + gapX / 2;
    const y = Math.floor(i / cols) * gapY + gapY / 2;
    ctx.moveTo(x + radius, y);
    ctx.arc(x, y, radius, 0, Math.PI * 2);
  }
  ctx.fill();

  if (survivors > 0) {
    ctx.fillStyle = "#111";
    ctx.beginPath();
    for (let i = 0; i < total; i++) {
      if (!survivorSet.has(i)) continue;
      const x = (i % cols) * gapX + gapX / 2;
      const y = Math.floor(i / cols) * gapY + gapY / 2;
      ctx.moveTo(x + radius, y);
      ctx.arc(x, y, radius, 0, Math.PI * 2);
    }
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
      className="block h-44 w-full rounded-lg sm:h-56"
      aria-label="Each dot is a person. Highlighted dots are matches."
    />
  );
}
