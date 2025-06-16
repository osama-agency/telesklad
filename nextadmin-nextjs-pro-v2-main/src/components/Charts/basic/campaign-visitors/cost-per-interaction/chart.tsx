"use client";

import { sortChartDataByMonths } from "@/utils/sort-months";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

type PropsType = {
  chartSeries: { name: string; data: { x: string; y: number }[] }[];
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// NOTE: At line 89, charts data is being sorted by months. Remove it if you don't need it.

export function CostPerInteractionChart({ chartSeries }: PropsType) {
  const options: ApexOptions = {
    legend: {
      show: false,
    },
    colors: ["#5750F1", "#0ABEF9"],
    chart: {
      fontFamily: "inherit",
      height: 250,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    fill: {
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 320,
          },
        },
      },
    ],
    stroke: {
      width: [2, 2],
      curve: "smooth",
    },
    markers: {
      size: 0,
    },
    grid: {
      strokeDashArray: 7,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
  };

  return (
    <div className="-ml-3.5 -mr-4 mt-auto">
      <Chart
        options={options}
        series={chartSeries.map((item) => ({
          ...item,
          data: sortChartDataByMonths(item.data),
        }))}
        type="area"
        height={300}
      />
    </div>
  );
}
