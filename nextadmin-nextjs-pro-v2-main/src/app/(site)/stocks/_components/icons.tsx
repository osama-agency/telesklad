import type { SVGAttributes } from "react";

export type IconProps = SVGAttributes<SVGSVGElement>;

export function PolygonUp(props: IconProps) {
  return (
    <svg width={11} height={8} viewBox="0 0 11 8" fill="none" {...props}>
      <path d="M5.264 0l5.004 7.5H.26L5.264 0z" fill="currentColor" />
    </svg>
  );
}
