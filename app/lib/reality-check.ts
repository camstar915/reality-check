export type SexId = "women" | "men";
export type WorldviewId = "aligned" | "secular-trad" | "either";
export type FamilyId = "high" | "medium" | "either";
export type SocialId = "low-private" | "selective" | "either";
export type HumorId = "specific-click" | "good-vibe" | "either";
export type LocationId = "united-states" | "illinois" | "chicago" | "texas";

export type SearchState = {
  sex: SexId;
  ageMin: number;
  ageMax: number;
  worldview: WorldviewId;
  family: FamilyId;
  social: SocialId;
  humor: HumorId;
  location: LocationId;
  attractiveness: number;
};

type BaseOption<T extends string> = {
  id: T;
  label: string;
  probability: number;
  source: string;
  description: string;
};

/** Baseline pool label + count for the funnel (derived from sex + age). */
export type CohortSummary = {
  label: string;
  baseCount: number;
  description: string;
  source: string;
};

type LocationOption = {
  id: LocationId;
  label: string;
  shareOfPopulation: number;
  description: string;
};

type FactorSummary = {
  id: string;
  label: string;
  probability: number;
  source: string;
  description: string;
};

export type ComputedFunnel = {
  cohort: CohortSummary;
  location: LocationOption;
  factors: FactorSummary[];
  probability: number;
  rawRemainingNational: number;
  rawRemainingLocal: number;
  nationalRounded: number;
  localRounded: number;
  rarity: number;
  topConstraints: FactorSummary[];
  insights: string[];
};

const worldviewOptions: BaseOption<WorldviewId>[] = [
  {
    id: "aligned",
    label: "Broad political and values alignment",
    probability: 0.21,
    source: "Research lane: Pew / Gallup worldview alignment",
    description: "Captures a fairly specific ideological match, but not the rarest possible one.",
  },
  {
    id: "secular-trad",
    label: "Secular-trad paradox",
    probability: 0.057,
    source: "Research lane: values overlap and institutional skepticism",
    description: "Models the especially rare mix of traditional instincts with skepticism toward dogmatic institutions.",
  },
  {
    id: "either",
    label: "No worldview filter",
    probability: 1,
    source: "No additional filter",
    description: "Leaves worldview compatibility out of the estimate.",
  },
];

const familyOptions: BaseOption<FamilyId>[] = [
  {
    id: "high",
    label: "Strong family and parenting fit",
    probability: 0.3,
    source: "Research lane: parenting and family-culture compatibility",
    description: "Represents a high-confidence match on parenting instincts, family dynamic, and long-term culture fit.",
  },
  {
    id: "medium",
    label: "Generally compatible on family life",
    probability: 0.55,
    source: "Research lane: parenting and family-culture compatibility",
    description: "Keeps standards but assumes more room for nuance and adaptation.",
  },
  {
    id: "either",
    label: "No family-culture filter",
    probability: 1,
    source: "No additional filter",
    description: "Leaves this compatibility layer out of the funnel.",
  },
];

const socialOptions: BaseOption<SocialId>[] = [
  {
    id: "low-private",
    label: "Low / private social media presence",
    probability: 0.2,
    source: "Research lane: Statista / GWI social media behavior",
    description: "Models the desire for someone who is not immersed in performative online culture.",
  },
  {
    id: "selective",
    label: "Selective and non-performative online presence",
    probability: 0.45,
    source: "Research lane: Statista / GWI social media behavior",
    description: "Assumes they use social products, but do not build identity around them.",
  },
  {
    id: "either",
    label: "No social-media filter",
    probability: 1,
    source: "No additional filter",
    description: "Leaves digital-lifestyle concerns out of the funnel.",
  },
];

const humorOptions: BaseOption<HumorId>[] = [
  {
    id: "specific-click",
    label: "Specific humor / chemistry click",
    probability: 0.25,
    source: "Research lane: interpersonal compatibility estimates",
    description: "Treats shared humor as a real narrowing factor, not a bonus feature.",
  },
  {
    id: "good-vibe",
    label: "Good general chemistry",
    probability: 0.55,
    source: "Research lane: interpersonal compatibility estimates",
    description: "Allows for strong rapport without requiring an unusually precise personality fit.",
  },
  {
    id: "either",
    label: "No chemistry filter",
    probability: 1,
    source: "No additional filter",
    description: "Leaves chemistry out of the model.",
  },
];

const locationOptions: LocationOption[] = [
  {
    id: "united-states",
    label: "United States",
    shareOfPopulation: 1,
    description: "National estimate.",
  },
  {
    id: "illinois",
    label: "Illinois",
    shareOfPopulation: 0.038,
    description: "Proxy share of the U.S. population for a state-level estimate.",
  },
  {
    id: "chicago",
    label: "Chicago metro",
    shareOfPopulation: 0.0267,
    description: "Matches the metro framing used in the original conversation.",
  },
  {
    id: "texas",
    label: "Texas",
    shareOfPopulation: 0.089,
    description: "Useful for seeing how a larger state changes the local count.",
  },
];

export const defaultState: SearchState = {
  sex: "women",
  ageMin: 25,
  ageMax: 30,
  worldview: "aligned",
  family: "high",
  social: "low-private",
  humor: "specific-click",
  location: "chicago",
  attractiveness: 8.5,
};

const AGE_MIN = 18;
const AGE_MAX = 55;

type SearchParamSource =
  | URLSearchParams
  | ReadonlyURLSearchParams
  | Record<string, string | string[] | undefined>;

type ReadonlyURLSearchParams = {
  get(name: string): string | null;
};

function readValue(source: SearchParamSource, key: string) {
  const maybeGet = (source as { get?: (name: string) => string | null }).get;

  if (typeof maybeGet === "function") {
    return maybeGet(key) ?? undefined;
  }

  const value = (source as Record<string, string | string[] | undefined>)[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function asKey<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T
) {
  if (value && allowed.includes(value as T)) {
    return value as T;
  }

  return fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function linearInterp(
  x: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number
) {
  if (x1 === x0) return y0;
  const t = clamp((x - x0) / (x1 - x0), 0, 1);
  return y0 + t * (y1 - y0);
}

function interpSeries(x: number, points: readonly [number, number][]) {
  if (x <= points[0][0]) return points[0][1];
  for (let i = 0; i < points.length - 1; i += 1) {
    if (x <= points[i + 1][0]) {
      return linearInterp(
        x,
        points[i][0],
        points[i][1],
        points[i + 1][0],
        points[i + 1][1]
      );
    }
  }
  return points[points.length - 1][1];
}

/** Rough single-sex US cohort size by age (mock, piecewise linear between census-style anchors). */
export function baseCountForSexAndAge(sex: SexId, age: number): number {
  const a = clamp(age, AGE_MIN, AGE_MAX);
  if (sex === "women") {
    const pts: [number, number][] = [
      [18, 9_500_000],
      [22, 11_200_000],
      [27.5, 27_080_000],
      [32.5, 28_900_000],
      [37, 27_000_000],
      [45, 22_000_000],
      [55, 16_000_000],
    ];
    return Math.round(interpSeries(a, pts));
  }
  const pts: [number, number][] = [
    [18, 9_800_000],
    [22, 11_500_000],
    [27.5, 27_600_000],
    [32.5, 29_500_000],
    [37, 28_000_000],
    [45, 24_000_000],
    [55, 17_000_000],
  ];
  return Math.round(interpSeries(a, pts));
}

export function formatAgeLabel(age: number) {
  const rounded = Math.round(age * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
}

/** Clamp, round to 0.5, and order min ≤ max. */
export function normalizeAgeRange(ageMin: number, ageMax: number) {
  let lo = Math.round(clamp(ageMin, AGE_MIN, AGE_MAX) * 10) / 10;
  let hi = Math.round(clamp(ageMax, AGE_MIN, AGE_MAX) * 10) / 10;
  if (lo > hi) {
    [lo, hi] = [hi, lo];
  }
  return { ageMin: lo, ageMax: hi };
}

const REF_COHORT_SPAN_YEARS = 5;

/**
 * Pool size for an age band: point estimates are treated as ~5-year cohort totals at the band midpoint,
 * then scaled by (span / 5) so a 25–30 band matches the original mock anchors.
 */
export function baseCountForSexAndAgeRange(
  sex: SexId,
  ageMin: number,
  ageMax: number
): number {
  const { ageMin: lo, ageMax: hi } = normalizeAgeRange(ageMin, ageMax);
  const span = hi - lo;
  if (span < 0.25) {
    return baseCountForSexAndAge(sex, (lo + hi) / 2);
  }
  const mid = (lo + hi) / 2;
  const midCount = baseCountForSexAndAge(sex, mid);
  return Math.round(
    midCount * (span / REF_COHORT_SPAN_YEARS)
  );
}

export function formatAgeRangeLabel(ageMin: number, ageMax: number) {
  const { ageMin: lo, ageMax: hi } = normalizeAgeRange(ageMin, ageMax);
  const a = formatAgeLabel(lo);
  const b = formatAgeLabel(hi);
  return a === b ? a : `${a}–${b}`;
}

function buildCohortSummary(
  sex: SexId,
  ageMin: number,
  ageMax: number
): CohortSummary {
  const baseCount = baseCountForSexAndAgeRange(sex, ageMin, ageMax);
  const sexWord = sex === "women" ? "Women" : "Men";
  const range = formatAgeRangeLabel(ageMin, ageMax);
  const { ageMin: lo, ageMax: hi } = normalizeAgeRange(ageMin, ageMax);
  const singleAge = hi - lo < 0.25;
  return {
    label: singleAge
      ? `${sexWord}, age ${range}`
      : `${sexWord}, ages ${range}`,
    baseCount,
    description:
      "Approximate US single-sex population in the selected age band (interpolated mock, scaled by band width).",
    source: "Research lane: U.S. Census-style cohort counts",
  };
}

function getWorldview(id: WorldviewId) {
  return worldviewOptions.find((option) => option.id === id) ?? worldviewOptions[0];
}

function getFamily(id: FamilyId) {
  return familyOptions.find((option) => option.id === id) ?? familyOptions[0];
}

function getSocial(id: SocialId) {
  return socialOptions.find((option) => option.id === id) ?? socialOptions[0];
}

function getHumor(id: HumorId) {
  return humorOptions.find((option) => option.id === id) ?? humorOptions[0];
}

function getLocation(id: LocationId) {
  return locationOptions.find((option) => option.id === id) ?? locationOptions[0];
}

/** Legacy ?cohort= URLs from before sex + age were split. */
function cohortLegacyToSexAgeRange(
  cohort: string | undefined
): { sex: SexId; ageMin: number; ageMax: number } | null {
  switch (cohort) {
    case "women-25-30":
      return { sex: "women", ageMin: 25, ageMax: 30 };
    case "women-30-35":
      return { sex: "women", ageMin: 30, ageMax: 35 };
    case "men-25-30":
      return { sex: "men", ageMin: 25, ageMax: 30 };
    default:
      return null;
  }
}

export function parseSearchState(source: SearchParamSource): SearchState {
  const attractivenessValue = Number.parseFloat(readValue(source, "att") ?? "");
  const sexParam = readValue(source, "sex");
  const ageMinParam = readValue(source, "ageMin");
  const ageMaxParam = readValue(source, "ageMax");
  const ageParam = readValue(source, "age");
  const legacy = cohortLegacyToSexAgeRange(readValue(source, "cohort"));

  const hasAgeRangeParams =
    ageMinParam !== undefined || ageMaxParam !== undefined;

  let sex: SexId;
  let ageMin: number;
  let ageMax: number;

  if (legacy && sexParam === undefined && !hasAgeRangeParams) {
    sex = legacy.sex;
    ({ ageMin, ageMax } = normalizeAgeRange(legacy.ageMin, legacy.ageMax));
  } else {
    sex = asKey(sexParam, ["women", "men"] as const, defaultState.sex);

    const amin = Number.parseFloat(ageMinParam ?? "");
    const amax = Number.parseFloat(ageMaxParam ?? "");
    const single = Number.parseFloat(ageParam ?? "");

    if (Number.isFinite(amin) && Number.isFinite(amax)) {
      ({ ageMin, ageMax } = normalizeAgeRange(amin, amax));
    } else if (Number.isFinite(single)) {
      const v = Math.round(clamp(single, AGE_MIN, AGE_MAX) * 10) / 10;
      ageMin = v;
      ageMax = v;
    } else if (Number.isFinite(amin)) {
      ({ ageMin, ageMax } = normalizeAgeRange(amin, defaultState.ageMax));
    } else if (Number.isFinite(amax)) {
      ({ ageMin, ageMax } = normalizeAgeRange(defaultState.ageMin, amax));
    } else {
      ageMin = defaultState.ageMin;
      ageMax = defaultState.ageMax;
    }
  }

  return {
    sex,
    ageMin,
    ageMax,
    worldview: asKey(
      readValue(source, "worldview"),
      worldviewOptions.map((option) => option.id),
      defaultState.worldview
    ),
    family: asKey(
      readValue(source, "family"),
      familyOptions.map((option) => option.id),
      defaultState.family
    ),
    social: asKey(
      readValue(source, "social"),
      socialOptions.map((option) => option.id),
      defaultState.social
    ),
    humor: asKey(
      readValue(source, "humor"),
      humorOptions.map((option) => option.id),
      defaultState.humor
    ),
    location: asKey(
      readValue(source, "location"),
      locationOptions.map((option) => option.id),
      defaultState.location
    ),
    attractiveness: Number.isFinite(attractivenessValue)
      ? Math.round(clamp(attractivenessValue, 0, 10) * 10) / 10
      : defaultState.attractiveness,
  };
}

export function serializeSearchState(state: SearchState) {
  const params = new URLSearchParams();
  params.set("sex", state.sex);
  const { ageMin, ageMax } = normalizeAgeRange(state.ageMin, state.ageMax);
  params.set("ageMin", ageMin.toFixed(1));
  params.set("ageMax", ageMax.toFixed(1));
  params.set("worldview", state.worldview);
  params.set("family", state.family);
  params.set("social", state.social);
  params.set("humor", state.humor);
  params.set("location", state.location);
  params.set("att", state.attractiveness.toFixed(1));
  return params.toString();
}

function factorLabelWhenOff(
  kind: "worldview" | "family" | "social" | "humor",
  option: BaseOption<string>
) {
  if (option.probability >= 1) {
    switch (kind) {
      case "worldview":
        return "Worldview — not applied";
      case "family":
        return "Family — not applied";
      case "social":
        return "Digital presence — not applied";
      case "humor":
        return "Chemistry — not applied";
      default:
        return option.label;
    }
  }
  return option.label;
}

function buildInsights(state: SearchState, computed: Omit<ComputedFunnel, "insights">) {
  const insights: string[] = [];

  if (state.worldview === "secular-trad") {
    insights.push(
      "You selected the secular-trad paradox: a mix of traditional instincts and skepticism toward dogmatic institutions. That overlap is one of the steepest cliffs in the funnel."
    );
  }

  if (state.attractiveness >= 9) {
    insights.push(
      "A top-10-percent attraction threshold sounds ordinary online, but it becomes dramatically rarer in the physical world. This is where the calibration exercise matters most."
    );
  }

  if (state.social === "low-private") {
    insights.push(
      "Filtering for a low-profile digital life removes a huge part of the modern cohort. That does not make the preference wrong, but it does make it expensive."
    );
  }

  if (computed.rawRemainingLocal < 25) {
    insights.push(
      "At this level, broad swiping is a weak strategy. The model suggests that concentrated, high-intent environments outperform mass-exposure dating."
    );
  }

  if (insights.length === 0) {
    insights.push(
      "This version of the funnel still leaves a meaningful pool. The visual is meant to help you decide which filters feel truly essential and which ones might be digital noise."
    );
  }

  return insights;
}

export function computeFunnel(state: SearchState): ComputedFunnel {
  const cohort = buildCohortSummary(state.sex, state.ageMin, state.ageMax);
  const worldview = getWorldview(state.worldview);
  const family = getFamily(state.family);
  const social = getSocial(state.social);
  const humor = getHumor(state.humor);
  const location = getLocation(state.location);
  const attractivenessPercent = Math.max(1, Math.round((10 - state.attractiveness) * 10));

  const factors: FactorSummary[] = [
    {
      id: "attractiveness",
      label: `Top ${attractivenessPercent}% attractiveness`,
      probability: attractivenessPercent / 100,
      source: "Calibration lane: user-defined percentile",
      description:
        "This starts as a self-rating exercise. The production version would guide users to calibrate this against real-world observation.",
    },
    {
      id: "worldview",
      label: factorLabelWhenOff("worldview", worldview),
      probability: worldview.probability,
      source: worldview.source,
      description: worldview.description,
    },
    {
      id: "family",
      label: factorLabelWhenOff("family", family),
      probability: family.probability,
      source: family.source,
      description: family.description,
    },
    {
      id: "social",
      label: factorLabelWhenOff("social", social),
      probability: social.probability,
      source: social.source,
      description: social.description,
    },
    {
      id: "humor",
      label: factorLabelWhenOff("humor", humor),
      probability: humor.probability,
      source: humor.source,
      description: humor.description,
    },
  ];

  const probability = factors.reduce(
    (runningTotal, factor) => runningTotal * factor.probability,
    1
  );
  const rawRemainingNational = cohort.baseCount * probability;
  const rawRemainingLocal = rawRemainingNational * location.shareOfPopulation;
  const nationalRounded = Math.round(rawRemainingNational);
  const localRounded = Math.round(rawRemainingLocal);
  const rarity = rawRemainingNational > 0 ? cohort.baseCount / rawRemainingNational : 0;

  const baseComputed = {
    cohort,
    location,
    factors,
    probability,
    rawRemainingNational,
    rawRemainingLocal,
    nationalRounded,
    localRounded,
    rarity,
    topConstraints: [...factors]
      .sort((a, b) => a.probability - b.probability)
      .slice(0, 3),
  };

  return {
    ...baseComputed,
    insights: buildInsights(state, baseComputed),
  };
}

export function formatCount(value: number) {
  if (value < 1) {
    return "fewer than 1";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatCompact(value: number) {
  if (value < 1) {
    return "<1";
  }

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: value < 100 ? 1 : 0,
  }).format(value);
}

export function formatPercent(value: number) {
  const pct = value * 100;
  if (pct < 0.01) return "<0.01%";
  if (pct < 0.1) return `${pct.toFixed(2)}%`;
  if (pct < 1) return `${pct.toFixed(1)}%`;
  return `${pct.toFixed(0)}%`;
}

export function getSourceCards() {
  return [
    {
      title: "Population baseline",
      body: "The experience starts from a real demographic cohort and then applies progressively stricter filters rather than inventing a fantasy population from scratch.",
      source: "U.S. Census-style cohort data",
    },
    {
      title: "Values and politics",
      body: "Worldview filters should be grounded in polling and overlap analysis, not vibes. The production version should date-stamp every estimate and show the exact survey source.",
      source: "Pew, Gallup, major public polling",
    },
    {
      title: "Digital lifestyle",
      body: "The social-media filter exists because the product is trying to counter the distortions created by digital performance culture in the first place.",
      source: "Statista, GWI, platform behavior reports",
    },
    {
      title: "Compatibility layer",
      body: "Shared humor, family fit, and parenting culture are the hardest variables. The point is not false precision; it is to make hidden scarcity visible.",
      source: "Behavioral proxies and transparent assumptions",
    },
  ];
}

export function getSexOptions(): { id: SexId; label: string }[] {
  return [
    { id: "women", label: "Women" },
    { id: "men", label: "Men" },
  ];
}

export function getLocationOptions() {
  return locationOptions;
}

export const ageBounds = { min: AGE_MIN, max: AGE_MAX } as const;
