"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PopulationCanvas } from "./population-canvas";
import { RangeSlider } from "./range-slider";
import {
  ageBounds,
  approachProbability,
  computeFunnel,
  conversionProbability,
  defaultState,
  formatAgeRangeLabel,
  formatCount,
  formatPercent,
  getCoreFilters,
  getFamilyOptions,
  getLifestyleFilters,
  getLocationOptions,
  normalizeAgeRange,
  serializeSearchState,
  type FamilyId,
  type FilterMeta,
  type HasKidsId,
  type KidCountId,
  type KidTimelineId,
  type LocationId,
  type SearchState,
  type SexId,
} from "../lib/reality-check";

/* ------------------------------------------------------------------ */
/*  Icons                                                               */
/* ------------------------------------------------------------------ */

function FemaleIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor" className={className}>
      <circle cx="7" cy="3.5" r="3" />
      <path d="M3.5 8h7l-1 7.5h-2V19h-1v-3.5h-2z" />
    </svg>
  );
}

function MaleIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor" className={className}>
      <circle cx="7" cy="3.5" r="3" />
      <rect x="3" y="8" width="8" height="6" rx="1" />
      <rect x="3.5" y="14.5" width="3" height="4.5" rx="0.5" />
      <rect x="7.5" y="14.5" width="3" height="4.5" rx="0.5" />
    </svg>
  );
}

function ChevronIcon({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""} ${className ?? ""}`}
    >
      <path d="M3 4.5 L6 7.5 L9 4.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Tooltip                                                             */
/* ------------------------------------------------------------------ */

function Tooltip({ text, children }: { text?: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(null);

  if (!text) return <>{children}</>;

  function enter() {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setShow(true), 400);
  }
  function leave() {
    if (timeout.current) clearTimeout(timeout.current);
    setShow(false);
  }

  return (
    <span className="relative inline-flex" onMouseEnter={enter} onMouseLeave={leave}>
      {children}
      {show && (
        <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 rounded-md bg-[var(--text)] px-3 py-2 text-[0.7rem] leading-snug text-[var(--bg)] shadow-lg max-w-[220px] w-max text-center">
          {text}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[var(--text)]" />
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Primitives                                                          */
/* ------------------------------------------------------------------ */

function Chip({
  label,
  desc,
  active,
  onClick,
}: {
  label: string;
  desc?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip text={desc}>
      <button
        type="button"
        onClick={onClick}
        className={`cursor-pointer whitespace-nowrap rounded-md px-2.5 py-1 text-[0.8rem] leading-snug transition-all ${
          active
            ? "bg-[var(--text)] text-[var(--bg)] font-medium shadow-sm"
            : "text-[var(--text-2)] ring-1 ring-inset ring-[var(--border)] hover:ring-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
        }`}
      >
        {label}
      </button>
    </Tooltip>
  );
}

function FilterRow({
  meta,
  value,
  onChange,
}: {
  meta: FilterMeta;
  value: string;
  onChange: (id: string) => void;
}) {
  const isActive = value !== "either";

  return (
    <div>
      <div className="mb-1 flex items-baseline gap-2">
        <span className={`text-[0.7rem] font-medium uppercase tracking-wider ${isActive ? "text-[var(--text)]" : "text-[var(--text-3)]"}`}>
          {meta.label}
        </span>
        <span className="text-[0.65rem] text-[var(--text-4)]">
          {meta.hint}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {meta.options.map((o) => (
          <Chip
            key={o.id}
            label={o.label}
            desc={o.desc}
            active={value === o.id}
            onClick={() => onChange(value === o.id ? "either" : o.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SectionHeader({
  label,
  subtitle,
  badge,
  open,
  onToggle,
}: {
  label: string;
  subtitle: string;
  badge?: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-left transition-colors hover:border-[var(--text-4)]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[0.8rem] font-semibold text-[var(--text)]">
            {label}
          </span>
          {badge !== undefined && badge > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--text)] px-1 text-[0.55rem] font-bold text-[var(--bg)]">
              {badge}
            </span>
          )}
        </div>
        <span className="text-[0.7rem] text-[var(--text-3)]">{subtitle}</span>
      </div>
      <ChevronIcon open={open} className="shrink-0 text-[var(--text-3)]" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export function RealityCheckExperience({
  initialState,
}: {
  initialState: SearchState;
}) {
  const pathname = usePathname();
  const [state, setState] = useState(initialState);
  const [copied, setCopied] = useState(false);
  const [lifestyleOpen, setLifestyleOpen] = useState(false);
  const [realityOpen, setRealityOpen] = useState(false);

  const results = computeFunnel(state);
  const shareQuery = serializeSearchState(state);

  function set<K extends keyof SearchState>(key: K, value: SearchState[K]) {
    startTransition(() => setState((s) => ({ ...s, [key]: value })));
  }

  function setAgeMin(next: number) {
    startTransition(() => {
      setState((s) => {
        const v = Math.round(Math.min(Math.max(next, ageBounds.min), ageBounds.max) * 10) / 10;
        const { ageMin, ageMax } = normalizeAgeRange(v, s.ageMax);
        return { ...s, ageMin, ageMax };
      });
    });
  }

  function setAgeMax(next: number) {
    startTransition(() => {
      setState((s) => {
        const v = Math.round(Math.min(Math.max(next, ageBounds.min), ageBounds.max) * 10) / 10;
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
      } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch { /* clipboard unavailable */ }
  }

  const coreFilters = getCoreFilters();
  const familyOpts = getFamilyOptions();
  const lifestyleFilters = getLifestyleFilters();

  const countActive = (filters: FilterMeta[]) =>
    filters.filter((f) => (state[f.key] as string) !== "either").length;

  const lifestyleActive = countActive(lifestyleFilters);
  const realityActive = (state.approachAbility < 10 ? 1 : 0) + (state.conversionAbility < 10 ? 1 : 0);

  /* Funnel */
  const funnel: { label: string; keep: number; remaining: number; bar: number }[] = [];
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
  const localBar = Math.max(0.2, (results.rawRemainingLocal / results.cohort.baseCount) * 100);
  const display = formatCount(results.rawRemainingLocal);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl px-5 py-6 sm:py-10">

        {/* Header */}
        <header className="mb-8 flex items-center justify-between sm:mb-10">
          <h1 className="text-sm font-semibold tracking-tight">Reality Check</h1>
          <div className="flex items-center gap-3">
            <button type="button" onClick={reset} className="cursor-pointer text-sm text-[var(--text-3)] transition-colors hover:text-[var(--text)]">
              Reset
            </button>
            <button type="button" onClick={share} className="cursor-pointer rounded-full bg-[var(--surface)] px-4 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--border)]">
              {copied ? "Copied" : "Share"}
            </button>
          </div>
        </header>

        {/* Hero number */}
        <section className="mb-6 sm:mb-8">
          <div className="text-[5rem] sm:text-[7rem] lg:text-[8rem] font-bold leading-[0.9] tracking-[-0.04em] tabular-nums">
            {display}
          </div>
          <p className="mt-2 text-base text-[var(--text-2)] sm:text-lg">
            people in {results.location.label}
            <span className="text-[var(--text-4)]"> &middot; 1 in {formatCount(results.rarity)}</span>
          </p>
        </section>

        {/* ============================================================ */}
        {/*  FILTERS                                                      */}
        {/* ============================================================ */}
        <section className="mb-8 space-y-5">

          {/* --- Sex (SVG icons) --- */}
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 text-[0.7rem] font-medium uppercase tracking-wider text-[var(--text-3)]">
                Sex
              </div>
              <div className="flex gap-2">
                {(["women", "men"] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => set("sex", id as SexId)}
                    className={`cursor-pointer flex items-center gap-2 rounded-md px-3 py-1.5 text-[0.8rem] leading-snug transition-all ${
                      state.sex === id
                        ? "bg-[var(--text)] text-[var(--bg)] font-medium shadow-sm"
                        : "text-[var(--text-2)] ring-1 ring-inset ring-[var(--border)] hover:ring-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
                    }`}
                  >
                    {id === "women" ? <FemaleIcon className="shrink-0" /> : <MaleIcon className="shrink-0" />}
                    <span>{id === "women" ? "Women" : "Men"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* --- Location --- */}
            <div className="sm:col-span-1">
              <div className="mb-1.5 text-[0.7rem] font-medium uppercase tracking-wider text-[var(--text-3)]">
                Location
              </div>
              <div className="flex flex-wrap gap-1.5">
                {getLocationOptions().map((o) => (
                  <Chip
                    key={o.id}
                    label={o.label}
                    active={state.location === o.id}
                    onClick={() => set("location", o.id as LocationId)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* --- Age range --- */}
          <div>
            <div className="mb-0 flex items-center justify-between">
              <span className="text-[0.7rem] font-medium uppercase tracking-wider text-[var(--text-3)]">
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

          {/* --- Attractiveness slider --- */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-[0.7rem] font-medium uppercase tracking-wider text-[var(--text-3)]">
                  Attractiveness
                </span>
                <span className="text-[0.65rem] text-[var(--text-4)]">
                  Top {Math.max(1, Math.round((10 - state.attractiveness) * 10))}%
                </span>
              </div>
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
              onChange={(e) => set("attractiveness", Number.parseFloat(e.target.value))}
            />
          </div>

          {/* --- Core compatibility --- */}
          <div className="space-y-3.5">
            <div className="text-[0.65rem] font-semibold uppercase tracking-widest text-[var(--text-3)]">
              Compatibility
            </div>
            {coreFilters.map((f) => (
              <FilterRow
                key={f.key}
                meta={f}
                value={state[f.key] as string}
                onChange={(id) => set(f.key, id as never)}
              />
            ))}
          </div>

          {/* --- Family section --- */}
          <div className="space-y-3">
            <div className="text-[0.65rem] font-semibold uppercase tracking-widest text-[var(--text-3)]">
              Family
            </div>

            {/* Wants kids / Childfree */}
            <div>
              <div className="mb-1 flex items-baseline gap-2">
                <span className={`text-[0.7rem] font-medium uppercase tracking-wider ${state.family !== "either" ? "text-[var(--text)]" : "text-[var(--text-3)]"}`}>
                  Kids
                </span>
                <span className="text-[0.65rem] text-[var(--text-4)]">Do they want children?</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {familyOpts.family.map((o) => (
                  <Chip
                    key={o.id}
                    label={o.label}
                    desc={o.desc}
                    active={state.family === o.id}
                    onClick={() => set("family", (state.family === o.id ? "either" : o.id) as FamilyId)}
                  />
                ))}
              </div>
            </div>

            {/* Conditional: kid count + timeline */}
            {state.family === "wants-kids" && (
              <>
                <div>
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className={`text-[0.7rem] font-medium uppercase tracking-wider ${state.kidCount !== "either" ? "text-[var(--text)]" : "text-[var(--text-3)]"}`}>
                      How many
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {familyOpts.kidCount.map((o) => (
                      <Chip
                        key={o.id}
                        label={o.label}
                        desc={o.desc}
                        active={state.kidCount === o.id}
                        onClick={() => set("kidCount", (state.kidCount === o.id ? "either" : o.id) as KidCountId)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className={`text-[0.7rem] font-medium uppercase tracking-wider ${state.kidTimeline !== "either" ? "text-[var(--text)]" : "text-[var(--text-3)]"}`}>
                      When
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {familyOpts.kidTimeline.map((o) => (
                      <Chip
                        key={o.id}
                        label={o.label}
                        desc={o.desc}
                        active={state.kidTimeline === o.id}
                        onClick={() => set("kidTimeline", (state.kidTimeline === o.id ? "either" : o.id) as KidTimelineId)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Already has kids */}
            <div>
              <div className="mb-1 flex items-baseline gap-2">
                <span className={`text-[0.7rem] font-medium uppercase tracking-wider ${state.hasKids !== "either" ? "text-[var(--text)]" : "text-[var(--text-3)]"}`}>
                  Existing kids
                </span>
                <span className="text-[0.65rem] text-[var(--text-4)]">From a prior relationship</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {familyOpts.hasKids.map((o) => (
                  <Chip
                    key={o.id}
                    label={o.label}
                    desc={o.desc}
                    active={state.hasKids === o.id}
                    onClick={() => set("hasKids", (state.hasKids === o.id ? "either" : o.id) as HasKidsId)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* --- Lifestyle (collapsible) --- */}
          <SectionHeader
            label="Lifestyle"
            subtitle="Smoking, drinking, education, pets"
            badge={lifestyleActive}
            open={lifestyleOpen}
            onToggle={() => setLifestyleOpen((v) => !v)}
          />
          {lifestyleOpen && (
            <div className="space-y-3.5 rounded-lg border border-[var(--border)] px-4 py-4">
              {lifestyleFilters.map((f) => (
                <FilterRow
                  key={f.key}
                  meta={f}
                  value={state[f.key] as string}
                  onChange={(id) => set(f.key, id as never)}
                />
              ))}
            </div>
          )}

          {/* --- Dating reality (collapsible) --- */}
          <SectionHeader
            label="Your Dating Reality"
            subtitle="How good are you at getting — and keeping — dates?"
            badge={realityActive}
            open={realityOpen}
            onToggle={() => setRealityOpen((v) => !v)}
          />
          {realityOpen && (
            <div className="space-y-5 rounded-lg border border-[var(--border)] px-4 py-4">
              <p className="text-[0.75rem] leading-relaxed text-[var(--text-3)]">
                Rate yourself honestly. 10 means no filter applied — everyone in the pool is reachable.
                Lower scores model the real-world gap between &ldquo;compatible on paper&rdquo; and
                &ldquo;actually in a relationship.&rdquo;
              </p>

              {/* Approach slider */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-[0.7rem] font-medium uppercase tracking-wider ${state.approachAbility < 10 ? "text-[var(--text)]" : "text-[var(--text-3)]"}`}>
                      Getting to a first date
                    </span>
                    <span className="text-[0.65rem] text-[var(--text-4)]">
                      {state.approachAbility >= 10 ? "no filter" : `keeps ${(approachProbability(state.approachAbility) * 100).toFixed(0)}%`}
                    </span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{state.approachAbility.toFixed(0)}/10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={state.approachAbility}
                  onChange={(e) => set("approachAbility", Number.parseFloat(e.target.value))}
                />
                <div className="mt-1 flex justify-between text-[0.6rem] text-[var(--text-4)]">
                  <span>Shy / rarely meet people</span>
                  <span>No filter</span>
                </div>
              </div>

              {/* Conversion slider */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-[0.7rem] font-medium uppercase tracking-wider ${state.conversionAbility < 10 ? "text-[var(--text)]" : "text-[var(--text-3)]"}`}>
                      Date → relationship
                    </span>
                    <span className="text-[0.65rem] text-[var(--text-4)]">
                      {state.conversionAbility >= 10 ? "no filter" : `keeps ${(conversionProbability(state.conversionAbility) * 100).toFixed(0)}%`}
                    </span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{state.conversionAbility.toFixed(0)}/10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={state.conversionAbility}
                  onChange={(e) => set("conversionAbility", Number.parseFloat(e.target.value))}
                />
                <div className="mt-1 flex justify-between text-[0.6rem] text-[var(--text-4)]">
                  <span>Dates rarely go anywhere</span>
                  <span>No filter</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Dot grid */}
        <section className="mb-10">
          <PopulationCanvas
            probability={results.probability}
            hasMatches={results.rawRemainingNational > 0}
          />
        </section>

        {/* Funnel */}
        <section className="mb-8">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-[var(--text-3)]">The Funnel</h2>

          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-sm font-medium">{results.cohort.label}</span>
            <span className="text-sm font-medium tabular-nums">{formatCount(results.cohort.baseCount)}</span>
          </div>
          <div className="mb-4 h-1 rounded-full bg-[var(--text)]" />

          {funnel.map((step) => (
            <div key={step.label}>
              <div className="mb-1 flex items-baseline justify-between gap-4">
                <div className="min-w-0 text-sm text-[var(--text-2)]">
                  <span>{step.label}</span>
                  <span className="ml-1.5 text-xs text-[var(--text-4)]">{formatPercent(step.keep)}</span>
                </div>
                <span className="shrink-0 text-sm font-medium tabular-nums">{formatCount(step.remaining)}</span>
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
              <span className="ml-1.5 text-xs text-[var(--text-4)]">{(results.location.shareOfPopulation * 100).toFixed(1)}%</span>
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums">{formatCount(results.rawRemainingLocal)}</span>
          </div>
          <div className="h-1 rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-[var(--text)] transition-all duration-500 ease-out"
              style={{ width: `${localBar}%` }}
            />
          </div>
        </section>

        {/* Insight */}
        {results.insights[0] && (
          <p className="mb-10 border-l-2 border-[var(--border)] pl-4 text-sm leading-relaxed text-[var(--text-3)]">
            {results.insights[0]}
          </p>
        )}

        {/* Footer */}
        <footer className="pb-8 text-center">
          <button
            type="button"
            onClick={share}
            className="cursor-pointer rounded-full bg-[var(--text)] px-8 py-3 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-80"
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
