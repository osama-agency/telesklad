"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cva } from "class-variance-authority";
import Link from "next/link";
import { useId, useState } from "react";

const dropdownStyles = cva(undefined, {
  variants: {
    buttonVariant: {
      one: "flex items-center gap-2.5 rounded-[7px] bg-primary px-5.5 py-[13px] font-medium text-white hover:bg-opacity-95",
      two: "flex items-center gap-2.5 rounded-[7px] bg-primary px-5.5 py-[13px] font-medium text-white hover:bg-opacity-95",
      three:
        "flex items-center gap-2.5 rounded-[7px] bg-dark px-5.5 py-[13px] font-medium text-white hover:bg-opacity-95",
    },
    contentVariant: {
      one: "mt-2 w-full max-w-[200px] rounded-[7px] border border-stroke bg-white py-3 shadow-card-4 dark:border-dark-3 dark:bg-dark-2",
      two: "mt-2 w-full max-w-[200px] rounded-[7px] bg-primary py-3 shadow-card-4",
      three:
        "mt-2 w-full max-w-[200px] rounded-[7px] bg-dark py-3 shadow-card-4",
    },
    linkVariant: {
      one: "flex px-5 py-[7px] font-medium hover:bg-gray-2 hover:text-primary dark:hover:bg-dark-4 dark:hover:text-white",
      two: "flex px-5 py-[7px] font-medium text-[#ACBBED] hover:text-white",
      three: "flex px-5 py-[7px] font-medium text-dark-6 hover:text-white",
    },
  },
});

type PropsType = {
  variant?: "one" | "two" | "three";
  items: string[];
  triggerText: string;
};

export function Dropdowns({ variant = "one", triggerText, items }: PropsType) {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();

  return (
    <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      <h3 className="border-b border-stroke px-4 py-4 font-medium text-dark dark:border-dark-3 dark:text-white sm:px-6 xl:px-7.5">
        Dropdowns Style{" "}
        {variant === "one" ? "1" : variant === "two" ? "2" : "3"}
      </h3>

      <div className="mb-50 p-4 sm:p-6 xl:p-10">
        <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
          <DropdownTrigger
            className={dropdownStyles({
              buttonVariant: variant,
              className:
                "flex items-center gap-2.5 rounded-[7px] px-5.5 py-[13px] font-medium text-white hover:bg-opacity-95",
            })}
          >
            <span>{triggerText}</span>
            <ChevronUpIcon className="size-5 rotate-180 transition-transform data-[state=open]:rotate-0" />
          </DropdownTrigger>

          <DropdownContent
            align="start"
            className={dropdownStyles({
              contentVariant: variant,
              className:
                "mt-2 w-full max-w-[200px] rounded-[7px] py-3 shadow-card-4",
            })}
          >
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item + id}>
                  <Link
                    href="#"
                    onClick={() => setIsOpen(false)}
                    className={dropdownStyles({
                      linkVariant: variant,
                      className: "flex px-5 py-[7px] font-medium",
                    })}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </DropdownContent>
        </Dropdown>
      </div>
    </div>
  );
}

