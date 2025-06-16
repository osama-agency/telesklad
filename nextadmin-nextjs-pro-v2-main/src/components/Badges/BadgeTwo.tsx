import React from "react";

import { type VariantProps, cva } from "class-variance-authority";

const badge = cva(
  "inline-flex rounded border px-2 py-[3px] text-body-sm font-medium hover:opacity-80",
  {
    variants: {
      variant: {
        primary: "border-primary text-primary",
        secondary: "border-[#13C296] text-[#13C296]",
        dark: "border-dark text-dark dark:border-white dark:text-white",
        gray: "border-dark-5 text-dark-5",
        light: "border-[#EFEFEF] text-dark dark:text-white",
        warning: "border-[#F9C107] text-[#F9C107]",
        danger: "border-[#DC3545] text-[#DC3545]",
        success: "border-[#3CA745] text-[#3CA745]",
        info: "border-[#3BA2B8] text-[#3BA2B8]",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

type BadgeProps = VariantProps<typeof badge> & {
  children: React.ReactNode;
  className?: string;
};

export function BadgeTwo({ variant, children, className }: BadgeProps) {
  return <span className={badge({ variant, className })}>{children}</span>;
}
