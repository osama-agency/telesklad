import {
  FacebookIcon,
  LinkedInIcon,
  XIcon,
  YoutubeIcon,
} from "@/assets/icons/social";
import CountDownTimer from "@/components/CountDownTimer";
import { LogoIcon } from "@/components/logo-icon";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Coming Soon",
  description: "This is Coming Soon page for NextAdmin",
};

export default function Page() {
  return (
    <div className="relative z-10 overflow-hidden bg-white px-4 dark:bg-gray-dark sm:px-8">
      <div className="flex h-screen flex-col items-center justify-center overflow-hidden">
        <div className="no-scrollbar overflow-y-auto py-20">
          <div className="mx-auto w-full max-w-[600px]">
            <div className="text-center">
              <Link href="/" className="mx-auto mb-10 inline-flex">
                <LogoIcon />
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
          <div className="mx-auto mt-10 w-full max-w-[740px]">
            <form action="#">
              <div className="flex items-center gap-4 max-sm:flex-col">
                <div className="w-full">
                  <input
                    type="text"
                    placeholder="Enter your email address"
                    className="w-full rounded-lg border border-stroke bg-transparent px-6 py-3 text-dark outline-none focus:border-primary dark:border-dark-3 dark:text-white dark:focus:border-primary"
                  />
                </div>

                <button
                  aria-label="get notified button"
                  className="flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-white duration-300 ease-in-out hover:bg-primary/90 max-sm:w-full sm:w-fit"
                >
                  Get Notified
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

        <div>
          <span className="absolute left-0 top-0 z-[-1]">
            <svg
              width="495"
              height="470"
              viewBox="0 0 495 470"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="55"
                cy="442"
                r="138"
                stroke="url(#paint0_linear_25:217)"
              />
              <circle
                cx="446"
                r="39"
                stroke="url(#paint1_linear_25:217)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_25:217"
                  x1="-54.5003"
                  y1="394.637"
                  x2="94.1109"
                  y2="338.066"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#4A6CF7" stopOpacity="0" />
                  <stop offset="1" stopColor="#4A6CF7" stopOpacity="0.09" />
                </linearGradient>
                <linearGradient
                  id="paint1_linear_25:217"
                  x1="407.707"
                  y1="-134.849"
                  x2="517.501"
                  y2="-70.1058"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#4A6CF7" stopOpacity="0" />
                  <stop offset="1" stopColor="#4A6CF7" stopOpacity="0.059" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="absolute bottom-0 right-0 z-[-1]">
            <svg
              width="493"
              height="470"
              viewBox="0 0 493 470"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="462"
                cy="5"
                r="138"
                stroke="url(#paint0_linear_25:219)"
              />
              <circle
                cx="49"
                cy="470"
                r="39"
                stroke="url(#paint1_linear_25:219)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_25:219"
                  x1="572.5"
                  y1="52.363"
                  x2="423.889"
                  y2="108.934"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#4A6CF7" stopOpacity="0" />
                  <stop offset="1" stopColor="#4A6CF7" stopOpacity="0.059" />
                </linearGradient>
                <linearGradient
                  id="paint1_linear_25:219"
                  x1="87.2934"
                  y1="604.849"
                  x2="-22.5006"
                  y2="540.106"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#4A6CF7" stopOpacity="0" />
                  <stop offset="1" stopColor="#4A6CF7" stopOpacity="0.059" />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
