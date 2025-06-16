import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRightIcon, SlashIcon } from "./icons";

type PropsType = {
  items: {
    label: string;
    href?: string;
  }[];
  divider?: "slash" | "arrow";
  prefixIcon?: React.ReactNode;
};

export function Breadcrumb({ items, divider, prefixIcon }: PropsType) {
  const dividerIcon = divider === "slash" ? <SlashIcon /> : <ArrowRightIcon />;

  return (
    <div className="rounded-[5px] border border-stroke p-4 py-3 dark:border-dark-3 sm:px-6 sm:py-5.5 xl:px-7.5">
      <nav>
        <ol className="flex flex-wrap items-center gap-3">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-3 font-medium">
              {index > 0 && dividerIcon}

              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 font-medium hover:text-primary",
                    index === 0 && "text-dark dark:text-white",
                  )}
                >
                  {prefixIcon && index === 0 && (
                    <div aria-hidden>{prefixIcon}</div>
                  )}

                  {item.label}
                </Link>
              ) : (
                <span className="hover:text-primary">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
