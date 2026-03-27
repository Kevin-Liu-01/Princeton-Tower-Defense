import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidRoute } from "../constants/routes";
import { getRouteMetadata } from "../seo/routeMeta";
import { WORLD_LEVELS } from "../components/menus/world-map/worldMapData";
import { GamePage } from "./GamePage";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateStaticParams() {
  return [
    { slug: undefined },
    ...WORLD_LEVELS.map((l) => ({ slug: [l.id] })),
    { slug: ["codex"] },
    { slug: ["codex", "towers"] },
    { slug: ["codex", "heroes"] },
    { slug: ["codex", "enemies"] },
    { slug: ["codex", "spells"] },
    { slug: ["codex", "special_towers"] },
    { slug: ["codex", "hazards"] },
    { slug: ["codex", "guide"] },
    { slug: ["creator"] },
    { slug: ["credits"] },
    { slug: ["settings"] },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug && !isValidRoute(slug)) return {};
  return getRouteMetadata(slug);
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  if (slug && !isValidRoute(slug)) {
    notFound();
  }

  return <GamePage />;
}
