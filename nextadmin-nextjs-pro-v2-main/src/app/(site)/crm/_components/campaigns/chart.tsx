"use client";

import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";

type PropsType = {
  series: { name: string; data: { x: string; y: number }[] }[];
};

export function CampaignsChart({ series }: PropsType) {
  const options: ApexOptions = {
    colors: ["#3C50E0", "#80CAEE"],
    chart: {
      fontFamily: "inherit",
      type: "bar",
      height: 250,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "35%",
        borderRadius: 0,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
      markers: {
        radius: 99,
      },
    },
    grid: {
      strokeDashArray: 7,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },

    tooltip: {
      x: {
        show: false,
      },
    },
  };

  return (
    <div id="chartNine" className="-ml-3">
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={250}
      />
    </div>
  );
}
