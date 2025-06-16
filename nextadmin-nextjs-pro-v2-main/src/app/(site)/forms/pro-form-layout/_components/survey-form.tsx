import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { Select } from "@/components/FormElements/select";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { Checkbox } from "@/components/ui-elements/checkbox";
import { RadioInput } from "@/components/ui-elements/radio";

export function SurveyForm() {
  return (
    <ShowcaseSection title="Survey Form" className="!p-6.5">
      <form action="#">
        <InputGroup
          label="Name"
          type="text"
          placeholder="Enter your full name"
          className="mb-5"
        />

        <InputGroup
          label="Email"
          type="email"
          placeholder="Enter your email address"
          className="mb-5"
        />

        <InputGroup
          label="Age"
          type="text"
          placeholder="Enter your age"
          className="mb-5"
        />

        <Select
          label="Which option best describes you?"
          placeholder="Select your subject"
          className="mb-5"
          items={[
            { label: "Student", value: "student" },
            { label: "UX/UI Designer", value: "ux-ui-designer" },
            { label: "Web Developer", value: "web-developer" },
          ]}
        />

        <fieldset className="mb-5.5">
          <legend className="mb-4.5 text-body-sm font-medium text-dark dark:text-white">
            Would you recommend our site to a friend?
          </legend>

          <div className="space-y-2.5">
            {["Yes", "No", "Maybe"].map((option) => (
              <RadioInput
                key={option}
                label={option}
                name="recommend"
                minimal
                value={option.toLowerCase()}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-5.5">
          <legend className="mb-4.5 text-body-sm font-medium text-dark dark:text-white">
            Which languages & frameworks you know?
          </legend>

          <div className="space-y-2.5 [&>*]:font-medium [&>*]:text-dark dark:[&>*]:text-white">
            {[
              "C",
              "C++",
              "Java",
              "Python",
              "JavaScript",
              "React",
              "Angular",
            ].map((option) => (
              <Checkbox
                key={option}
                label={option}
                name="languageAndFrameworks"
                withIcon="check"
                withBg
                minimal
              />
            ))}
          </div>
        </fieldset>

        <TextAreaGroup
          label="Any comments or suggestions?"
          placeholder="Type your message"
        />

        <button className="mt-5.5 flex w-full justify-center rounded-lg bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
          Send Message
        </button>
      </form>
    </ShowcaseSection>
  );
}
