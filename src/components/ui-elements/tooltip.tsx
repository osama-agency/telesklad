import { cva } from "class-variance-authority";

const tooltipVariants = cva(
  "absolute z-20 whitespace-nowrap rounded-[5px] px-4.5 py-[7px] invisible group-hover:visible drop-shadow-4 text-body-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-white dark:bg-dark-2",
        dark: "bg-dark text-white",
      },
      align: {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-3",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-3",
        left: "right-full top-1/2 -translate-y-1/2 mr-3",
        right: "left-full top-1/2 -translate-y-1/2 ml-3",
      },
    },
    defaultVariants: {
      variant: "default",
      align: "top",
    },
  },
);

const pointerStyles = cva("absolute -z-10 size-2 rotate-45 rounded-sm", {
  variants: {
    variant: {
      default: "bg-white dark:bg-dark-2",
      dark: "bg-dark",
    },
    align: {
      top: "bottom-[-3px] left-1/2 -translate-x-1/2",
      bottom: "left-1/2 top-[-3px] -translate-x-1/2",
      left: "right-[-3px] top-1/2 -translate-y-1/2",
      right: "left-[-3px] top-1/2 -translate-y-1/2",
    },
  },
  defaultVariants: {
    variant: "default",
    align: "top",
  },
});

type TooltipProps = {
  content: string;
  variant?: "default" | "dark";
  align?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
};

export function Tooltip({ content, variant, align, children }: TooltipProps) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className={tooltipVariants({ variant, align })}>
        <span className={pointerStyles({ variant, align })} />
        {content}
      </div>
    </div>
  );
}
