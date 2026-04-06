import type { Metadata } from "next";
import { landingContent, buildLandingMetadata } from "@/features/landing/landing-content";
import { LandingPageTemplate } from "@/features/landing/LandingPageTemplate";
import { extractTrackingParams } from "@/lib/utm";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  return buildLandingMetadata(landingContent.casa);
}

export default async function CasaDecoracaoLandingPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const tracking = extractTrackingParams(resolvedSearchParams);

  return <LandingPageTemplate content={landingContent.casa} tracking={tracking} />;
}
