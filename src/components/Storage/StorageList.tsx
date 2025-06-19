"use client";

import React, { useEffect, useState } from "react";
// import { DocumentIcon } from "@/app/(site)/pages/file-manager/_components/icons";

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const MediaIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const listItems = [
  {
    icon: <MediaIcon />,
    name: "Media",
    size: "85 GB",
    percent: 80,
    color: "#1B6EF3",
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
