"use client";

import { DocumentIcon } from "@/app/(site)/pages/file-manager/_components/icons";
import { MediaIcon } from "@/assets/icons";
import React, { useEffect, useState } from "react";

const listItems = [
  {
    icon: <MediaIcon />,
    name: "Media",
    size: "85 GB",
    percent: 80,
    color: "#5750F1",
  },
  {
    icon: <DocumentIcon />,
    name: "Documents",
    size: "25 GB",
    percent: 60,
    color: "#FF9C55",
  },
];

const StorageList: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex-grow space-y-5 rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card md:p-6 xl:p-8">
      {listItems.map((item, index) => (
        <div key={index} className="flex items-center gap-4">
          <div
            style={{ color: item.color }}
            className="flex h-11.5 w-11.5 items-center justify-center rounded-lg bg-[#F6F6F8] dark:bg-dark-2"
          >
            {item.icon}
          </div>

          <div className="flex-grow">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-medium text-dark dark:text-white">
                {item.name}
              </span>
              <span className="text-body-sm font-medium">{item.size}</span>
            </div>

            <div className="relative h-1.5 w-full rounded-full bg-stroke dark:bg-dark-3">
              <span
                className="absolute left-0 block h-1.5 rounded-full"
                style={{
                  width: item.percent + "%",
                  backgroundColor: item.color,
                }}
              ></span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StorageList;
