"use client";

import { CloseIcon, SearchIcon } from "@/assets/icons";
import { Modal } from "@/components/ui/modal";
import algoliasearch from "algoliasearch";
import { useState } from "react";
import {
  Configure,
  InstantSearch,
  useHits,
  useSearchBox,
} from "react-instantsearch";
import { CustomHits } from "./custom-hits";

const appID = process.env.NEXT_PUBLIC_ALGOLIA_PROJECT_ID!;
const apiKEY = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY!;
const INDEX = process.env.NEXT_PUBLIC_ALGOLIA_INDEX!;

const algoliaClient = algoliasearch(appID, apiKEY);

export function SearchInput() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3.5 rounded-full border bg-gray-2 p-3 outline-none ring-primary transition-colors focus-visible:ring-1 dark:border-dark-3 dark:bg-dark-2 dark:hover:border-dark-4 dark:hover:bg-dark-3 dark:hover:text-dark-6 min-[1015px]:w-[300px] min-[1015px]:px-5"
        aria-label="Open search"
      >
        <SearchIcon className="max-[1015px]:size-5" />
        <span className="max-[1015px]:sr-only">Search</span>
      </button>

      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-0 dark:border-none dark:bg-dark dark:text-gray-5">
          <h2 id="search-dialog-title" className="sr-only">
            Search dialog
          </h2>

          <div className="flex flex-1 flex-col overflow-y-auto">
            <InstantSearch searchClient={algoliaClient} indexName={INDEX}>
              <div className="flex flex-1 flex-col overflow-y-auto rounded-xl">
                <Configure hitsPerPage={10} />
                <SearchBox />
                <EmptyState />
                <div className="flex-1 overflow-y-auto">
                  <CustomHits setIsOpen={setIsOpen} />
                </div>
              </div>
            </InstantSearch>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-0 top-0 grid size-11 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full border-2 bg-white outline-none transition-colors hover:bg-gray-3 focus-visible:bg-gray-3 dark:border-dark-3 dark:bg-dark-2 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3"
            aria-label="Close search"
          >
            <CloseIcon />
          </button>
        </div>
      </Modal>
    </>
  );
}

const SearchBox = () => {
  const { refine } = useSearchBox();

  return (
    <div className="sticky top-0">
      <input
        type="search"
        onChange={(e) => refine(e.currentTarget.value)}
        placeholder="Site Search... (Powered by Algolia)"
        className="h-18 w-full border-b border-stroke bg-transparent pl-15 pr-4 text-dark outline-none dark:border-dark-3 dark:bg-dark dark:text-gray-5"
      />

      <SearchIcon
        width={20}
        height={20}
        className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2"
      />
    </div>
  );
};

const EmptyState = () => {
  const { items } = useHits();

  return (
    <>
      {!items.length && (
        <div className="py-12 text-center">
          Enter keywords to see results...
        </div>
      )}
    </>
  );
};
