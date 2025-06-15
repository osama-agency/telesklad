import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type PropsType = {
  data: {
    author?: {
      name: string;
      role: string;
      profileImage: string;
    };
    title: string;
    content: string;
    coverImage?: string;
  };
};

export function Card({
  data: { author, title, content, coverImage },
}: PropsType) {
  return (
    <article className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      {author && (
        <div className="max-w-fit px-6 py-5">
          <Link href="#">
            <figure className="flex items-center gap-3">
              <Image
                width={300}
                height={300}
                className="size-10 rounded-full"
                src={author.profileImage}
                alt="User"
                quality={100}
              />

              <figcaption>
                <div className="font-medium text-dark dark:text-white">
                  {author.name}
                </div>

                <div className="text-body-sm">{author.role}</div>
              </figcaption>
            </figure>
          </Link>
        </div>
      )}

      <Link href="#">
        {coverImage && (
          <Image
            width={432}
            height={238}
            src={coverImage}
            className={cn(
              "w-full rounded-[5px] object-cover px-4",
              !author && "pt-4",
            )}
            role="presentation"
            alt="Cards"
          />
        )}

        <div className={cn(coverImage && "p-6")}>
          <h3
            className={cn(
              "text-xl font-semibold text-dark hover:text-primary dark:text-white dark:hover:text-primary",
              coverImage
                ? "mb-3"
                : "border-b border-stroke px-7.5 py-5 dark:border-dark-3",
            )}
          >
            {title}
          </h3>

          <p
            className={cn(
              "font-medium dark:text-dark-6",
              !coverImage && "px-7.5 pb-9 pt-6",
            )}
          >
            {content}
          </p>
        </div>
      </Link>
    </article>
  );
}
