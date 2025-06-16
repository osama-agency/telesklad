import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { Tooltip } from "@/components/ui-elements/tooltip";

export default function TooltipsOne() {
  return (
    <ShowcaseSection title="Tooltips Style 1" className="p-4 sm:p-5 xl:p-7.5">
      <div className="flex flex-wrap justify-center gap-y-15">
        <div className="w-full sm:w-1/2 xl:w-1/4">
          <Tooltip content="Tooltip Text" variant="dark" align="top">
            <button className="inline-flex rounded-[5px] bg-primary px-4.5 py-[9px] font-medium text-white">
              Tooltip on top
            </button>
          </Tooltip>
        </div>

        <div className="w-full sm:w-1/2 xl:w-1/4">
          <Tooltip content="Tooltip Text" variant="dark" align="right">
            <button className="inline-flex rounded-[5px] bg-primary px-4.5 py-[9px] font-medium text-white">
              Tooltip on right
            </button>
          </Tooltip>
        </div>

        <div className="w-full sm:w-1/2 xl:w-1/4">
          <Tooltip content="Tooltip Text" variant="dark" align="bottom">
            <button className="inline-flex rounded-[5px] bg-primary px-4.5 py-[9px] font-medium text-white">
              Tooltip on bottom
            </button>
          </Tooltip>
        </div>

        <div className="w-full sm:w-1/2 xl:w-1/4">
          <Tooltip content="Tooltip Text" variant="dark" align="left">
            <button className="inline-flex rounded-[5px] bg-primary px-4.5 py-[9px] font-medium text-white">
              Tooltip on left
            </button>
          </Tooltip>
        </div>
      </div>
    </ShowcaseSection>
  );
}
