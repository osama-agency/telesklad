"use client";

import { RobotIcon, TextFileIcon } from "@/assets/icons";
import { useEffect, useState } from "react";

const downloadList = [
  {
    icon: <TextFileIcon />,
    name: "Content-script.txt",
    size: "455KB",
    uploadTime: "25 Nov, 2025",
  },
  {
    icon: <RobotIcon />,
    name: "E-commerce.apk",
    size: "55MB",
    uploadTime: "13 Dec, 2025",
  },
  {
    icon: <TextFileIcon />,
    name: "Random-text.doc",
    size: "455KB",
    uploadTime: "12 Feb, 2025",
  },
  {
    icon: <TextFileIcon />,
    name: "Random-text.doc",
    size: "455KB",
    uploadTime: "05 Jan, 2025",
  },
];

const DownloadList: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="col-span-12">
      <div className="rounded-[10px] bg-white p-3 shadow-1 dark:bg-gray-dark dark:shadow-card">
        {downloadList.map((item, index) => (
          <div
            key={index}
            className="flex justify-between gap-2.5 rounded-xl p-3 hover:bg-gray-1 dark:hover:bg-dark-2 sm:items-center sm:justify-start"
          >
            <div className="flex items-center gap-5.5 sm:w-5/12 xl:w-3/12">
              <div className="hidden h-14 w-full max-w-14 items-center justify-center rounded-full border border-stroke bg-gray-2 text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white sm:flex">
                {item.icon}
              </div>

              <p className="font-medium text-dark dark:text-white">
                {item.name}
              </p>
            </div>

            <div className="hidden sm:block sm:w-4/12 xl:w-2/12">
              <p className="font-medium text-dark dark:text-white">
                File size: {item.size}
              </p>
            </div>

            <div className="hidden w-5/12 xl:block">
              <p className="font-medium text-dark dark:text-white">
                Uploaded on: {item.uploadTime}
              </p>
            </div>

            <div className="text-right sm:w-3/12 xl:w-2/12">
              <button className="inline-flex rounded-[7px] bg-primary px-6 py-[9px] font-medium text-white hover:bg-opacity-90">
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DownloadList;
