"use client";

import { ChevronLeft, ChevronRight } from "@/assets/icons";
import ChartTen from "@/components/Charts/ChartTen";
import Image from "next/image";
import { useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { PolygonUp } from "../icons";

type PropsType = {
  data: {
    image: string;
    name: string;
    share: number;
    returnRate: number;
  }[];
};

export function StocksOverviewCarousel({ data }: PropsType) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="data-stats-slider-outer relative col-span-12 rounded-[10px] border border-stroke bg-white py-10 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <Swiper
        className="dataStatsSlider swiper !-mx-px"
        modules={[Navigation]}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        slidesPerView={1}
        breakpoints={{
          768: {
            slidesPerView: 2,
          },
          1280: {
            slidesPerView: 3,
          },
          1536: {
            slidesPerView: 4,
          },
        }}
      >
        {data.map((item, key) => (
          <SwiperSlide
            key={key}
            className="border-r border-stroke px-10 last:border-r-0 dark:border-dark-3"
          >
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-2.5">
                <Image
                  src={item.image}
                  alt={"Logo for" + item.name}
                  className="size-10 rounded-full object-cover"
                  width={42}
                  height={42}
                />

                <h3 className="text-xl font-bold text-black dark:text-white">
                  {item.name}
                </h3>
              </div>

              <ChartTen returnRate={item.returnRate} />
            </div>

            <dl className="mt-5.5 flex flex-col gap-1.5">
              <div className="flex flex-row-reverse items-center justify-between gap-1">
                <dt className="font-medium text-dark dark:text-white">
                  ${item.share}
                </dt>

                <dd className="text-sm font-medium">Total Share</dd>
              </div>

              <div className="flex flex-row-reverse items-center justify-between gap-1">
                <dt
                  className={`flex items-center gap-1 font-medium ${
                    item.returnRate >= 0 ? "text-green" : "text-red"
                  }`}
                >
                  {item.returnRate}%
                  {item.returnRate >= 0 ? (
                    <PolygonUp />
                  ) : (
                    <PolygonUp className="rotate-180" />
                  )}
                </dt>
                <dd className="text-sm font-medium">Total Return</dd>
              </div>
            </dl>
          </SwiperSlide>
        ))}
      </Swiper>

      <button className="swiper-button-prev">
        <span className="sr-only">Previous</span>
        <ChevronLeft />
      </button>

      <button className="swiper-button-next">
        <span className="sr-only">Next</span>
        <ChevronRight />
      </button>
    </div>
  );
}
