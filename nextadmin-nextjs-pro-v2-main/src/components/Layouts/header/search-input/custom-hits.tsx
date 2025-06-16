import Image from "next/image";
import Link from "next/link";
import { Hits } from "react-instantsearch";

type PropsType = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function CustomHits({ setIsOpen }: PropsType) {
  return (
    <Hits
      hitComponent={({ hit }) => (
        <Link
          href={hit?.url}
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-4 px-5.5 py-3.5 outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-slate-800 dark:focus-visible:bg-slate-800"
        >
          {hit?.imageURL && (
            <Image
              src={hit.imageURL}
              role="presentation"
              alt={"Image for " + hit.title}
              className="aspect-[4.5/3] w-16 shrink-0 rounded-lg object-cover shadow-sm"
              width={160}
              height={120}
              quality={100}
            />
          )}

          <div className="w-full">
            <h3 className="text-base font-medium text-dark dark:text-gray-400">
              {hit.name}
            </h3>

            <div className="flex gap-1 text-sm text-dark-5 dark:text-dark-6">
              <span>{hit.type}:</span>
              <span className="truncate">{hit.url}</span>
            </div>
          </div>
        </Link>
      )}
    />
  );
}
