import CountDownTimer from "@/components/CountDownTimer";
import { LogoIcon } from "@/components/logo-icon";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Under Maintenance",
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
                  <LogoIcon />
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
            </div>
          </div>

          <div className="hidden w-full lg:block lg:w-1/2">
            <div className="flex h-screen flex-col items-center justify-center">
              <div className="max-w-[330px]">
                <div className="mx-auto text-center">
                  <div className="mx-auto mb-5 flex h-[350px] w-[350px] items-center justify-center rounded-full border border-stroke dark:border-dark-3">
                    <div className="flex h-[310px] w-[310px] items-center justify-center rounded-full border border-stroke dark:border-dark-3">
                      <div className="flex h-[270px] w-[270px] items-center justify-center rounded-full border border-stroke dark:border-dark-3">
                        <div className="flex h-[230px] w-[230px] items-center justify-center rounded-full border border-stroke dark:border-dark-3">
                          <div className="flex h-[190px] w-[190px] items-center justify-center rounded-full border border-stroke dark:border-dark-3">
                            <div className="flex h-[150px] w-[150px] items-center justify-center rounded-full border border-stroke dark:border-dark-3">
                              <div className="flex h-[110px] w-[110px] items-center justify-center rounded-full border border-stroke dark:border-dark-3">
                                <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full border border-stroke dark:border-dark-3">
                                  <div className="h-[30px] w-[30px] rounded-full border border-stroke dark:border-dark-3"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
