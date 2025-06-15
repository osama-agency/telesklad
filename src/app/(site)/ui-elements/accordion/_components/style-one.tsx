import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDownFilledIcon } from "./icons";

const DATA = Array.from({ length: 5 }, () => ({
  question: "How fast we deliver your first blog post?",
  answer:
    "It takes 2-3 weeks to get your first blog post ready. That includes the in-depth research & creation of your monthly content marketing strategy that we do before writing your first blog post, Ipsum available .",
}));

export function AccordionStyleOne() {
  return (
    <ShowcaseSection title="Accordion Style 1" className="p-4 sm:p-6 xl:p-12.5">
      <AccordionRoot className="grid grid-cols-1 gap-x-4 gap-y-6 md:gap-x-6 xl:grid-cols-2 xl:gap-x-7.5">
        <div className="flex flex-col gap-6">
          {DATA.map(
            (faq, i) =>
              i % 2 === 0 && (
                <AccordionItem
                  key={i}
                  className="rounded-[5px] border border-stroke shadow-card-3 dark:border-dark-3 dark:shadow-card"
                >
                  <AccordionTrigger className="group flex w-full items-center gap-3 p-4 text-lg font-medium leading-6 text-dark data-[state=open]:pb-5 dark:text-white sm:p-6 xl:gap-6">
                    <div className="flex size-10.5 items-center justify-center rounded-[5px] bg-[#F3F5FC] dark:bg-dark-2">
                      <ChevronDownFilledIcon className="fill-primary stroke-primary transition-transform ease-linear group-data-[state=open]:rotate-180 dark:fill-white dark:stroke-white" />
                    </div>

                    {faq.question}
                  </AccordionTrigger>

                  <AccordionContent className="pb-4 pr-4 sm:pb-6 sm:pr-6">
                    <p className="ml-18 font-medium sm:ml-22">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ),
          )}
        </div>

        <div className="flex flex-col gap-6">
          {DATA.map(
            (faq, i) =>
              i % 2 !== 0 && (
                <AccordionItem
                  key={i}
                  className="rounded-[5px] border border-stroke shadow-card-3 dark:border-dark-3 dark:shadow-card"
                >
                  <AccordionTrigger className="group flex w-full items-center gap-3 p-4 text-lg font-medium leading-6 text-dark data-[state=open]:pb-5 dark:text-white sm:p-6 xl:gap-6">
                    <div className="flex size-10.5 items-center justify-center rounded-[5px] bg-[#F3F5FC] dark:bg-dark-2">
                      <ChevronDownFilledIcon className="fill-primary stroke-primary transition-transform ease-linear group-data-[state=open]:rotate-180 dark:fill-white dark:stroke-white" />
                    </div>

                    {faq.question}
                  </AccordionTrigger>

                  <AccordionContent className="pb-4 pr-4 sm:pb-6 sm:pr-6">
                    <p className="ml-18 font-medium sm:ml-22">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ),
          )}
        </div>
      </AccordionRoot>
    </ShowcaseSection>
  );
}