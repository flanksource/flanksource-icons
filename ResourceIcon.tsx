import * as React from "react";
import { Icon as IconifyIcon } from "@iconify/react";
import { findByName, processIconNameSearch, resolveColor } from "./iconResolver";
import { iconifyLogos, iconifyDevicon } from "./iconifyAllowlist";
import { isWideViewBox } from "./iconBase";
import type { IconType } from "./iconBase";

// Lazy resolution so importing ResourceIcon does not require the built
// @flanksource/icons/mi package to be on the module path (e.g. during tests
// or in environments where the consumer hasn't run the build yet). At runtime
// inside a published package, this resolves to the bundled IconMap.
declare const require: ((id: string) => unknown) | undefined;

let cachedDefaultMap: Record<string, IconType> | undefined;
function getDefaultIconMap(): Record<string, IconType> {
  if (cachedDefaultMap) return cachedDefaultMap;
  try {
    if (typeof require === "function") {
      const mod = require("@flanksource/icons/mi") as {
        IconMap?: Record<string, IconType>;
      };
      cachedDefaultMap = mod.IconMap ?? {};
    } else {
      cachedDefaultMap = {};
    }
  } catch {
    cachedDefaultMap = {};
  }
  return cachedDefaultMap;
}

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
  const map = iconMap ?? getDefaultIconMap();
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
