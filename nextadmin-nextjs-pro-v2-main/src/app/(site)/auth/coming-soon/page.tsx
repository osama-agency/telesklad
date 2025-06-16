import {
  FacebookIcon,
  LinkedInIcon,
  XIcon,
  YoutubeIcon,
} from "@/assets/icons/social";
import CountDownTimer from "@/components/CountDownTimer";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Coming Soon Page",
};

export default function Page() {
  return (
    <div className="relative z-10 overflow-hidden bg-white px-4 dark:bg-gray-dark sm:px-8">
      <div className="flex h-screen flex-col items-center justify-center overflow-hidden">
        <div className="no-scrollbar overflow-y-auto py-20">
          <div className="mx-auto w-full max-w-[600px]">
            <div className="text-center">
              <Link href="/" className="mx-auto mb-10 inline-flex">
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
                Coming Soon
              </h1>

              <p className="font-medium text-dark-4 dark:text-dark-6">
                Our website is currently under construction, enter your email id
                to get latest updates and notifications about the website.
              </p>
            </div>
          </div>

          {/* <!-- Countdown timer start --> */}
          <div className="mt-10 flex justify-center">
            <CountDownTimer />
          </div>
          {/* <!-- Countdown timer start --> */}

          {/* <!-- form start --> */}
          <div className="mx-auto mt-12.5 w-full max-w-[580px]">
            <form>
              <div className="flex">
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-l-lg border-[1.5px] border-r-0 border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-4 focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:placeholder:text-dark-6 dark:focus:border-primary"
                />
                <button className="inline-flex justify-center rounded-r-lg bg-primary px-4 py-3 font-medium text-white duration-200 ease-out hover:bg-opacity-90 sm:px-7.5">
                  Subscribe
                </button>
              </div>
            </form>
          </div>
          {/* <!-- form end --> */}

          {/* <!-- social link start --> */}
          <div className="mt-10 text-center">
            <p className="mb-5 font-medium text-dark dark:text-white">
              Follow Us On
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link
                href="#"
                className="flex size-10 items-center justify-center rounded-full border border-[#DFE4EA] text-dark-4 hover:border-primary hover:bg-primary hover:text-white dark:border-dark-3 dark:text-dark-6 dark:hover:border-primary dark:hover:text-white"
              >
                <FacebookIcon width={17} height={16} />
              </Link>

              <Link
                href="#"
                className="flex size-10 items-center justify-center rounded-full border border-[#DFE4EA] text-dark-4 hover:border-primary hover:bg-primary hover:text-white dark:border-dark-3 dark:text-dark-6 dark:hover:border-primary dark:hover:text-white"
              >
                <XIcon width={17} height={16} />
              </Link>

              <Link
                href="#"
                className="flex size-10 items-center justify-center rounded-full border border-[#DFE4EA] text-dark-4 hover:border-primary hover:bg-primary hover:text-white dark:border-dark-3 dark:text-dark-6 dark:hover:border-primary dark:hover:text-white"
              >
                <YoutubeIcon />
              </Link>

              <Link
                href="#"
                className="flex size-10 items-center justify-center rounded-full border border-[#DFE4EA] text-dark-4 hover:border-primary hover:bg-primary hover:text-white dark:border-dark-3 dark:text-dark-6 dark:hover:border-primary dark:hover:text-white"
              >
                <LinkedInIcon width={17} height={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute left-0 top-0 -z-10 flex h-screen w-full items-center justify-around">
        <div className="flex h-full gap-20">
          <span className="block h-full w-0.5 animate-line1">
            <span className="block h-55 w-0.5 bg-[#DEE4EE] dark:bg-dark-3"></span>
          </span>
          <span className="block h-full w-0.5 animate-line2">
            <span className="block h-36 w-0.5 bg-[#DEE4EE] dark:bg-dark-3"></span>
          </span>
          <span className="ml-10 block h-full w-0.5 animate-line3">
            <span className="block h-40 w-0.5 bg-[#DEE4EE] dark:bg-dark-3"></span>
          </span>
        </div>

        <div className="flex h-full gap-20">
          <span className="mr-10 block h-full w-0.5 animate-line1">
            <span className="block h-55 w-0.5 bg-[#DEE4EE] dark:bg-dark-3"></span>
          </span>
          <span className="block h-full w-0.5 animate-line2">
            <span className="block h-36 w-0.5 bg-[#DEE4EE] dark:bg-dark-3"></span>
          </span>
          <span className="block h-full w-0.5 animate-line3">
            <span className="block h-40 w-0.5 bg-[#DEE4EE] dark:bg-dark-3"></span>
          </span>
        </div>
      </div>
    </div>
  );
}
