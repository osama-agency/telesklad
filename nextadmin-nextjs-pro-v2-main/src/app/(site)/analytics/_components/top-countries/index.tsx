import { PeriodPicker } from "@/components/period-picker";
import Image from "next/image";
import { getTopCountries } from "../../fetch";
import { TopCountriesMap } from "./map";

export async function TopCountries() {
  const data = await getTopCountries();

  return (
    <div className="col-span-12 overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-6">
      <div className="px-4 pb-7.5 pt-5.5 md:px-6 xl:px-7.5">
        <div className="mb-7.5 items-center justify-between sm:flex">
          <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
            Top Countries
          </h2>

          <PeriodPicker
            sectionKey="top_countries"
            items={["Last 7 days", "Last 15 days"]}
            defaultValue="Last 7 days"
          />
        </div>

        <TopCountriesMap />
      </div>

      <div className="space-y-3.5 border-t border-stroke p-4 dark:border-dark-3 md:p-6 xl:p-7.5">
        {data.map((country, key) => (
          <div
            className="grid-cols-[theme(spacing[42.5]),auto] sm:grid"
            key={key}
          >
            <div className="flex items-center gap-3.5">
              <Image
                width={20}
                height={13}
                src={country.flag}
                alt={"Flag of country " + country.name}
              />

              <p className="font-medium text-dark dark:text-dark-6">
                {country.name}
              </p>
            </div>

            <div className="relative block h-4.5 w-full rounded bg-gray-3 dark:bg-[#FFFFFF1A]">
              <div
                className="absolute left-0 top-0 flex h-full items-center justify-center rounded bg-primary text-xs font-medium text-white"
                style={{
                  width: country.percentage + "%",
                }}
              >
                {country.percentage} %
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
