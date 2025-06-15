import { TrendingUpIcon } from "@/assets/icons";

const dataStatsList = [
  {
    title: "Clients Added",
    value: 197,
    growthRate: +2.5,
    percent: 60,
  },
  {
    title: "Contracts Signed",
    value: 745,
    growthRate: -1.5,
    percent: 30,
  },
  {
    title: "Invoice Sent",
    value: 512,
    growthRate: +0.5,
    percent: 70,
  },
];

export default function DataStatsFour() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
      {dataStatsList.map((item, index) => (
        <div
          key={index}
          className="rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card md:p-6 xl:p-7.5"
        >
          <div className="flex items-end justify-between">
            <div>
              <h3 className="mb-4 text-heading-5 font-bold text-dark dark:text-white">
                {item.value}
              </h3>
              <p className="font-medium">{item.title}</p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`flex items-center gap-1 rounded-[5px] px-[5px] py-1 text-body-xs font-medium leading-[15px] text-white ${
                    item.growthRate > 0 ? "bg-green" : "bg-red"
                  }`}
                >
                  {item.growthRate > 0 ? (
                    <TrendingUpIcon />
                  ) : (
                    <TrendingUpIcon className="scale-y-[-1]" />
                  )}
                  <span>
                    {item.growthRate > 0 && "+"}
                    {item.growthRate}%
                  </span>
                </span>

                <span className="text-body-sm font-medium">
                  Since last week
                </span>
              </div>
            </div>

            <div>
              <CircleRange itemPercent={item.percent} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CircleRange({ itemPercent }: { itemPercent: number }) {
  return (
    <svg className="h-17.5 w-17.5 -rotate-90 transform">
      <circle
        className="text-stroke dark:text-dark-3"
        strokeWidth="10"
        stroke="currentColor"
        fill="transparent"
        r="30"
        cx="35"
        cy="35"
      />
      <circle
        className="text-primary"
        strokeWidth="10"
        strokeDasharray={30 * 2 * Math.PI}
        strokeDashoffset={
          30 * 2 * Math.PI - (itemPercent / 100) * 30 * 2 * Math.PI
        }
        stroke="currentColor"
        fill="transparent"
        r="30"
        cx="35"
        cy="35"
      />
    </svg>
  );
}
