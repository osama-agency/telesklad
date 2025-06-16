import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Terms & Conditions" />

      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex flex-col gap-7.5 p-4 sm:p-6 xl:p-9">
          <div>
            <h3 className="mb-5 text-[26px] font-bold leading-[30px] text-dark dark:text-white">
              Terms & Services
            </h3>

            <p className="font-medium text-dark-4 dark:text-dark-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
              mattis quis ligula id molestie. Ut ultricies nulla sed mi
              elementum eleifend. Vivamus interdum mollis metus. Sed vitae orci
              porta, interdum nisi ac, vestibulum massa. Curabitur lorem sem,
              scelerisque ut lectus.
            </p>

            <p className="mt-4.5 font-medium text-dark-4 dark:text-dark-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
              mattis quis ligula id molestie.
            </p>
          </div>

          <div>
            <h4 className="mb-4.5 text-[22px] font-bold leading-[30px] text-dark dark:text-white">
              Lorem ipsum 1
            </h4>

            <p className="font-medium text-dark-4 dark:text-dark-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
              mattis quis ligula id molestie. Ut ultricies nulla sed mi
              elementum eleifend. Vivamus interdum mollis metus. Sed vitae orci
              porta, interdum nisi ac, vestibulum massa. Curabitur lorem sem,
              scelerisque ut lectus Aliquam erat volutpat. Ut a diam ultrices,
              pellentesque magna iaculis, pellentesque lacus. Nulla at luctus
              ligula. Donec nibh est, elementum in tincidunt ac, luctus ut
              ipsum. In hac habitasse platea dictumst.
            </p>

            <p className="mt-4.5 font-medium text-dark-4 dark:text-dark-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
              mattis quis ligula id molestie. Ut ultricies nulla sed mi
              elementum eleifend. Vivamus interdum mollis metus. Sed vitae orci
              porta, interdum nisi ac, vestibulum massa. Curabitur lorem sem.
            </p>

            <p className="mt-4.5 font-medium text-dark-4 dark:text-dark-6">
              Curabitur lorem sem, scelerisque ut lectus Aliquam erat volutpat.
              Ut a diam ultrices, pellentesque magna iaculis, pellentesque
              lacus. Nulla at luctus ligula. Donec nibh est, elementum in
              tincidunt ac, luctus ut ipsum. In hac habitasse platea dictumst
              Curabitur lorem sem, scelerisque erat volutpat.
            </p>
          </div>

          <div>
            <h4 className="mb-4.5 text-[22px] font-bold leading-[30px] text-dark dark:text-white">
              Lorem ipsum 2
            </h4>

            <p className="font-medium text-dark-4 dark:text-dark-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
              mattis quis ligula id molestie. Ut ultricies nulla sed mi
              elementum eleifend. Vivamus interdum mollis metus. Sed vitae orci
              porta, interdum nisi ac, vestibulum massa. Curabitur lorem sem.
            </p>

            <p className="mt-4.5 font-medium text-dark-4 dark:text-dark-6">
              Curabitur lorem sem, scelerisque ut lectus Aliquam erat volutpat.
              Ut a diam ultrices, pellentesque magna iaculis, pellentesque
              lacus. Nulla at luctus ligula. Donec nibh est, elementum in
              tincidunt ac, luctus ut ipsum. In hac habitasse platea dictumst
              Curabitur lorem sem, scelerisque erat volutpat.
            </p>
          </div>

          <div>
            <h4 className="mb-5 text-[22px] font-bold leading-[30px] text-dark dark:text-white">
              Important Links
            </h4>

            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href={"#"} className="font-medium text-primary underline">
                  Lorem ipsum dolor sit amet,
                </Link>
              </li>

              <li>
                <Link href={"#"} className="font-medium text-primary underline">
                  Curabitur lorem sem scelerisque erat volutpat.
                </Link>
              </li>

              <li>
                <Link href={"#"} className="font-medium text-primary underline">
                  Scelerisque erat volutpat.
                </Link>
              </li>

              <li>
                <Link href={"#"} className="font-medium text-primary underline">
                  elementum eleifend
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
