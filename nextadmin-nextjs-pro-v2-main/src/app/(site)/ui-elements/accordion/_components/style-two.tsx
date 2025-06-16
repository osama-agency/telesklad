import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CircleMinusIcon, CirclePlusIcon } from "./icons";

const QUESTIONS = [
  "Can I use TailGrids Pro for my clients projects?",
  "Which license type is suitable for me?",
  "Is Windy UI Well-documented?",
  "Do you provide support?",
];

const DATA = QUESTIONS.map((question) => ({
  question,
  answer:
    "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomized words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything.",
}));

export function AccordionStyleTwo() {
  return (
    <ShowcaseSection title="Accordion Style 2" className="p-4 sm:p-6 xl:p-12.5">
      <AccordionRoot className="space-y-7.5">
        {DATA.map(({ question, answer }) => (
          <AccordionItem
            key={question}
            className="rounded-[5px] border border-stroke shadow-card-3 dark:border-dark-3 dark:shadow-card"
          >
            <AccordionTrigger className="group flex w-full flex-wrap items-center justify-between gap-2 px-4 py-6 data-[state=open]:pb-5 md:px-6 xl:pl-7.5">
              <span className="text-lg font-bold text-dark dark:text-white sm:text-heading-6">
                {question}
              </span>

              <div className="text-primary dark:text-white">
                <CirclePlusIcon className="group-data-[state=open]:hidden" />
                <CircleMinusIcon className="group-data-[state=closed]:hidden" />
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 py-6 pt-0 md:px-6 xl:pl-7.5">
              <p className="font-medium">{answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </AccordionRoot>
    </ShowcaseSection>
  );
}
