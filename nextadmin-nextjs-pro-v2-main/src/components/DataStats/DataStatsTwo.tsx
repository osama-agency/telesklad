"use client";

import { ArrowDownIcon, ArrowUpIcon } from "@/assets/icons";

const dataStatsList = [
  {
    title: "Unique Visitors",
    value: "18.6K",
    growthRate: 18,
  },
  {
    title: "Total Pageviews",
    value: "55.9K",
    growthRate: 25,
  },
  {
    title: "Bounce Rate",
    value: "54%",
    growthRate: -7,
  },
  {
    title: "Visit Duration",
    value: "2m 56s",
    growthRate: 12,
  },
];

const DataStatsTwo = () => {
  return (
    <div className="col-span-12 rounded-[10px] bg-white py-5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-0">
        {dataStatsList.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-center gap-2 border-b border-stroke pb-5 last:border-b-0 last:pb-0 dark:border-dark-3 xl:border-b-0 xl:border-r xl:pb-0 last:xl:border-r-0"
          >
            <div>
              <div className="flex items-center gap-4.5">
                <h4 className="text-xl font-bold text-dark dark:text-white md:text-heading-5">
                  {item.value}
                </h4>

                <div
                  className={`flex items-center gap-1 text-body-sm font-medium ${
                    item.growthRate > 0 ? "text-green" : "text-yellow-dark"
                  }`}
                >
                  {item.growthRate > 0 ? (
                    <ArrowUpIcon aria-hidden />
                  ) : (
                    <ArrowDownIcon aria-hidden />
                  )}
                  <span>{item.growthRate}%</span>
                </div>
              </div>

              <p className="-mt-1 text-body-sm font-medium">{item.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataStatsTwo;
