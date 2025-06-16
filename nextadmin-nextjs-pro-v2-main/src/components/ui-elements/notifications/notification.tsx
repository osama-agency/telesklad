"use client";

import { CircleCloseIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { PartyPopperIcon, ShieldIcon } from "./icons";

const containerStyles = cva("rounded-lg flex items-center justify-between", {
  variants: {
    type: {
      success:
        "max-w-[422px] py-4 pl-5.5 pr-4.5 shadow-2 dark:bg-dark-2 dark:shadow-card",
      error:
        "max-w-[490px] p-[15px] pr-6 bg-red-light-6 border border-red-light-4 dark:bg-[#1B1B24] dark:border-[#4e4341]",
    },
  },
  defaultVariants: {
    type: "success",
  },
});

const iconStyles = cva("flex items-center justify-center", {
  variants: {
    type: {
      success: "size-12 bg-[#1EA779] rounded-full",
      error: "size-15 bg-red rounded-[5px]",
    },
  },
  defaultVariants: {
    type: "success",
  },
});

const titleStyles = cva("mb-px text-lg", {
  variants: {
    type: {
      success: "font-bold text-dark dark:text-white",
      error: "font-medium text-dark dark:text-[#EA4E2C]",
    },
  },
  defaultVariants: {
    type: "success",
  },
});

type NotificationProps = {
  title: string;
  description: string;
  type: "success" | "error";
  icon?: React.FC;
  onDismiss?: () => void;
};

export const Notification = ({
  title,
  description,
  type,
  icon: CustomIcon,
  onDismiss,
}: NotificationProps) => {
  return (
    <div className={containerStyles({ type })}>
      <div className="flex flex-grow items-center gap-5">
        <div className={iconStyles({ type })}>
          {CustomIcon ? (
            <CustomIcon />
          ) : type === "success" ? (
            <PartyPopperIcon />
          ) : (
            <ShieldIcon />
          )}
        </div>

        <div>
          <h4 className={titleStyles({ type })}>{title}</h4>
          <p className="text-body-sm font-medium">{description}</p>
        </div>
      </div>

      <button
        onClick={() => {
          onDismiss?.();
        }}
        className={cn({
          "text-dark-6 hover:text-dark dark:hover:text-white":
            type === "success",
          "text-red-light dark:text-dark-6 dark:hover:text-red-light":
            type === "error",
        })}
      >
        <span className="sr-only">Dismiss Notification</span>
        <CircleCloseIcon />
      </button>
    </div>
  );
};
