import * as React from "react";
import type { IconType } from "./iconBase";
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
};

export function Icon({
  name = "",
  secondary = "",
  className = "h-6 max-w-6",
  alt = "",
  color,
  prefix,
  iconWithColor,
  ...props
}: IconProps) {
  if (name && (name.startsWith("http:") || name.startsWith("https://"))) {
    return <img src={name} className={className} alt={alt} {...props} />;
  }

  if (name?.includes("::")) {
    const [primary, nested] = name.split("::");
    name = nested;
    secondary = secondary || primary;
  }

  const result = findIcon(name, secondary, IconMap, iconWithColor);
  if (!result?.SVG) return null;

  const colorResolved = resolveColor(color);
  const colorFromIcon = result.color ? ` ${result.color}` : "";

  return (
    <>
      {prefix}{" "}
      <result.SVG
        className={`inline-block fill-current object-center ${className}${colorFromIcon}${colorResolved?.className ? ` ${colorResolved.className}` : ""}`}
        style={colorResolved?.style}
        {...props}
      />
    </>
  );
}
