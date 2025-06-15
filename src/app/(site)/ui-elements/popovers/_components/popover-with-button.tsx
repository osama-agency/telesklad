import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui-elements/popover";

export function PopoverWithButtons() {
  return (
    <ShowcaseSection
      title="Popover With Button"
      className="p-4 sm:p-5 xl:p-7.5"
    >
      <div className="-mx-4 flex flex-wrap">
        <div className="w-full px-4 sm:w-1/2 xl:w-1/4">
          <div className="mb-60">
            <Popover>
              <PopoverTrigger>Popover Text</PopoverTrigger>

              <PopoverContent
                position="right"
                className="max-w-[533px] p-4 font-medium sm:p-5 xl:p-7.5"
              >
                <h4 className="mb-4 text-heading-6 font-bold text-dark dark:text-white">
                  Do you want to add this?
                </h4>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Mauris facilisis congue justo nec facilisis. Quisque quis
                  augue ipsum. Aliquam suscipit dui ac dui commodo.
                </p>
                <p className="mt-4">
                  Quisque quis augue ipsum. Aliquam suscipit dui ac dui.
                </p>

                <div className="mt-6 flex items-center gap-4">
                  <button className="inline-block rounded bg-primary px-7.5 py-2 font-medium text-white hover:bg-opacity-90">
                    Yes
                  </button>
                  <button className="inline-block rounded bg-dark-5 px-7.5 py-2 font-medium text-white hover:bg-opacity-90 dark:bg-dark-6 dark:hover:bg-opacity-90">
                    No
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </ShowcaseSection>
  );
}
