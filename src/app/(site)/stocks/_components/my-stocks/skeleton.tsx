import { Skeleton } from "@/components/ui/skeleton";

export function MyStocksSkeleton() {
  return (
    <div className="col-span-12 overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark xl:col-span-5">
      <h2 className="p-7.5 text-body-2xlg font-bold text-dark dark:text-white">
        My Stocks
      </h2>

      <ul>
        {Array.from({ length: 5 }).map((_, i) => (
          <li
            key={i}
            className="flex items-center justify-between px-7.5 py-3.5"
          >
            <figure className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />

              <figcaption className="text-sm">
                <div className="mb-1 font-bold leading-6 text-dark dark:text-white">
                  <Skeleton className="h-6 w-32" />
                </div>

                <div className="font-medium">
                  <Skeleton className="h-5.5 w-16" />
                </div>
              </figcaption>
            </figure>

            <dl className="">
              <dt className="mb-1 font-medium text-dark dark:text-white">
                <Skeleton className="h-6 w-20" />
              </dt>

              <dd className="sr-only">Price</dd>

              <dt>
                <Skeleton className="ml-auto h-4 w-14" />
              </dt>

              <dd className="sr-only">Return rate</dd>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
