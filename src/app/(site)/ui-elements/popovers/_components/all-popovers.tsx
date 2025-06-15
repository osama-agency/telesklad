import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { PopoverOne } from "@/components/ui-elements/popover/popover-one";

export function AllPopovers() {
  return (
    <ShowcaseSection
      title="Popover in Four directions"
      className="p-4 sm:p-5 xl:p-7.5"
    >
      <div className="flex flex-wrap justify-center">
        <div className="mt-10 w-full px-4 sm:mb-60 sm:w-1/2 xl:w-1/4">
          <PopoverOne
            title="Popover Title"
            description="Lorem ipsum dolor sit amet, consect adipiscing elit. Mauris facilisis congue exclamate justo nec facilisis."
            position="bottom"
            triggerLabel="Popover On Bottom"
          />
        </div>

        <div className="mt-10 w-full px-4 sm:mb-60 sm:w-1/2 xl:w-1/4">
          <PopoverOne
            title="Popover Title"
            description="Lorem ipsum dolor sit amet, consect adipiscing elit. Mauris facilisis congue exclamate justo nec facilisis."
            position="right"
            triggerLabel="Popover On Right"
          />
        </div>

        <div className="mt-10 w-full px-4 sm:mb-60 sm:w-1/2 xl:w-1/4">
          <PopoverOne
            title="Popover Title"
            description="Lorem ipsum dolor sit amet, consect adipiscing elit. Mauris facilisis congue exclamate justo nec facilisis."
            position="top"
            triggerLabel="Popover On Top"
          />
        </div>

        <div className="mt-10 w-full px-4 sm:mb-60 sm:w-1/2 xl:w-1/4">
          <PopoverOne
            title="Popover Title"
            description="Lorem ipsum dolor sit amet, consect adipiscing elit. Mauris facilisis congue exclamate justo nec facilisis."
            position="left"
            triggerLabel="Popover On Left"
          />
        </div>
      </div>
    </ShowcaseSection>
  );
}

