import Messages from "@/components/Messages";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages",
  // other metadata
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Messages" />

      <Messages />
    </>
  );
};

