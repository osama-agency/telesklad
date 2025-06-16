import { generatePageNumbers } from "@/lib/generate-page-numbers";
import Link from "next/link";
import React from "react";
import { Ellipsis, LeftArrow, RightArrow } from "./icons";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function PaginationOne({ currentPage, totalPages }: PaginationProps) {
  return (
    <nav>
      <ul className="flex flex-wrap items-center">
        <li>
          <NavigationLink
            href={`?page=${currentPage - 1}`}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <LeftArrow />
          </NavigationLink>
        </li>

        {generatePageNumbers(totalPages, currentPage).map((page, index) => (
          <li key={"style-1" + index}>
            {typeof page === "number" ? (
              <Link
                href={`?page=${page}`}
                className={`flex items-center justify-center rounded-[3px] px-3 py-1.5 font-medium ${
                  page === currentPage
                    ? "bg-primary text-white"
                    : "hover:bg-primary hover:text-white"
                }`}
              >
                {page}
              </Link>
            ) : (
              <span className="flex items-center justify-center px-3 py-1.5">
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
            <span className="sr-only">Go to next page</span>

            <RightArrow />
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
      className="flex size-8 items-center justify-center rounded-[3px] hover:bg-primary hover:text-white aria-disabled:pointer-events-none aria-disabled:opacity-50"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      {...props}
    >
      {children}
    </Link>
  );
}
