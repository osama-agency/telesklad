import { generatePageNumbers } from "@/lib/generate-page-numbers";
import Link from "next/link";
import React from "react";
import { Ellipsis } from "./icons";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function PaginationThree({
  currentPage,
  totalPages,
}: PaginationProps) {
  return (
    <nav>
      <ul className="inline-flex flex-wrap items-center gap-2 rounded-[5px] bg-white p-2.5 shadow-card-5 dark:bg-dark-2 dark:shadow-card">
        {/* Previous Button */}
        <li>
          <NavigationLink
            href={`?page=${currentPage - 1}`}
            disabled={currentPage === 1}
          >
            Previous
          </NavigationLink>
        </li>

        {generatePageNumbers(totalPages, currentPage).map((page, index) => (
          <li key={index}>
            {typeof page === "number" ? (
              <Link
                href="#"
                className={`flex items-center justify-center rounded-[3px] px-[7px] font-medium hover:bg-primary hover:text-white ${
                  currentPage === page ? "bg-primary text-white" : ""
                }`}
              >
                {page}
              </Link>
            ) : (
              <span className="flex items-center justify-center rounded-[3px] px-[7px] font-medium">
                <Ellipsis />
              </span>
            )}
          </li>
        ))}

        <li>
          <NavigationLink
            href={`?page=${currentPage + 1}`}
            disabled={currentPage === totalPages}
          >
            Next
          </NavigationLink>
        </li>
      </ul>
    </nav>
  );
}

type NavigationLinkProps = {
  href: string;
  children: React.ReactNode;
  disabled?: boolean;
};

function NavigationLink({ children, disabled, ...props }: NavigationLinkProps) {
  return (
    <Link
      className="flex items-center justify-center rounded-[3px] bg-[#EDEFF1] px-2.5 py-1 text-xs font-medium text-dark hover:bg-primary hover:text-white aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:bg-dark-4 dark:text-white dark:hover:bg-primary dark:hover:text-white"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      {...props}
    >
      {children}
    </Link>
  );
}
