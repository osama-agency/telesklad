import CountDownTimer from "@/components/CountDownTimer";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SocialAccounts } from "./_components/social-links";

export const metadata: Metadata = {
  title: "Under Maintenance Page",
};

export default function Page() {
  return (
    <div className="bg-white px-4 dark:bg-gray-dark sm:px-6">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex flex-wrap items-center">
          <div className="no-scrollbar h-screen w-full overflow-y-auto lg:w-1/2 xl:flex xl:items-center xl:justify-center">
            <div className="px-4 py-20 xl:px-0">
              <div>
                <Link href="/" className="mb-10 inline-flex">
                  <Image
                    width={176}
                    height={32}
                    src={"/images/logo/logo-dark.svg"}
                    alt="Logo"
                    priority
                    className="dark:hidden"
                  />
                  <Image
                    width={176}
                    height={32}
                    src={"/images/logo/logo.svg"}
                    alt="Logo"
                    priority
                    className="hidden dark:block"
                  />
                </Link>

                <h1 className="mb-2.5 text-3xl font-black text-dark dark:text-white lg:text-4xl xl:text-[50px] xl:leading-[60px]">
                  Under Maintenance
                </h1>

                <p className="font-medium text-dark-4 dark:text-dark-6">
                  Our website is under maintenance, wait for some time.
                </p>
              </div>

              <div className="mt-10">
                <CountDownTimer />
              </div>

              <SocialAccounts />
            </div>
          </div>

          <div className="hidden w-full lg:w-1/2 xl:block">
            <div className="my-7.5 text-center">
              <div className="custom-gradient-1 overflow-hidden rounded-[16px] py-[180px]">
                <span className="inline-block">
                  <Image
                    width={562}
                    height={562}
                    src={"/images/illustration/illustration-04.svg"}
                    alt="illustration"
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
