import Image from "next/image";
import Link from "next/link";
import type { CreativeSlotData } from "@/lib/creative-slots";

interface CreativeSlotProps {
  creative: CreativeSlotData | undefined;
  className?: string;
  fallback?: React.ReactNode;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
}

/**
 * Renders a creative slot — image or video — with an optional fallback.
 * If no creative is registered or active, renders the fallback (gradient, etc.).
 * If linkHref is set, wraps the media in a Link.
 */
export function CreativeSlot({
  creative,
  className = "",
  fallback,
  priority = false,
  sizes = "100vw",
  fill = true,
}: CreativeSlotProps) {
  if (!creative) {
    return <>{fallback ?? null}</>;
  }

  const content =
    creative.mediaType === "video" ? (
      <video
        src={creative.publicUrl}
        poster={creative.posterPublicUrl ?? undefined}
        autoPlay
        muted
        loop
        playsInline
        className={`h-full w-full object-cover ${className}`}
        aria-label={creative.altText ?? undefined}
      />
    ) : fill ? (
      <Image
        src={creative.publicUrl}
        alt={creative.altText ?? ""}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-cover ${className}`}
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={creative.publicUrl}
        alt={creative.altText ?? ""}
        className={`h-full w-full object-cover ${className}`}
        loading={priority ? "eager" : "lazy"}
      />
    );

  if (creative.linkHref) {
    return (
      <Link href={creative.linkHref} className="block h-full w-full">
        {content}
      </Link>
    );
  }

  return <>{content}</>;
}
