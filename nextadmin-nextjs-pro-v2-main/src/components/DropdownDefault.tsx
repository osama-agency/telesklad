"use client";

import {
  EllipsisHorizontal,
  PencilSquareIcon,
  TrashIcon,
} from "@/assets/icons";
import { cva } from "class-variance-authority";
import { useState } from "react";
import { Dropdown, DropdownContent, DropdownTrigger } from "./ui/dropdown";

const dropdownTriggerStyles = cva(undefined, {
  variants: {
    triggerType: {
      default: "hover:text-primary",
      withBackground:
        "flex h-8.5 w-9 items-center justify-center rounded-md bg-white shadow-1 hover:text-dark dark:bg-gray-dark dark:shadow-card dark:hover:text-white",
    },
  },
  defaultVariants: {
    triggerType: "default",
  },
});

type PropsType = {
  triggerType?: "default" | "withBackground";
};

export default function DropdownDefault({ triggerType }: PropsType) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className={dropdownTriggerStyles({ triggerType })}>
        <span className="sr-only">Open menu</span>
        <EllipsisHorizontal />
      </DropdownTrigger>

      <DropdownContent
        align="end"
        className="mt-1 w-46.5 space-y-1.5 rounded-lg border border-stroke bg-white p-2 shadow-2 dark:border-dark-3 dark:bg-dark-2 dark:shadow-card"
      >
        <button
          onClick={handleClose}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-[9px] text-left font-medium text-dark-4 hover:bg-gray-2 hover:text-dark dark:text-dark-6 dark:hover:bg-dark-3 dark:hover:text-white"
        >
          <PencilSquareIcon />
          Edit
        </button>

        <button
          onClick={handleClose}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-[9px] text-left font-medium text-dark-4 hover:bg-gray-2 hover:text-dark dark:text-dark-6 dark:hover:bg-dark-3 dark:hover:text-white"
        >
          <TrashIcon />
          Delete
        </button>
      </DropdownContent>
    </Dropdown>
  );
}
