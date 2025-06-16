import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import type { Metadata } from "next";
import { Suspense } from "react";
import { ProTableStyle1 } from "./_components/style-1";
import { ProTableStyle1Skeleton } from "./_components/style-1/skeleton";
import { ProTableStyle2 } from "./_components/style-2";
import { ProTableStyle2Skeleton } from "./_components/style-2/skeleton";

export const metadata: Metadata = {
  title: "Pro Tables",
};

export default async function Page() {
  return (
    <>
      <Breadcrumb pageName="Pro Tables" />

      <div className="grid gap-10">
        <Suspense fallback={<ProTableStyle1Skeleton />}>
          <ProTableStyle1 />
        </Suspense>

        <Suspense fallback={<ProTableStyle2Skeleton />}>
          <ProTableStyle2 />
        </Suspense>
      </div>
    </>
  );
};

