import * as React from "react";
import { Icon } from "./Icon";
import type { IconProps } from "./Icon";
import { resolveFileTypeIcon } from "./fileTypeMap";

export type FileTypeIconProps = Omit<IconProps, "name"> & {
  name: string;
};

export { resolveFileTypeIcon };

export function FileTypeIcon({ name, ...props }: FileTypeIconProps) {
  return <Icon name={resolveFileTypeIcon(name)} {...props} />;
}
