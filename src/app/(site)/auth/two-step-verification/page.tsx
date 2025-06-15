import { LogoIcon } from "@/components/logo-icon";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Two Step Verification",
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
                  Two Step Verification
                </h1>

                <p className="font-medium text-dark-4 dark:text-dark-6">
                  Enter the verification code we sent to
                </p>

                <p className="font-medium text-dark dark:text-white">
                  +1 234 567 8910
                </p>
              </div>

              <div className="mt-7.5">
                <form>
                  <div className="mb-5">
                    <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                      Type your 6 digits security code
                    </label>

                    <div className="flex items-center gap-2.5">
                      <input
                        type="text"
                        className="h-15 w-15 rounded-md border border-stroke bg-gray text-center text-2xl font-medium text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-gray-dark dark:text-white dark:focus:border-primary"
                      />
                      <input
                        type="text"
                        className="h-15 w-15 rounded-md border border-stroke bg-gray text-center text-2xl font-medium text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-gray-dark dark:text-white dark:focus:border-primary"
                      />
                      <input
                        type="text"
                        className="h-15 w-15 rounded-md border border-stroke bg-gray text-center text-2xl font-medium text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-gray-dark dark:text-white dark:focus:border-primary"
                      />
                      <input
                        type="text"
                        className="h-15 w-15 rounded-md border border-stroke bg-gray text-center text-2xl font-medium text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-gray-dark dark:text-white dark:focus:border-primary"
                      />
                      <input
                        type="text"
                        className="h-15 w-15 rounded-md border border-stroke bg-gray text-center text-2xl font-medium text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-gray-dark dark:text-white dark:focus:border-primary"
                      />
                      <input
                        type="text"
                        className="h-15 w-15 rounded-md border border-stroke bg-gray text-center text-2xl font-medium text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-gray-dark dark:text-white dark:focus:border-primary"
                      />
                    </div>
                  </div>

                  <button className="flex w-full items-center justify-center gap-2 rounded-[7px] bg-primary p-[13px] font-medium text-white hover:bg-opacity-90">
                    Verify
                  </button>

                  <div className="mt-6 text-center">
                    <p>
                      Don&apos;t receive a code?{" "}
                      <Link href="#" className="text-primary">
                        Resend
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="hidden w-full lg:w-1/2 xl:block">
            <div className="my-7.5 text-center">
              <div className="custom-gradient-1 overflow-hidden rounded-[16px] py-[180px]">
                <span className="inline-block">
                  <Image
                    width={562}
                    height={562}
                    src={"/images/illustration/illustration-06.svg"}
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
