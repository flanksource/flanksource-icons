import * as React from "react";
import { Icon as IconifyIcon } from "@iconify/react";
import * as MiIcons from "@flanksource/icons/mi";
import { findByName, processIconNameSearch, resolveColor } from "./iconResolver";
import { iconifyLogos, iconifyDevicon } from "./iconifyAllowlist";
import { isWideViewBox } from "./iconBase";
import type { IconType } from "./iconBase";

export type IconifyCollection = "logos" | "devicon";

export type ResourceIconProps = {
  primary?: string;
  secondary?: string;
  iconifyCollections?: ReadonlyArray<IconifyCollection>;
  iconifyFallback?: boolean;
  className?: string;
  color?: string;
  size?: string | number;
  alt?: string;
  /**
   * When true (default for normal icons), render in a square box. When false,
   * preserve the SVG's intrinsic aspect ratio. When unset, auto-detect from
   * the bundled icon's viewBox (wide logos render aspect-preserving).
   */
  square?: boolean;
  /** Test-only override; defaults to the bundled @flanksource/icons/mi map. */
  iconMap?: Record<string, IconType>;
};

const ALLOWLISTS: Record<IconifyCollection, ReadonlySet<string>> = {
  logos: iconifyLogos,
  devicon: iconifyDevicon,
};

const DEFAULT_COLLECTIONS: ReadonlyArray<IconifyCollection> = ["logos", "devicon"];

function findIconifyMatch(
  candidates: ReadonlyArray<string | undefined>,
  collections: ReadonlyArray<IconifyCollection>,
): { collection: IconifyCollection; slug: string } | undefined {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const slug = processIconNameSearch(candidate);
    for (const collection of collections) {
      if (ALLOWLISTS[collection].has(slug)) return { collection, slug };
    }
  }
  return undefined;
}

export function ResourceIcon({
  primary,
  secondary,
  iconifyCollections = DEFAULT_COLLECTIONS,
  iconifyFallback = true,
  className,
  color,
  size,
  alt = "",
  square,
  iconMap,
  ...rest
}: ResourceIconProps) {
  const bundledIcons = MiIcons as unknown as {
    IconMap?: Record<string, IconType>;
  } & Record<string, IconType>;
  const map = iconMap ?? bundledIcons.IconMap ?? bundledIcons;
  const bundled: IconType | undefined =
    findByName(primary, map) ?? findByName(secondary, map);

  if (bundled) {
    const effectiveSquare = square ?? !isWideViewBox(bundled.viewBox);
    const defaultClass = effectiveSquare ? "h-6 max-w-6" : "h-6";
    const resolvedClass = className ?? defaultClass;
    const c = resolveColor(color);
    const SVG = bundled;
    return (
      <SVG
        className={`inline-block fill-current object-center ${resolvedClass}${
          c?.className ? ` ${c.className}` : ""
        }`}
        style={c?.style}
        square={effectiveSquare}
        {...rest}
      />
    );
  }

  const fallbackClass = className ?? "h-6 max-w-6";

  if (primary?.startsWith("http:") || primary?.startsWith("https://")) {
    return <img src={primary} className={fallbackClass} alt={alt} />;
  }

  if (iconifyFallback) {
    const match = findIconifyMatch([primary, secondary], iconifyCollections);
    if (match) {
      return (
        <IconifyIcon
          icon={`${match.collection}:${match.slug}`}
          className={fallbackClass}
          color={color}
          width={size}
          height={size}
        />
      );
    }
  }
  return null;
}
