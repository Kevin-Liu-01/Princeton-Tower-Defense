import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidRoute } from "../constants/routes";
import { getRouteMetadata } from "../seo/routeMeta";
import { GamePage } from "./GamePage";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
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
