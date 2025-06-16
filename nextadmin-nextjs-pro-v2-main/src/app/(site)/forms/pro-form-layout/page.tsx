import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import { ContactForm2 } from "./_components/contact-form2";
import { SurveyForm } from "./_components/survey-form";

export const metadata: Metadata = {
  title: "Pro Form Layout",
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Pro Form Layout" />

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div className="flex flex-col gap-9">
          <ContactForm2 />
        </div>

        <div className="flex flex-col gap-9">
          <SurveyForm />
        </div>
      </div>
    </>
  );
};


