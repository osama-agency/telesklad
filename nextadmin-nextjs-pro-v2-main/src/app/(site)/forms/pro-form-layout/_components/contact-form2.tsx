import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { RadioInput } from "@/components/ui-elements/radio";

export function ContactForm2() {
  return (
    <ShowcaseSection title="Contact Form 2" className="!p-6.5">
      <form action="#">
        <div className="mb-5 flex flex-col gap-6 xl:flex-row">
          <InputGroup
            label="First name"
            type="text"
            placeholder="Jhon"
            className="w-full xl:w-1/2"
          />

          <InputGroup
            label="Last name"
            type="text"
            placeholder="Devine"
            className="w-full xl:w-1/2"
          />
        </div>

        <div className="mb-5.5 flex flex-col gap-6 xl:flex-row">
          <InputGroup
            label="Email"
            type="email"
            placeholder="yourmail@gmail.com"
            className="w-full xl:w-1/2"
          />

          <InputGroup
            label="Phone"
            type="text"
            placeholder="(321) 5555-0115"
            className="w-full xl:w-1/2"
          />
        </div>

        <fieldset className="mb-5.5">
          <legend className="mb-4.5 text-body-sm font-medium text-dark dark:text-white">
            Select option
          </legend>

          <div className="flex flex-wrap gap-5.5">
            {[
              "Graphics Design",
              "Web Development",
              "Logo Design",
              "Others",
            ].map((option) => (
              <RadioInput
                key={option}
                label={option}
                name="select"
                minimal
                value={option.toLowerCase()}
              />
            ))}
          </div>
        </fieldset>

        <TextAreaGroup label="Message" placeholder="Type your message" />

        <button className="mt-6 flex w-full justify-center rounded-lg bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
          Send Message
        </button>
      </form>
    </ShowcaseSection>
  );
}
