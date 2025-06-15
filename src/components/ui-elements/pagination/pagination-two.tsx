import { generatePageNumbers } from "@/lib/generate-page-numbers";
import Link from "next/link";
import { Ellipsis, LeftArrow, RightArrow } from "./icons"; // Importing the icons

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function PaginationTwo({
  currentPage,
  totalPages,
}: PaginationProps) {
  return (
    <nav>
      <ul className="flex flex-wrap items-center">
        <li>
          <NavigationLink
            navigationType="previous"
            href={`?page=${currentPage - 1}`}
            disabled={currentPage === 1}
          />
        </li>

        {generatePageNumbers(totalPages, currentPage).map((page, index) => (
          <li key={"style-2" + index}>
            {typeof page === "number" ? (
              <Link
                href={`?page=${page}`}
                className={`flex items-center justify-center border border-stroke border-l-transparent px-4 py-[5px] font-medium hover:border-primary hover:bg-gray-2 hover:text-primary dark:border-dark-3 dark:hover:border-primary dark:hover:bg-dark-2 ${
                  currentPage === page
                    ? "border-primary bg-primary text-white"
                    : ""
                } ${page > 5 && page === totalPages ? "border-l-stroke" : ""}`}
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
            navigationType="next"
            href={`?page=${currentPage + 1}`}
            disabled={currentPage === totalPages}
          />
        </li>
      </ul>
    </nav>
  );
}

type NavigationLinkProps = {
  navigationType: "previous" | "next";
  href: string;
  disabled?: boolean;
};

function NavigationLink({
  disabled,
  navigationType,
  ...props
}: NavigationLinkProps) {
  return (
    <Link
      className={`flex size-9 items-center justify-center border border-stroke hover:border-primary hover:bg-gray-2 hover:text-primary aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:border-dark-3 dark:hover:border-primary dark:hover:bg-dark-2 ${navigationType === "next" ? "rounded-r-md border-l-0" : "rounded-l-md"}`}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      {...props}
    >
      {navigationType === "previous" ? (
        <>
          <span className="sr-only">Go to previous page</span>
          <LeftArrow />
        </>
      ) : (
        <>
          <span className="sr-only">Go to next page</span>

          <RightArrow />
        </>
      )}
    </Link>
  );
}
