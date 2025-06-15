"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarIcon,
  StatisticsChartIcon,
  UsersGroupIcon,
} from "@/assets/icons";

const dataStatsList = [
  {
    icon: <StatisticsChartIcon />,
    title: "Avg. Client Rating",
    value: "7.8/10",
    growthRate: 2.5,
  },
  {
    icon: <UsersGroupIcon />,
    title: "Instagram Followers",
    value: "522K",
    growthRate: -1.5,
  },
  {
    icon: <DollarIcon />,
    title: "Google Ads CPC",
    value: "5.03",
    growthRate: 2.6,
  },
];

export default function DataStatsThree() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 2xl:gap-7.5">
      {dataStatsList.map((item, index) => (
        <div
          key={index}
          className="rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card sm:p-6 xl:p-7.5"
        >
          {item.icon}
          <h4 className="mb-2 mt-5 font-medium">{item.title}</h4>
          <h3 className="mb-2 text-heading-6 font-bold text-dark dark:text-white">
            {item.value}
          </h3>
          <p className="flex items-center gap-1.5 text-body-sm font-medium">
            <span
              className={`flex items-center gap-1 ${
                item.growthRate > 0 ? "text-green" : "text-red"
              }`}
            >
              {item.growthRate > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
              <span>
                {item.growthRate > 0 && "+"}
                {item.growthRate}%
              </span>
            </span>

            <span>than last Week</span>
          </p>
        </div>
      ))}
    </div>
  );
}
