"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useId, useState } from "react";

export function RowActions() {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="group mx-auto flex items-center gap-1 rounded-md px-3 py-[5px] text-[14px] font-medium text-dark shadow-[0px_1px_3px_0px_rgba(166,175,195,0.40)] hover:text-accent data-[state=open]:text-accent dark:border dark:border-dark-3 dark:text-white dark:shadow-none">
        <span>Action</span>
        <ChevronUpIcon className="size-4 translate-y-[5%] rotate-180 transition-transform group-data-[state=open]:rotate-0" />
      </DropdownTrigger>

      <DropdownContent
        className="border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark"
        align="end"
      >
        <ul className="w-40 overflow-clip rounded-[5px] p-0 text-sm font-medium text-current shadow-[0px_0.5px_3px_0px_rgba(0,0,0,0.18)]">
          {["Edit", "Delete", "Details"].map((action) => (
            <li key={action + id}>
              <button
                onClick={() => setIsOpen(false)}
                className="block w-full px-[15px] py-2.5 text-left hover:bg-[#F5F7FD] hover:text-accent focus:bg-[#F5F7FD] focus:text-accent dark:hover:bg-dark-3 dark:hover:text-neutral-50"
              >
                {action}
              </button>
            </li>
          ))}
        </ul>
      </DropdownContent>
    </Dropdown>
  );
}
