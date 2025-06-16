"use client";

import { CircleCloseIcon } from "@/assets/icons";
import { PowerIcon } from "./icons";

type PropsType = {
  title: string;
  description: string;
  onDismiss?: () => void;
  handleUpdate?: () => void;
};

export function UpdateNotification({
  title,
  description,
  handleUpdate,
  onDismiss,
}: PropsType) {
  return (
    <div className="max-w-[557px] rounded-lg border border-stroke py-6 pl-4 pr-4.5 shadow-3 dark:border-dark-3 dark:bg-dark-2 dark:shadow-card sm:pl-6">
      <div className="flex items-start justify-between gap-6">
        <PowerIcon className="shrink-0" />

        <div>
          <h4 className="mb-2 text-lg font-bold text-dark dark:text-white">
            {title}
          </h4>
          <p className="text-body-sm font-medium">{description}</p>

          <button
            onClick={() => onDismiss?.()}
            className="mt-5 font-medium text-primary"
          >
            Update now
          </button>
        </div>

        <button
          onClick={() => handleUpdate?.()}
          className="hover:text-dark dark:hover:text-white"
        >
          <span className="sr-only">Dismiss Notification</span>
          <CircleCloseIcon />
        </button>
      </div>
    </div>
  );
}
