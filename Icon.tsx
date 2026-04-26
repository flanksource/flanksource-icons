import * as React from "react";
import type { IconType } from "./iconBase";
import { isWideViewBox } from "./iconBase";
import { IconMap } from "@flanksource/icons/mi";
import { findIcon, findByName, resolveColor } from "./iconResolver";
export {
  aliases,
} from "./aliases";
export {
  prefixes,
} from "./prefixes";
export {
  findByName,
  areTwoIconNamesEqual,
  processIconNameSearch,
  resolveColor,
  colorClassMap,
} from "./iconResolver";
export type { IconType };

export type IconProps = {
  name?: string;
  secondary?: string;
  className?: string;
  color?: string;
  alt?: string;
  prefix?: React.ReactNode;
  size?: string | number;
  iconWithColor?: string;
  /**
   * When true (default for normal icons), render in a square box. When false,
   * preserve the SVG's intrinsic aspect ratio. When unset, auto-detect from
   * the icon's viewBox (wide logos render aspect-preserving).
   */
  square?: boolean;
};

export { FileTypeIcon } from "./FileTypeIcon";
export type { FileTypeIconProps } from "./FileTypeIcon";
export { extMap, specialFileMap, defaultFileIcon, resolveFileTypeIcon } from "./fileTypeMap";

export { ResourceIcon } from "./ResourceIcon";
export type { ResourceIconProps, IconifyCollection } from "./ResourceIcon";

export function Icon({
  name = "",
  secondary = "",
  className,
  alt = "",
  color,
  prefix,
  iconWithColor,
  square,
  ...props
}: IconProps) {
  if (name && (name.startsWith("http:") || name.startsWith("https://"))) {
    return (
      <img src={name} className={className ?? "h-6 max-w-6"} alt={alt} {...props} />
    );
  }

  if (name?.includes("::")) {
    const [primary, nested] = name.split("::");
    name = nested;
    secondary = secondary || primary;
  }

  const result = findIcon(name, secondary, IconMap, iconWithColor);
  if (!result?.SVG) return null;

  const effectiveSquare = square ?? !isWideViewBox(result.SVG.viewBox);
  const defaultClass = effectiveSquare ? "h-6 max-w-6" : "h-6";
  const resolvedClass = className ?? defaultClass;

  const colorResolved = resolveColor(color);
  const colorFromIcon = result.color ? ` ${result.color}` : "";

  return (
    <>
      {prefix}{" "}
      <result.SVG
        className={`inline-block fill-current object-center ${resolvedClass}${colorFromIcon}${colorResolved?.className ? ` ${colorResolved.className}` : ""}`}
        style={colorResolved?.style}
        square={effectiveSquare}
        {...props}
      />
    </>
  );
}
