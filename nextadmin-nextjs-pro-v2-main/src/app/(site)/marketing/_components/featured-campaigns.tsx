"use client";

import DropdownDefault from "@/components/DropdownDefault";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  FacebookIcon,
  GoogleIcon,
  InstagramIcon,
  SerankingIcon,
} from "./icons";

const tabItems = [
  {
    title: "Google",
    icon: <GoogleIcon />,
    contentItem: [
      {
        emailTitle: "Best Headsets Giveaway",
        status: "In Queue",
        conversion: "0%(0)",
      },
      {
        emailTitle: "iPhone 14 Plus Giveaway",
        status: "Sent",
        conversion: "37%(247)",
      },
      {
        emailTitle: "Macbook Pro M1 Giveaway",
        status: "Sent",
        conversion: "18%(6.4k)",
      },
      {
        emailTitle: "Affiliation Program",
        status: "Sent",
        conversion: "12%(2.6K)",
      },
      {
        emailTitle: "Google AdSense",
        status: "In Draft",
        conversion: "0.01%(1)",
      },
    ],
  },
  {
    title: "Facebook",
    icon: <FacebookIcon />,
    contentItem: [
      {
        emailTitle: "iPhone 14 Plus Giveaway",
        status: "Sent",
        conversion: "37%(247)",
      },
      {
        emailTitle: "Macbook Pro M1 Giveaway",
        status: "Sent",
        conversion: "18%(6.4k)",
      },
      {
        emailTitle: "Best Headsets Giveaway",
        status: "In Queue",
        conversion: "0%(0)",
      },
      {
        emailTitle: "Google AdSense",
        status: "In Draft",
        conversion: "0.01%(1)",
      },
      {
        emailTitle: "Affiliation Program",
        status: "Sent",
        conversion: "12%(2.6K)",
      },
    ],
  },
  {
    title: "Instagram",
    icon: <InstagramIcon />,
    contentItem: [
      {
        emailTitle: "Best Headsets Giveaway",
        status: "In Queue",
        conversion: "0%(0)",
      },
      {
        emailTitle: "iPhone 14 Plus Giveaway",
        status: "Sent",
        conversion: "37%(247)",
      },
      {
        emailTitle: "Macbook Pro M1 Giveaway",
        status: "Sent",
        conversion: "18%(6.4k)",
      },
      {
        emailTitle: "Google AdSense",
        status: "In Draft",
        conversion: "0.01%(1)",
      },
      {
        emailTitle: "Affiliation Program",
        status: "Sent",
        conversion: "12%(2.6K)",
      },
    ],
  },
  {
    title: "Seranking",
    icon: <SerankingIcon />,
    contentItem: [
      {
        emailTitle: "iPhone 14 Plus Giveaway",
        status: "Sent",
        conversion: "37%(247)",
      },
      {
        emailTitle: "Best Headsets Giveaway",
        status: "In Queue",
        conversion: "0%(0)",
      },
      {
        emailTitle: "Google AdSense",
        status: "In Draft",
        conversion: "0.01%(1)",
      },
      {
        emailTitle: "Macbook Pro M1 Giveaway",
        status: "Sent",
        conversion: "18%(6.4k)",
      },
      {
        emailTitle: "Affiliation Program",
        status: "Sent",
        conversion: "12%(2.6K)",
      },
    ],
  },
];

export function FeaturedCampaigns() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="col-span-12 rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-6">
      <div className="flex items-start justify-between border-b border-stroke px-6 pb-4 pt-5 dark:border-dark-3">
        <div>
          <h2 className="mb-1.5 text-body-2xlg font-bold text-dark dark:text-white">
            Featured Campaigns
          </h2>
          <p className="text-body-sm font-medium">75% activity growth</p>
        </div>
        <DropdownDefault />
      </div>

      <div className="px-6 pb-7.5 pt-6">
        {/* <!-- Featured Tab Buttons --> */}
        <div className="mb-5.5 flex flex-wrap items-center gap-3.5">
          {tabItems.map((item, index) => (
            <button
              key={index}
              className={cn(
                "inline-flex items-center gap-3 rounded-md border px-4.5 py-2 font-medium hover:bg-gray-2 dark:hover:bg-dark-2",
                activeTab === index
                  ? "border-primary bg-primary/[0.08] text-primary"
                  : "border-stroke dark:border-dark-3",
              )}
              onClick={() => setActiveTab(index)}
            >
              {item.icon}
              {item.title}
            </button>
          ))}
        </div>
        {/* <!-- Featured Tab Buttons --> */}

        <Table>
          <TableHeader className="uppercase">
            <TableRow className="border-none bg-gray-1 hover:bg-gray-1 dark:bg-dark-2 dark:hover:bg-dark-2">
              <TableHead className="min-w-50">Email Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Conversion</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="font-medium text-dark dark:text-white">
            {tabItems[activeTab].contentItem.map((item, index) => (
              <TableRow className="border-none" key={index}>
                <TableCell>{item.emailTitle}</TableCell>

                <TableCell>
                  <span
                    className={cn(
                      "inline-block rounded px-2.5 py-1 text-xs font-medium",
                      {
                        "bg-yellow-light-4 text-yellow-dark-2":
                          item.status === "In Queue",
                        "bg-green-light-7 text-green-dark":
                          item.status === "Sent",
                        "border border-primary bg-primary/10 text-primary":
                          item.status === "In Draft",
                      },
                    )}
                  >
                    {item.status}
                  </span>
                </TableCell>

                <TableCell className="text-right">
                  <span className="text-body-sm">{item.conversion}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
