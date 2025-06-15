"use client";

import { useEffect, useState } from "react";
import { CircleRangeIcon } from "./icons";

const StorageChart: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="relative overflow-clip rounded-[10px] bg-white py-8 pl-7.5 pr-12 shadow-1 dark:bg-gray-dark dark:shadow-card xl:py-11 2xl:pl-12 2xl:pr-16">
      <div className="flex flex-col gap-3 2xsm:flex-row 2xsm:items-center 2xl:gap-9">
        <div className="relative flex items-center justify-center">
          <CircleRangeIcon className="h-33 w-33 -rotate-90 transform" />
          <span className="absolute text-xl font-bold text-dark dark:text-white">
            85%
          </span>
        </div>

        <div>
          <h3 className="text-heading-6 font-bold leading-[26px] text-dark dark:text-white">
            Available Storage
          </h3>
          <p className="mt-2.5 font-medium">
            <span className="text-dark dark:text-white">150</span>
            <span className="text-body-sm"> GB</span> /
            <span className="text-dark dark:text-white"> 512</span>
            <span className="text-body-sm"> GB</span>
          </p>
        </div>
      </div>

      <button className="absolute -right-[23px] top-1/2 -translate-y-1/2 rotate-[270deg] rounded-t-lg bg-red-light px-4.5 py-1 font-medium text-white">
        Clean
      </button>
    </div>
  );
};

export default StorageChart;
