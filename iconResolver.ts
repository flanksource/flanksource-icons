import type { IconType } from "./iconBase";
import { aliases } from "./aliases";
import { prefixes } from "./prefixes";

export const colorClassMap: Record<string, string> = {
  error: "fill-red-500",
  success: "fill-green-500",
  healthy: "fill-green-500",
  unhealthy: "fill-red-500",
  warning: "fill-orange-500",
  unknown: "fill-gray-500",
  orange: "fill-orange-500",
  red: "fill-red-500",
  green: "fill-green-500",
  blue: "fill-blue-500",
  gray: "fill-gray-500",
};

export function processIconNameSearch(name: string): string {
  return name
    .replaceAll("--", "-")
    .replaceAll("::", "-")
    .toLowerCase()
    .replaceAll("k8-", "k8s-")
    .replaceAll("kubernetes-", "k8s-");
}

export function findIconName(
  name: string | undefined,
  iconMap: Record<string, IconType>,
): IconType | undefined {
  if (!name) return undefined;
  if (iconMap[name]) return iconMap[name];
  if (aliases[name]) return iconMap[aliases[name]];
  for (const prefix in prefixes) {
    if (name.startsWith(prefix)) return iconMap[prefixes[prefix]];
  }
  for (const prefix in prefixes) {
    if (name.endsWith(prefix)) return iconMap[prefixes[prefix]];
  }
  return undefined;
}

export function areTwoIconNamesEqual(
  firstIconName?: string,
  secondIconName?: string,
): boolean {
  if (!firstIconName || !secondIconName) return false;
  const first = processIconNameSearch(firstIconName);
  const second = processIconNameSearch(secondIconName);
  if (first === second) return true;
  const firstAlias = aliases[first];
  const secondAlias = aliases[second];
  if (firstAlias === second || secondAlias === first) return true;
  if (firstAlias && firstAlias === secondAlias) return true;
  const firstStripped = first.replace("k8s-", "");
  const secondStripped = second.replace("k8s-", "");
  if (firstStripped === second || secondStripped === first) return true;
  if (firstStripped === secondStripped) return true;
  return false;
}

export function findByName(
  name: string | undefined,
  iconMap: Record<string, IconType>,
): IconType | undefined {
  if (!name) return undefined;
  const normalized = processIconNameSearch(name);
  let icon = findIconName(normalized, iconMap);
  if (icon) return icon;
  icon = findIconName(normalized.replace("k8s-", ""), iconMap);
  if (icon) return icon;
  for (const prefix of ["aws-", "azure-", "k8s-"]) {
    icon = findIconName(prefix + normalized, iconMap);
    if (icon) return icon;
  }
  return undefined;
}

export function resolveColor(
  color?: string,
): { className?: string; style?: { color: string } } | undefined {
  if (!color) return undefined;
  if (color in colorClassMap) return { className: colorClassMap[color] };
  return { style: { color } };
}

type IconCache = { SVG?: IconType; color?: string };
const cache: Record<string, IconCache> = {};

export function findIcon(
  name: string,
  secondary: string,
  iconMap: Record<string, IconType>,
  iconWithColor?: string,
): IconCache | undefined {
  const key = `${name}-${secondary}-${iconWithColor}`;
  if (cache[key]) return cache[key];
  if (iconWithColor) {
    const [icon, color] = iconWithColor.split(":");
    if (icon) {
      const iconType = findByName(icon, iconMap);
      if (iconType) {
        const value = { SVG: iconType, color: colorClassMap[color] };
        cache[key] = value;
        return value;
      }
    }
  }
  if (!name && !secondary) return undefined;
  if (name && (name.startsWith("http:") || name.startsWith("https://")))
    return undefined;
  let iconType = findByName(name, iconMap);
  if (!iconType) iconType = findByName(secondary, iconMap);
  cache[key] = { SVG: iconType };
  return { SVG: iconType };
}
