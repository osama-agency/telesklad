import { type VariantProps, cva } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex rounded px-2 py-1 text-sm font-medium hover:bg-opacity-90",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white",
        secondary: "bg-[#13C296] text-white",
        dark: "bg-dark text-white",
        gray: "bg-dark-5 text-white",
        light: "bg-[#EFEFEF] text-dark",
        warning: "bg-[#F9C107] text-dark",
        danger: "bg-[#DC3545] text-white",
        success: "bg-[#3CA745] text-white",
        info: "bg-[#3BA2B8] text-white",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

type BadgeProps = VariantProps<typeof badgeVariants> & {
  children: React.ReactNode;
  className?: string;
};

export function BadgeOne({ variant, children, className }: BadgeProps) {
  return (
    <span className={badgeVariants({ variant, className })}>{children}</span>
  );
}
