import * as React from "react";

import { IconContext, DefaultContext } from "./iconContext";

export interface IconTree {
  tag: string;
  attr: { [key: string]: string };
  child: IconTree[];
}

function Tree2Element(tree: IconTree[]): React.ReactElement[] {
  return (
    tree &&
    tree.map((node, i) =>
      React.createElement(
        node.tag,
        { key: i, ...node.attr },
        Tree2Element(node.child)
      )
    )
  );
}
export function GenIcon(data: IconTree) {
  // eslint-disable-next-line react/display-name
  const Component = (props: IconBaseProps) => (
    <IconBase attr={{ ...data.attr }} {...props}>
      {Tree2Element(data.child)}
    </IconBase>
  );
  (Component as IconType).viewBox = data.attr?.viewBox;
  return Component;
}

export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
  children?: React.ReactNode;
  size?: string | number;
  color?: string;
  title?: string;
  /**
   * When true, render in a square box (width === height). When false, preserve
   * the SVG's intrinsic aspect ratio by setting only height. When undefined,
   * auto-detect: viewBox aspect ratio >= WIDE_THRESHOLD renders aspect-preserving.
   */
  square?: boolean;
}

// Icons with viewBox width/height >= this ratio are treated as wide word-mark
// logos and rendered with their natural aspect ratio when `square` is unset.
export const WIDE_THRESHOLD = 2.0;

export function isWideViewBox(viewBox: string | undefined): boolean {
  if (!viewBox) return false;
  const parts = viewBox.trim().split(/[\s,]+/);
  if (parts.length !== 4) return false;
  const w = parseFloat(parts[2]);
  const h = parseFloat(parts[3]);
  if (!isFinite(w) || !isFinite(h) || h <= 0) return false;
  return w / h >= WIDE_THRESHOLD;
}

export type IconType = ((props: IconBaseProps) => JSX.Element) & {
  viewBox?: string;
};
export function IconBase(
  props: IconBaseProps & { attr?: Record<string, string> }
): JSX.Element {
  const elem = (conf: IconContext) => {
    const { attr, size, title, square, ...svgProps } = props;
    const computedSize = size || conf.size || "1em";
    const effectiveSquare = square ?? !isWideViewBox(attr?.viewBox);
    let className;
    if (conf.className) className = conf.className;
    if (props.className)
      className = (className ? className + " " : "") + props.className;

    return (
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        {...conf.attr}
        {...attr}
        {...svgProps}
        className={className}
        style={{
          color: props.color || conf.color,
          ...conf.style,
          ...props.style,
        }}
        height={computedSize}
        width={effectiveSquare ? computedSize : undefined}
        xmlns="http://www.w3.org/2000/svg"
      >
        {title && <title>{title}</title>}
        {props.children}
      </svg>
    );
  };

  return IconContext !== undefined ? (
    <IconContext.Consumer>
      {(conf: IconContext) => elem(conf)}
    </IconContext.Consumer>
  ) : (
    elem(DefaultContext)
  );
}
