"use client";

import { startTransition, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PopulationCanvas } from "./population-canvas";
import { RangeSlider } from "./range-slider";
import {
  ageBounds,
  computeFunnel,
  defaultState,
  formatAgeRangeLabel,
  formatCount,
  formatPercent,
  getLocationOptions,
  getSexOptions,
  normalizeAgeRange,
  serializeSearchState,
  type FamilyId,
  type HumorId,
  type LocationId,
  type SearchState,
  type SexId,
  type SocialId,
  type WorldviewId,
} from "../lib/reality-check";

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors ${
        active
          ? "bg-[var(--text)] text-[var(--bg)] font-medium"
          : "text-[var(--text-2)] ring-1 ring-inset ring-[var(--border)] hover:ring-[var(--text-3)] hover:text-[var(--text)]"
      }`}
    >
      {label}
    </button>
  );
}

function FilterGroup({
  label,
  options,
  selected,
  onActivate,
}: {
  label: string;
  options: { id: string; label: string }[];
  selected: string;
  onActivate: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[0.65rem] uppercase tracking-widest text-[var(--text-3)]">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <Pill
            key={o.id}
            label={o.label}
            active={selected === o.id}
            onClick={() => onActivate(o.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function RealityCheckExperience({
  initialState,
}: {
  initialState: SearchState;
}) {
  const pathname = usePathname();
  const [state, setState] = useState(initialState);
  const [copied, setCopied] = useState(false);
  const results = computeFunnel(state);
  const shareQuery = serializeSearchState(state);

  function set<K extends keyof SearchState>(key: K, value: SearchState[K]) {
    startTransition(() => setState((s) => ({ ...s, [key]: value })));
  }

  function setAgeMin(next: number) {
    startTransition(() => {
      setState((s) => {
        const v =
          Math.round(
            Math.min(Math.max(next, ageBounds.min), ageBounds.max) * 10
          ) / 10;
        const { ageMin, ageMax } = normalizeAgeRange(v, s.ageMax);
        return { ...s, ageMin, ageMax };
      });
    });
  }

  function setAgeMax(next: number) {
    startTransition(() => {
      setState((s) => {
        const v =
          Math.round(
            Math.min(Math.max(next, ageBounds.min), ageBounds.max) * 10
          ) / 10;
        const { ageMin, ageMax } = normalizeAgeRange(s.ageMin, v);
        return { ...s, ageMin, ageMax };
      });
    });
  }

  function reset() {
    startTransition(() => setState(defaultState));
  }

  useEffect(() => {
    const url = shareQuery ? `${pathname}?${shareQuery}` : pathname;
    window.history.replaceState(null, "", url);
  }, [pathname, shareQuery]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);

  async function share() {
    const url = `${window.location.origin}${pathname}?${shareQuery}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Reality Check",
          text: `${formatCount(results.rawRemainingLocal)} people in ${results.location.label} match my standards`,
          url,
        });
        return;
      } catch {
        /* user cancelled or unsupported */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      /* clipboard unavailable */
    }
  }

  const funnel: {
    label: string;
    keep: number;
    remaining: number;
    bar: number;
  }[] = [];
  let pool = results.cohort.baseCount;
  for (const f of results.factors) {
    pool *= f.probability;
    funnel.push({
      label: f.label,
      keep: f.probability,
      remaining: pool,
      bar: Math.max(0.4, (pool / results.cohort.baseCount) * 100),
    });
  }
  const localBar = Math.max(
    0.2,
    (results.rawRemainingLocal / results.cohort.baseCount) * 100
  );

  const display = formatCount(results.rawRemainingLocal);
  const heroSize =
    display.length <= 5
      ? "text-[5rem] sm:text-[7rem] lg:text-[8rem]"
      : display.length <= 8
        ? "text-[3.5rem] sm:text-[5rem] lg:text-[6rem]"
        : "text-[2rem] sm:text-[3rem] lg:text-[4rem]";

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl px-5 py-6 sm:py-10">
        <header className="mb-8 flex items-center justify-between sm:mb-10">
          <h1 className="text-sm font-semibold tracking-tight">
            Reality Check
          </h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="text-sm text-[var(--text-3)] transition-colors hover:text-[var(--text)]"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={share}
              className="rounded-full bg-[var(--surface)] px-4 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--border)]"
            >
              {copied ? "Copied" : "Share"}
            </button>
          </div>
        </header>

        <section className="mb-6 sm:mb-8">
          <div
            className={`${heroSize} font-bold leading-[0.9] tracking-[-0.04em] tabular-nums`}
          >
            {display}
          </div>
          <p className="mt-2 text-base text-[var(--text-2)] sm:text-lg">
            people in {results.location.label}
            <span className="text-[var(--text-4)]">
              {" "}
              &middot; 1 in {formatCount(results.rarity)}
            </span>
          </p>
        </section>

        <section className="mb-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <FilterGroup
            label="Sex"
            options={getSexOptions()}
            selected={state.sex}
            onActivate={(id) => set("sex", id as SexId)}
          />
          <FilterGroup
            label="Location"
            options={getLocationOptions().map((o) => ({
              id: o.id,
              label: o.label,
            }))}
            selected={state.location}
            onActivate={(id) => set("location", id as LocationId)}
          />

          <div className="sm:col-span-2">
            <div className="mb-0 flex items-center justify-between">
              <span className="text-[0.65rem] uppercase tracking-widest text-[var(--text-3)]">
                Age range
              </span>
              <span className="text-sm font-semibold tabular-nums">
                {formatAgeRangeLabel(state.ageMin, state.ageMax)}
              </span>
            </div>
            <RangeSlider
              min={ageBounds.min}
              max={ageBounds.max}
              step={1}
              valueLow={state.ageMin}
              valueHigh={state.ageMax}
              onChangeLow={setAgeMin}
              onChangeHigh={setAgeMax}
            />
          </div>

          <div className="sm:col-span-2">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[0.65rem] uppercase tracking-widest text-[var(--text-3)]">
                Attractiveness
              </span>
              <span className="text-sm font-semibold tabular-nums">
                {state.attractiveness.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={0.1}
              value={state.attractiveness}
              onChange={(e) =>
                set("attractiveness", Number.parseFloat(e.target.value))
              }
            />
          </div>

          <FilterGroup
            label="Worldview"
            options={[
              { id: "aligned", label: "Values aligned" },
              { id: "secular-trad", label: "Secular-trad" },
            ]}
            selected={state.worldview === "either" ? "" : state.worldview}
            onActivate={(id) =>
              startTransition(() =>
                setState((s) => ({
                  ...s,
                  worldview:
                    s.worldview === id ? "either" : (id as WorldviewId),
                }))
              )
            }
          />
          <FilterGroup
            label="Family"
            options={[
              { id: "high", label: "Strong fit" },
              { id: "medium", label: "Compatible" },
            ]}
            selected={state.family === "either" ? "" : state.family}
            onActivate={(id) =>
              startTransition(() =>
                setState((s) => ({
                  ...s,
                  family: s.family === id ? "either" : (id as FamilyId),
                }))
              )
            }
          />
          <FilterGroup
            label="Digital presence"
            options={[
              { id: "low-private", label: "Low / private" },
              { id: "selective", label: "Selective" },
            ]}
            selected={state.social === "either" ? "" : state.social}
            onActivate={(id) =>
              startTransition(() =>
                setState((s) => ({
                  ...s,
                  social: s.social === id ? "either" : (id as SocialId),
                }))
              )
            }
          />
          <FilterGroup
            label="Chemistry"
            options={[
              { id: "specific-click", label: "Specific click" },
              { id: "good-vibe", label: "Good general" },
            ]}
            selected={state.humor === "either" ? "" : state.humor}
            onActivate={(id) =>
              startTransition(() =>
                setState((s) => ({
                  ...s,
                  humor: s.humor === id ? "either" : (id as HumorId),
                }))
              )
            }
          />
        </section>

        <section className="mb-10">
          <PopulationCanvas
            probability={results.probability}
            hasMatches={results.rawRemainingNational > 0}
          />
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-[var(--text-3)]">
            The Funnel
          </h2>

          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-sm font-medium">
              {results.cohort.label}
            </span>
            <span className="text-sm font-medium tabular-nums">
              {formatCount(results.cohort.baseCount)}
            </span>
          </div>
          <div className="mb-4 h-1 rounded-full bg-[var(--text)]" />

          {funnel.map((step) => (
            <div key={step.label}>
              <div className="mb-1 flex items-baseline justify-between gap-4">
                <div className="min-w-0 text-sm text-[var(--text-2)]">
                  <span>{step.label}</span>
                  <span className="ml-1.5 text-xs text-[var(--text-4)]">
                    {formatPercent(step.keep)}
                  </span>
                </div>
                <span className="shrink-0 text-sm font-medium tabular-nums">
                  {formatCount(step.remaining)}
                </span>
              </div>
              <div className="mb-4 h-1 rounded-full bg-[var(--border)]">
                <div
                  className="h-full rounded-full bg-[var(--text)] transition-all duration-500 ease-out"
                  style={{ width: `${step.bar}%` }}
                />
              </div>
            </div>
          ))}

          <div className="mb-1 flex items-baseline justify-between gap-4">
            <div className="text-sm text-[var(--text-2)]">
              <span>{results.location.label}</span>
              <span className="ml-1.5 text-xs text-[var(--text-4)]">
                {(results.location.shareOfPopulation * 100).toFixed(1)}%
              </span>
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {formatCount(results.rawRemainingLocal)}
            </span>
          </div>
          <div className="h-1 rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-[var(--text)] transition-all duration-500 ease-out"
              style={{ width: `${localBar}%` }}
            />
          </div>
        </section>

        {results.insights[0] && (
          <p className="mb-10 border-l-2 border-[var(--border)] pl-4 text-sm leading-relaxed text-[var(--text-3)]">
            {results.insights[0]}
          </p>
        )}

        <footer className="pb-8 text-center">
          <button
            type="button"
            onClick={share}
            className="rounded-full bg-[var(--text)] px-8 py-3 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-80"
          >
            {copied ? "Link Copied" : "Share Your Reality Check"}
          </button>
          <p className="mt-3 text-xs text-[var(--text-4)]">
            Estimates use public demographic data and transparent assumptions.
          </p>
        </footer>
      </div>
    </main>
  );
}
