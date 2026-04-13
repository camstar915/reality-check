import type { Metadata } from "next";
import { RealityCheckExperience } from "./components/reality-check-experience";
import {
  computeFunnel,
  formatCount,
  parseSearchState,
  serializeSearchState,
} from "./lib/reality-check";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const state = parseSearchState(await searchParams);
  const results = computeFunnel(state);
  const local = formatCount(results.rawRemainingLocal);
  const rarity = formatCount(results.rarity);

  const title = `Reality Check — ${local} in ${results.location.label}`;
  const description = `Only ${local} people in ${results.location.label} match these standards (1 in ${rarity}).`;
  const imageUrl = `/api/og?${serializeSearchState(state)}`;

  return {
    title,
    description,
    openGraph: { title, description, images: [imageUrl] },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const initialState = parseSearchState(await searchParams);
  return <RealityCheckExperience initialState={initialState} />;
}
