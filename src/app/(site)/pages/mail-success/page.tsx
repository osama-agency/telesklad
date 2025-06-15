import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { ArrowLeftIcon } from "@/assets/icons";
import { Metadata } from "next";
import { MessageSendIcon } from "./_components/icons";

export const metadata: Metadata = {
  title: "Next.js MailSuccess Page | NextAdmin - Next.js Dashboard Kit",
  description: "This is Next.js MailSuccess page for NextAdmin Dashboard Kit",
};

const MailSuccess: React.FC = () => {
  return (
    <>
      <div className="mx-auto w-full max-w-[1148px]">
        <Breadcrumb pageName="Mail Success" />

        <div className="rounded-[10px] bg-white px-5 py-10 shadow-1 dark:bg-gray-dark dark:shadow-card sm:py-20">
          <div className="mx-auto w-full max-w-[588px] px-4 sm:px-8 xl:px-0">
            <div className="relative z-1 lg:pt-15 xl:pt-20 2xl:pt-[157px]">
              <div className="absolute left-0 top-0 -z-1">
                <Image
                  src="/images/grids/grid-01.svg"
                  alt="grid"
                  role="presentation"
                  width={575}
                  height={460}
                  className="dark:opacity-20"
                />
              </div>

              <div className="text-center">
                <div className="mx-auto mb-10 flex h-28.5 w-full max-w-[114px] items-center justify-center rounded-full border border-stroke bg-white text-dark shadow-error dark:border-dark-3 dark:bg-dark-2 dark:text-white">
                  <MessageSendIcon />
                </div>

                <h1 className="mb-5 text-heading-4 font-black text-dark dark:text-white lg:text-heading-3">
                  Message Sent Successfully!
                </h1>

                <p className="mx-auto w-full max-w-[588px]">
                  Thank you so much for your message. We check e-mail frequently
                  and will try our best to respond to your inquiry.
                </p>

                <Link
                  href="/"
                  className="mt-8 inline-flex items-center gap-2 rounded-[7px] bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90"
                >
                  <ArrowLeftIcon />

                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MailSuccess;
