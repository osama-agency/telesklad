import type { IconProps } from "@/types/icon-props";

export function CircleRangeIcon(props: IconProps) {
    return (
      <svg {...props}>
        <circle
          className="text-gray-3 dark:text-dark-3"
          strokeWidth="16"
          stroke="currentColor"
          fill="transparent"
          r="58"
          cx="66"
          cy="66"
        />
        <circle
          className="text-primary"
          strokeWidth="16"
          strokeDasharray={58 * 2 * Math.PI}
          strokeDashoffset={58 * 2 * Math.PI - (85 / 100) * 58 * 2 * Math.PI}
          stroke="currentColor"
          fill="transparent"
          r="58"
          cx="66"
          cy="66"
        />
      </svg>
    );
}