import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import {
  computeFunnel,
  formatCount,
  parseSearchState,
} from "../../lib/reality-check";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        border: "1.5px solid #e5e4e1",
        borderRadius: 999,
        padding: "8px 18px",
        fontSize: 20,
        color: "#555",
      }}
    >
      {children}
    </div>
  );
}

export async function GET(request: NextRequest) {
  const state = parseSearchState(request.nextUrl.searchParams);
  const results = computeFunnel(state);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fafaf9",
          padding: 56,
          color: "#111",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
              color: "#999",
            }}
          >
            Reality Check
          </span>
          <Chip>{results.location.label}</Chip>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              fontSize: 112,
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
            }}
          >
            {formatCount(results.rawRemainingLocal)} people
          </div>
          <div style={{ fontSize: 34, color: "#555" }}>
            in {results.location.label} match these standards
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Chip>{results.cohort.label}</Chip>
          <Chip>1 in {formatCount(results.rarity)}</Chip>
        </div>
      </div>
    ),
    size
  );
}
