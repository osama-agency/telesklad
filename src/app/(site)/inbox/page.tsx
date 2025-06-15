import Inbox from "@/components/Inbox";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Inbox Page",
};

const InboxPage: React.FC = () => {
  return (
    <>
      <Breadcrumb pageName="Inbox" />

      <Inbox />
    </>
  );
};

export default InboxPage;
