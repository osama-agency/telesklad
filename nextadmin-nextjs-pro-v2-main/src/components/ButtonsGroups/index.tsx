import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import type { JSX } from "react";

const buttonStyles = cva(
  "flex items-center gap-2 font-medium border-y hover:bg-primary hover:text-white hover:border-primary dark:hover:border-primary [&_svg]:size-5",
  {
    variants: {
      size: {
        default: "px-6 py-[11px]",
        small: "px-4 py-[9px]",
      },
      isActive: {
        true: "bg-primary text-white border-primary",
        false: "border-stroke text-dark dark:text-white dark:border-dark-3",
      },
    },
    defaultVariants: {
      size: "default",
      isActive: false,
    },
  },
);

type PropsType = Omit<VariantProps<typeof buttonStyles>, "isActive"> & {
  activeIndex?: number;
  items: { label: string; icon?: JSX.Element }[];
  shape?: "rounded" | "full" | "default";
};

export function ButtonGroup({ size, shape, items, activeIndex }: PropsType) {
  return (
    <div className="flex max-w-fit items-center">
      {items.map(({ label, icon }, i) => (
        <button
          key={i}
          className={buttonStyles({
            size: typeof icon !== "undefined" ? "small" : size,
            isActive: activeIndex === i,
            className: cn({
              border: i === 0 || i === items.length - 1,
              "rounded-l-lg": i === 0 && shape === "rounded",
              "rounded-r-lg": i === items.length - 1 && shape === "rounded",
              "rounded-l-full": i === 0 && shape === "full",
              "rounded-r-full": i === items.length - 1 && shape === "full",
            }),
          })}
        >
          {icon}

          {label}
        </button>
      ))}
    </div>
  );
}
