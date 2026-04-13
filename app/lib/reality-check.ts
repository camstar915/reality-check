export type SexId = "women" | "men";

export type WorldviewId =
  | "progressive"
  | "moderate"
  | "conservative"
  | "libertarian"
  | "apolitical"
  | "either";

export type FamilyId = "wants-kids" | "childfree" | "either";
export type KidCountId = "few" | "many" | "either";
export type KidTimelineId = "soon" | "eventually" | "either";
export type HasKidsId = "no-kids" | "has-kids-ok" | "either";

export type SocialId = "no-social" | "low-private" | "selective" | "either";

export type HumorId = "specific-click" | "good-vibe" | "either";

export type SmokingId = "never" | "sometimes" | "either";
export type DrinkingId = "never" | "social" | "either";
export type PetsId = "dog-person" | "cat-person" | "any-pets" | "no-pets" | "either";
export type EducationId = "bachelors-plus" | "any-degree" | "either";
export type FaithId = "religious" | "spiritual" | "secular" | "either";

export type LocationId =
  | "united-states"
  | "new-york-metro"
  | "los-angeles-metro"
  | "chicago"
  | "dallas-fw"
  | "houston"
  | "miami"
  | "denver"
  | "atlanta"
  | "california"
  | "texas"
  | "florida"
  | "illinois";

export type SearchState = {
  sex: SexId;
  ageMin: number;
  ageMax: number;
  worldview: WorldviewId;
  family: FamilyId;
  kidCount: KidCountId;
  kidTimeline: KidTimelineId;
  hasKids: HasKidsId;
  social: SocialId;
  humor: HumorId;
  smoking: SmokingId;
  drinking: DrinkingId;
  pets: PetsId;
  education: EducationId;
  faith: FaithId;
  approachAbility: number;
  conversionAbility: number;
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

/* ------------------------------------------------------------------ */
/*  Options tables                                                     */
/* ------------------------------------------------------------------ */

const worldviewOptions: BaseOption<WorldviewId>[] = [
  {
    id: "progressive",
    label: "Progressive",
    probability: 0.26,
    source: "Gallup 2024 ideology self-identification",
    description: "Liberal or progressive on social and economic issues.",
  },
  {
    id: "moderate",
    label: "Moderate",
    probability: 0.34,
    source: "Gallup 2024 ideology self-identification",
    description: "Politically moderate or centrist, no strong partisan lean.",
  },
  {
    id: "conservative",
    label: "Conservative",
    probability: 0.36,
    source: "Gallup 2024 ideology self-identification",
    description: "Conservative on social and economic issues.",
  },
  {
    id: "libertarian",
    label: "Libertarian",
    probability: 0.044,
    source: "PRRI American Values Atlas, Pew typology",
    description: "Socially liberal, fiscally conservative, skeptical of government.",
  },
  {
    id: "apolitical",
    label: "Apolitical",
    probability: 0.15,
    source: "Pew Research: politically disengaged segment",
    description: "Low political engagement, doesn't follow a political camp.",
  },
  {
    id: "either",
    label: "No filter",
    probability: 1,
    source: "No additional filter",
    description: "Leaves worldview compatibility out of the estimate.",
  },
];

const familyOptions: BaseOption<FamilyId>[] = [
  {
    id: "wants-kids",
    label: "Wants kids",
    probability: 0.55,
    source: "Pew 2023: adults who want children",
    description: "Wants to have children at some point.",
  },
  {
    id: "childfree",
    label: "Childfree",
    probability: 0.12,
    source: "Pew 2023: adults who definitely do not want children",
    description: "Does not want children, ever.",
  },
  {
    id: "either",
    label: "No filter",
    probability: 1,
    source: "No additional filter",
    description: "Leaves family planning out of the funnel.",
  },
];

const kidCountOptions: BaseOption<KidCountId>[] = [
  {
    id: "few",
    label: "A few (1–2)",
    probability: 0.62,
    source: "Gallup: ideal family size among those who want kids",
    description: "Wants one or two children.",
  },
  {
    id: "many",
    label: "A lot (3+)",
    probability: 0.28,
    source: "Gallup: ideal family size among those who want kids",
    description: "Wants three or more children.",
  },
  {
    id: "either",
    label: "No filter",
    probability: 1,
    source: "No additional filter",
    description: "No preference on number of kids.",
  },
];

const kidTimelineOptions: BaseOption<KidTimelineId>[] = [
  {
    id: "soon",
    label: "Soon (1–3 yrs)",
    probability: 0.32,
    source: "Pew: timeline preferences among adults wanting children",
    description: "Wants to start having kids within the next few years.",
  },
  {
    id: "eventually",
    label: "Eventually",
    probability: 0.60,
    source: "Pew: timeline preferences among adults wanting children",
    description: "Wants kids someday but is in no rush.",
  },
  {
    id: "either",
    label: "No filter",
    probability: 1,
    source: "No additional filter",
    description: "No preference on timeline.",
  },
];

const hasKidsOptions: BaseOption<HasKidsId>[] = [
  {
    id: "no-kids",
    label: "No existing kids",
    probability: 0.55,
    source: "Census 2023: ~45% of women 15–50 have had a child (age-adjusted)",
    description: "Does not already have children from a prior relationship.",
  },
  {
    id: "has-kids-ok",
    label: "Has kids, that's fine",
    probability: 0.90,
    source: "Pew: most singles open to dating a parent",
    description: "Already has children and you're comfortable with that.",
  },
  {
    id: "either",
    label: "No filter",
    probability: 1,
    source: "No additional filter",
    description: "Leaves existing-children status out of the funnel.",
  },
];

const socialOptions: BaseOption<SocialId>[] = [
  {
    id: "no-social",
    label: "No social media",
    probability: 0.12,
    source: "Pew 2024: adults who use no social media platforms",
    description: "Not on any social media platform at all.",
  },
  {
    id: "low-private",
    label: "Low / private",
    probability: 0.22,
    source: "Statista / GWI: light or private-only users",
    description: "Has accounts but rarely posts. Passive or private use only.",
  },
  {
    id: "selective",
    label: "Normal, non-performative",
    probability: 0.50,
    source: "Statista / GWI social media behavior",
    description: "Active on social media but not building a personal brand around it.",
  },
  {
    id: "either",
    label: "No filter",
    probability: 1,
    source: "No additional filter",
    description: "Leaves digital-lifestyle concerns out of the funnel.",
  },
];

const humorOptions: BaseOption<HumorId>[] = [
  {
    id: "specific-click",
    label: "Rare, specific click",
    probability: 0.20,
    source: "Interpersonal compatibility estimates (behavioral proxies)",
    description: "The kind of match where you finish each other's jokes. Hard to find.",
  },
  {
    id: "good-vibe",
    label: "Good general chemistry",
    probability: 0.50,
    source: "Interpersonal compatibility estimates (behavioral proxies)",
    description: "Enjoy each other's company and laugh together without needing a mind-meld.",
  },
  {
    id: "either",
    label: "No filter",
    probability: 1,
    source: "No additional filter",
    description: "Leaves chemistry out of the model.",
  },
];

const smokingOptions: BaseOption<SmokingId>[] = [
  {
    id: "never",
    label: "Non-smoker",
    probability: 0.74,
    source: "CDC 2023: 11.6% smoke, ~14% vape/use nicotine",
    description: "No cigarettes, no vaping, no nicotine.",
  },
  {
    id: "sometimes",
    label: "Social / occasional OK",
    probability: 0.88,
    source: "CDC 2023: includes occasional and social smokers",
    description: "Might smoke at a party but not a daily habit.",
  },
  {
    id: "either",
    label: "No filter",
    probability: 1,
    source: "No additional filter",
    description: "Leaves smoking out of the funnel.",
  },
];

const drinkingOptions: BaseOption<DrinkingId>[] = [
  {
    id: "never",
    label: "Doesn't drink",
    probability: 0.37,
    source: "Gallup 2023: 37% of US adults do not drink alcohol",
    description: "No alcohol, for any reason.",
  },
  {
    id: "social",
    label: "Social drinker",
    probability: 0.80,
    source: "Gallup 2023: includes light and social drinkers",
    description: "Drinks occasionally in social settings. Not a heavy drinker.",
  },
  {
    id: "either",
    label: "No filter",
    probability: 1,
    source: "No additional filter",
    description: "Leaves drinking out of the funnel.",
  },
];

const petsOptions: BaseOption<PetsId>[] = [
  {
    id: "dog-person",
    label: "Dog person",
    probability: 0.44,
    source: "APPA 2024: 44% of US households have a dog",
    description: "Has or wants dogs.",
  },
  {
    id: "cat-person",
    label: "Cat person",
    probability: 0.29,
    source: "APPA 2024: 29% of US households have a cat",
    description: "Has or wants cats.",
  },
  {
    id: "any-pets",
    label: "Likes animals",
    probability: 0.67,
    source: "APPA 2024: 67% of US households have a pet",
    description: "Open to living with any kind of pet.",
  },
  {
    id: "no-pets",
    label: "No pets",
    probability: 0.33,
    source: "APPA 2024: 33% of US households have no pets",
    description: "Doesn't have or want animals in the house.",
  },
  {
    id: "either",
    label: "No filter",
    probability: 1,
    source: "No additional filter",
    description: "Leaves pet preferences out of the funnel.",
  },
];

const educationOptions: BaseOption<EducationId>[] = [
  {
    id: "bachelors-plus",
    label: "Bachelor's degree+",
    probability: 0.33,
    source: "Census 2023: 33.7% of adults 25+ have a bachelor's or higher",
    description: "Has completed at least a four-year college degree.",
  },
  {
    id: "any-degree",
    label: "Some college+",
    probability: 0.61,
    source: "Census 2023: 61% of adults have some college or more",
    description: "At least some post-secondary education.",
  },
  {
    id: "either",
    label: "No filter",
    probability: 1,
    source: "No additional filter",
    description: "Leaves education out of the funnel.",
  },
];

const faithOptions: BaseOption<FaithId>[] = [
  {
    id: "religious",
    label: "Actively religious",
    probability: 0.25,
    source: "Pew 2024: attend religious services weekly or more",
    description: "Religion is a central part of their life and practice.",
  },
  {
    id: "spiritual",
    label: "Spiritual, not religious",
    probability: 0.22,
    source: "Pew 2023: spiritual but not religiously affiliated",
    description: "Believes in something bigger but doesn't follow organized religion.",
  },
  {
    id: "secular",
    label: "Secular",
    probability: 0.28,
    source: "Pew 2024: religiously unaffiliated (nones)",
    description: "Does not practice or identify with any religion.",
  },
  {
    id: "either",
    label: "No filter",
    probability: 1,
    source: "No additional filter",
    description: "Leaves faith out of the funnel.",
  },
];

const locationOptions: LocationOption[] = [
  { id: "united-states", label: "United States", shareOfPopulation: 1, description: "National estimate" },
  { id: "new-york-metro", label: "New York metro", shareOfPopulation: 0.058, description: "NYC tri-state metro area" },
  { id: "los-angeles-metro", label: "Los Angeles metro", shareOfPopulation: 0.039, description: "Greater LA area" },
  { id: "chicago", label: "Chicago metro", shareOfPopulation: 0.0267, description: "Chicagoland area" },
  { id: "dallas-fw", label: "Dallas–Fort Worth", shareOfPopulation: 0.024, description: "DFW metro" },
  { id: "houston", label: "Houston metro", shareOfPopulation: 0.021, description: "Greater Houston" },
  { id: "miami", label: "Miami metro", shareOfPopulation: 0.019, description: "South Florida metro" },
  { id: "atlanta", label: "Atlanta metro", shareOfPopulation: 0.019, description: "Metro Atlanta" },
  { id: "denver", label: "Denver metro", shareOfPopulation: 0.0098, description: "Front Range metro" },
  { id: "california", label: "California", shareOfPopulation: 0.117, description: "State-level estimate" },
  { id: "texas", label: "Texas", shareOfPopulation: 0.089, description: "State-level estimate" },
  { id: "florida", label: "Florida", shareOfPopulation: 0.068, description: "State-level estimate" },
  { id: "illinois", label: "Illinois", shareOfPopulation: 0.038, description: "State-level estimate" },
];

export const defaultState: SearchState = {
  sex: "women",
  ageMin: 25,
  ageMax: 30,
  worldview: "either",
  family: "wants-kids",
  kidCount: "either",
  kidTimeline: "either",
  hasKids: "either",
  social: "either",
  humor: "good-vibe",
  smoking: "either",
  drinking: "either",
  pets: "either",
  education: "either",
  faith: "either",
  approachAbility: 10,
  conversionAbility: 10,
  location: "chicago",
  attractiveness: 7,
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
  if (Array.isArray(value)) return value[0];
  return value;
}

function asKey<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T
) {
  if (value && allowed.includes(value as T)) return value as T;
  return fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function linearInterp(x: number, x0: number, y0: number, x1: number, y1: number) {
  if (x1 === x0) return y0;
  const t = clamp((x - x0) / (x1 - x0), 0, 1);
  return y0 + t * (y1 - y0);
}

function interpSeries(x: number, points: readonly [number, number][]) {
  if (x <= points[0][0]) return points[0][1];
  for (let i = 0; i < points.length - 1; i += 1) {
    if (x <= points[i + 1][0]) {
      return linearInterp(x, points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
    }
  }
  return points[points.length - 1][1];
}

export function approachProbability(ability: number): number {
  if (ability >= 10) return 1;
  return interpSeries(clamp(ability, 1, 10), [
    [1, 0.02], [3, 0.05], [5, 0.10], [7, 0.20], [9, 0.45], [10, 1.0],
  ]);
}

export function conversionProbability(ability: number): number {
  if (ability >= 10) return 1;
  return interpSeries(clamp(ability, 1, 10), [
    [1, 0.03], [3, 0.07], [5, 0.15], [7, 0.28], [9, 0.50], [10, 1.0],
  ]);
}

export function baseCountForSexAndAge(sex: SexId, age: number): number {
  const a = clamp(age, AGE_MIN, AGE_MAX);
  if (sex === "women") {
    const pts: [number, number][] = [
      [18, 9_500_000], [22, 11_200_000], [27.5, 27_080_000],
      [32.5, 28_900_000], [37, 27_000_000], [45, 22_000_000], [55, 16_000_000],
    ];
    return Math.round(interpSeries(a, pts));
  }
  const pts: [number, number][] = [
    [18, 9_800_000], [22, 11_500_000], [27.5, 27_600_000],
    [32.5, 29_500_000], [37, 28_000_000], [45, 24_000_000], [55, 17_000_000],
  ];
  return Math.round(interpSeries(a, pts));
}

export function formatAgeLabel(age: number) {
  const rounded = Math.round(age * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
}

export function normalizeAgeRange(ageMin: number, ageMax: number) {
  let lo = Math.round(clamp(ageMin, AGE_MIN, AGE_MAX) * 10) / 10;
  let hi = Math.round(clamp(ageMax, AGE_MIN, AGE_MAX) * 10) / 10;
  if (lo > hi) [lo, hi] = [hi, lo];
  return { ageMin: lo, ageMax: hi };
}

const REF_COHORT_SPAN_YEARS = 5;

export function baseCountForSexAndAgeRange(sex: SexId, ageMin: number, ageMax: number): number {
  const { ageMin: lo, ageMax: hi } = normalizeAgeRange(ageMin, ageMax);
  const span = hi - lo;
  if (span < 0.25) return baseCountForSexAndAge(sex, (lo + hi) / 2);
  const mid = (lo + hi) / 2;
  return Math.round(baseCountForSexAndAge(sex, mid) * (span / REF_COHORT_SPAN_YEARS));
}

export function formatAgeRangeLabel(ageMin: number, ageMax: number) {
  const { ageMin: lo, ageMax: hi } = normalizeAgeRange(ageMin, ageMax);
  const a = formatAgeLabel(lo);
  const b = formatAgeLabel(hi);
  return a === b ? a : `${a}–${b}`;
}

function buildCohortSummary(sex: SexId, ageMin: number, ageMax: number): CohortSummary {
  const baseCount = baseCountForSexAndAgeRange(sex, ageMin, ageMax);
  const sexWord = sex === "women" ? "Women" : "Men";
  const range = formatAgeRangeLabel(ageMin, ageMax);
  const { ageMin: lo, ageMax: hi } = normalizeAgeRange(ageMin, ageMax);
  const singleAge = hi - lo < 0.25;
  return {
    label: singleAge ? `${sexWord}, age ${range}` : `${sexWord}, ages ${range}`,
    baseCount,
    description: "Approximate US single-sex population in the selected age band.",
    source: "Research lane: U.S. Census-style cohort counts",
  };
}

function getOption<T extends string>(options: BaseOption<T>[], id: T) {
  return options.find((o) => o.id === id) ?? options[0];
}

function getLocation(id: LocationId) {
  return locationOptions.find((o) => o.id === id) ?? locationOptions[0];
}

function cohortLegacyToSexAgeRange(
  cohort: string | undefined
): { sex: SexId; ageMin: number; ageMax: number } | null {
  switch (cohort) {
    case "women-25-30": return { sex: "women", ageMin: 25, ageMax: 30 };
    case "women-30-35": return { sex: "women", ageMin: 30, ageMax: 35 };
    case "men-25-30": return { sex: "men", ageMin: 25, ageMax: 30 };
    default: return null;
  }
}

function migrateFamilyId(raw: string | undefined): string | undefined {
  if (raw === "wants-kids-aligned") return "wants-kids";
  if (raw === "childfree-aligned") return "childfree";
  if (raw === "flexible") return undefined;
  return raw;
}

export function parseSearchState(source: SearchParamSource): SearchState {
  const attractivenessValue = Number.parseFloat(readValue(source, "att") ?? "");
  const sexParam = readValue(source, "sex");
  const ageMinParam = readValue(source, "ageMin");
  const ageMaxParam = readValue(source, "ageMax");
  const ageParam = readValue(source, "age");
  const legacy = cohortLegacyToSexAgeRange(readValue(source, "cohort"));

  const hasAgeRangeParams = ageMinParam !== undefined || ageMaxParam !== undefined;

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

  const approachRaw = Number.parseFloat(readValue(source, "approach") ?? "");
  const conversionRaw = Number.parseFloat(readValue(source, "conversion") ?? "");

  return {
    sex,
    ageMin,
    ageMax,
    worldview: asKey(readValue(source, "worldview"), worldviewOptions.map((o) => o.id), defaultState.worldview),
    family: asKey(migrateFamilyId(readValue(source, "family")), familyOptions.map((o) => o.id), defaultState.family),
    kidCount: asKey(readValue(source, "kidCount"), kidCountOptions.map((o) => o.id), defaultState.kidCount),
    kidTimeline: asKey(readValue(source, "kidTimeline"), kidTimelineOptions.map((o) => o.id), defaultState.kidTimeline),
    hasKids: asKey(readValue(source, "hasKids"), hasKidsOptions.map((o) => o.id), defaultState.hasKids),
    social: asKey(readValue(source, "social"), socialOptions.map((o) => o.id), defaultState.social),
    humor: asKey(readValue(source, "humor"), humorOptions.map((o) => o.id), defaultState.humor),
    smoking: asKey(readValue(source, "smoking"), smokingOptions.map((o) => o.id), defaultState.smoking),
    drinking: asKey(readValue(source, "drinking"), drinkingOptions.map((o) => o.id), defaultState.drinking),
    pets: asKey(readValue(source, "pets"), petsOptions.map((o) => o.id), defaultState.pets),
    education: asKey(readValue(source, "education"), educationOptions.map((o) => o.id), defaultState.education),
    faith: asKey(readValue(source, "faith"), faithOptions.map((o) => o.id), defaultState.faith),
    approachAbility: Number.isFinite(approachRaw) ? Math.round(clamp(approachRaw, 1, 10) * 10) / 10 : defaultState.approachAbility,
    conversionAbility: Number.isFinite(conversionRaw) ? Math.round(clamp(conversionRaw, 1, 10) * 10) / 10 : defaultState.conversionAbility,
    location: asKey(readValue(source, "location"), locationOptions.map((o) => o.id), defaultState.location),
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
  params.set("kidCount", state.kidCount);
  params.set("kidTimeline", state.kidTimeline);
  params.set("hasKids", state.hasKids);
  params.set("social", state.social);
  params.set("humor", state.humor);
  params.set("smoking", state.smoking);
  params.set("drinking", state.drinking);
  params.set("pets", state.pets);
  params.set("education", state.education);
  params.set("faith", state.faith);
  params.set("approach", state.approachAbility.toFixed(1));
  params.set("conversion", state.conversionAbility.toFixed(1));
  params.set("location", state.location);
  params.set("att", state.attractiveness.toFixed(1));
  return params.toString();
}

function factorLabel(kind: string, option: BaseOption<string>) {
  if (option.probability >= 1) {
    const labels: Record<string, string> = {
      worldview: "Worldview",
      family: "Family plans",
      kidCount: "Kid count",
      kidTimeline: "Kid timeline",
      hasKids: "Has kids",
      social: "Digital presence",
      humor: "Chemistry",
      smoking: "Smoking",
      drinking: "Drinking",
      pets: "Pets",
      education: "Education",
      faith: "Faith",
      approach: "Getting to a date",
      conversion: "Date → relationship",
    };
    return `${labels[kind] ?? kind} — not applied`;
  }
  return option.label;
}

function buildInsights(state: SearchState, computed: Omit<ComputedFunnel, "insights">) {
  const insights: string[] = [];

  if (state.approachAbility < 5) {
    insights.push(
      "You rated yourself low on getting to a first date. That's honest — and it's the single biggest bottleneck. Social skills, context, and proximity matter more than any filter."
    );
  }

  if (state.conversionAbility < 5) {
    insights.push(
      "A low conversion score means most first dates won't become relationships. That's normal — deep compatibility is rare even among people who look great on paper."
    );
  }

  if (state.attractiveness >= 9) {
    insights.push(
      "A top-10% attraction threshold sounds ordinary online, but it becomes dramatically rarer in the physical world. This is where calibration matters most."
    );
  }

  if (state.social === "no-social") {
    insights.push(
      "Filtering for zero social media removes a huge part of the modern cohort. That doesn't make the preference wrong, but it does make it expensive."
    );
  }

  if (state.family === "childfree") {
    insights.push(
      "The childfree filter is one of the steepest: only about 12% of adults are certain they don't want kids. Finding mutual certainty is genuinely rare."
    );
  }

  if (computed.rawRemainingLocal < 25) {
    insights.push(
      "At this level, broad swiping is a weak strategy. The model suggests concentrated, high-intent environments outperform mass-exposure dating."
    );
  }

  if (insights.length === 0) {
    insights.push(
      "This version of the funnel still leaves a meaningful pool. The visual helps you decide which filters feel truly essential and which ones might be digital noise."
    );
  }

  return insights;
}

export function computeFunnel(state: SearchState): ComputedFunnel {
  const cohort = buildCohortSummary(state.sex, state.ageMin, state.ageMax);
  const location = getLocation(state.location);
  const attractivenessPercent = Math.max(1, Math.round((10 - state.attractiveness) * 10));

  const optionPairs: [string, BaseOption<string>][] = [
    ["attractiveness", {
      id: "attractiveness",
      label: `Top ${attractivenessPercent}% attractiveness`,
      probability: attractivenessPercent / 100,
      source: "Calibration lane: user-defined percentile",
      description: "Self-rated attraction percentile.",
    }],
    ["worldview", getOption(worldviewOptions, state.worldview)],
    ["family", getOption(familyOptions, state.family)],
  ];

  if (state.family === "wants-kids") {
    optionPairs.push(["kidCount", getOption(kidCountOptions, state.kidCount)]);
    optionPairs.push(["kidTimeline", getOption(kidTimelineOptions, state.kidTimeline)]);
  }

  optionPairs.push(
    ["hasKids", getOption(hasKidsOptions, state.hasKids)],
    ["faith", getOption(faithOptions, state.faith)],
    ["social", getOption(socialOptions, state.social)],
    ["humor", getOption(humorOptions, state.humor)],
    ["education", getOption(educationOptions, state.education)],
    ["smoking", getOption(smokingOptions, state.smoking)],
    ["drinking", getOption(drinkingOptions, state.drinking)],
    ["pets", getOption(petsOptions, state.pets)],
  );

  const approachProb = approachProbability(state.approachAbility);
  if (approachProb < 1) {
    optionPairs.push(["approach", {
      id: "approach",
      label: `Getting to a date (${state.approachAbility.toFixed(0)}/10)`,
      probability: approachProb,
      source: "Self-assessment: likelihood of getting a first date",
      description: "How likely you are to actually meet and go on a date with someone from this pool.",
    }]);
  }

  const conversionProb = conversionProbability(state.conversionAbility);
  if (conversionProb < 1) {
    optionPairs.push(["conversion", {
      id: "conversion",
      label: `Date → relationship (${state.conversionAbility.toFixed(0)}/10)`,
      probability: conversionProb,
      source: "Self-assessment: first date to long-term relationship conversion",
      description: "How likely a first date is to turn into a committed, long-term relationship.",
    }]);
  }

  const factors: FactorSummary[] = optionPairs
    .filter(([, opt]) => opt.probability < 1)
    .map(([kind, opt]) => ({
      id: kind,
      label: factorLabel(kind, opt),
      probability: opt.probability,
      source: opt.source,
      description: opt.description,
    }));

  const probability = factors.reduce((acc, f) => acc * f.probability, 1);
  const rawRemainingNational = cohort.baseCount * probability;
  const rawRemainingLocal = rawRemainingNational * location.shareOfPopulation;
  const nationalRounded = Math.round(rawRemainingNational);
  const localRounded = Math.round(rawRemainingLocal);
  const rarity = rawRemainingNational > 0 ? cohort.baseCount / rawRemainingNational : 0;

  const baseComputed = {
    cohort, location, factors, probability,
    rawRemainingNational, rawRemainingLocal, nationalRounded, localRounded, rarity,
    topConstraints: [...factors].sort((a, b) => a.probability - b.probability).slice(0, 3),
  };

  return { ...baseComputed, insights: buildInsights(state, baseComputed) };
}

export function formatCount(value: number) {
  if (value < 1) return "fewer than 1";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(value));
}

export function formatCompact(value: number) {
  if (value < 1) return "<1";
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
    { title: "Population baseline", body: "Starts from a real demographic cohort, not a fantasy population.", source: "U.S. Census-style cohort data" },
    { title: "Values and politics", body: "Worldview filters grounded in polling and overlap analysis.", source: "Pew, Gallup, major public polling" },
    { title: "Digital lifestyle", body: "Social-media filter counters distortions from digital performance culture.", source: "Statista, GWI, platform behavior reports" },
    { title: "Compatibility layer", body: "Humor, family, and chemistry are the hardest variables. The point is to make hidden scarcity visible.", source: "Behavioral proxies and transparent assumptions" },
    { title: "Dating reality", body: "Self-assessment sliders model the gap between matching on paper and meeting in practice.", source: "Hinge, Match Group aggregate reports" },
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

export type FilterMeta = {
  key: keyof SearchState;
  label: string;
  hint: string;
  options: { id: string; label: string; desc: string }[];
};

export function getCoreFilters(): FilterMeta[] {
  return [
    {
      key: "worldview",
      label: "Worldview",
      hint: "Political and values alignment",
      options: worldviewOptions.filter((o) => o.id !== "either").map((o) => ({ id: o.id, label: o.label, desc: o.description })),
    },
    {
      key: "faith",
      label: "Faith",
      hint: "Religion and spirituality",
      options: faithOptions.filter((o) => o.id !== "either").map((o) => ({ id: o.id, label: o.label, desc: o.description })),
    },
    {
      key: "humor",
      label: "Chemistry",
      hint: "Humor and interpersonal click",
      options: humorOptions.filter((o) => o.id !== "either").map((o) => ({ id: o.id, label: o.label, desc: o.description })),
    },
    {
      key: "social",
      label: "Digital presence",
      hint: "Social media behavior",
      options: socialOptions.filter((o) => o.id !== "either").map((o) => ({ id: o.id, label: o.label, desc: o.description })),
    },
  ];
}

export function getFamilyOptions() {
  return {
    family: familyOptions.filter((o) => o.id !== "either").map((o) => ({ id: o.id, label: o.label, desc: o.description })),
    kidCount: kidCountOptions.filter((o) => o.id !== "either").map((o) => ({ id: o.id, label: o.label, desc: o.description })),
    kidTimeline: kidTimelineOptions.filter((o) => o.id !== "either").map((o) => ({ id: o.id, label: o.label, desc: o.description })),
    hasKids: hasKidsOptions.filter((o) => o.id !== "either").map((o) => ({ id: o.id, label: o.label, desc: o.description })),
  };
}

export function getLifestyleFilters(): FilterMeta[] {
  return [
    { key: "smoking", label: "Smoking", hint: "Tobacco and nicotine", options: smokingOptions.filter((o) => o.id !== "either").map((o) => ({ id: o.id, label: o.label, desc: o.description })) },
    { key: "drinking", label: "Drinking", hint: "Alcohol use", options: drinkingOptions.filter((o) => o.id !== "either").map((o) => ({ id: o.id, label: o.label, desc: o.description })) },
    { key: "education", label: "Education", hint: "Academic background", options: educationOptions.filter((o) => o.id !== "either").map((o) => ({ id: o.id, label: o.label, desc: o.description })) },
    { key: "pets", label: "Pets", hint: "Animal preferences", options: petsOptions.filter((o) => o.id !== "either").map((o) => ({ id: o.id, label: o.label, desc: o.description })) },
  ];
}

export const ageBounds = { min: AGE_MIN, max: AGE_MAX } as const;
