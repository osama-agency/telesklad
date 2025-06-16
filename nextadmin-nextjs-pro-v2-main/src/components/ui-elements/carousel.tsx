"use client";

import { ChevronLeft, ChevronRight } from "@/assets/icons";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Skeleton } from "../ui/skeleton";

type PropsType = {
  withControls?: boolean;
  withIndicators?: boolean;
  images: string[];
};

export function Carousel({ withControls, withIndicators, images }: PropsType) {
  const [isMounted, setIsMounted] = useState(false);
  // Unique id to use as key while using .map
  const id = useId();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <Skeleton className="aspect-[8/3] w-full" />;

  const swiperModules = [];

  if (withControls) {
    swiperModules.push(Navigation);
  }

  if (withIndicators) {
    swiperModules.push(Pagination);
    swiperModules.push(Autoplay);
  }

  return (
    <Swiper
      modules={swiperModules}
      pagination={{ clickable: true }}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      navigation={{
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      }}
    >
      {images.map((image, i) => (
        <SwiperSlide
          key={image + i + id}
          className="relative aspect-[8/3] overflow-hidden rounded-lg"
        >
          <Image
            src={image}
            className="object-cover"
            fill
            role="presentation"
            alt=""
          />
        </SwiperSlide>
      ))}

      {withControls && (
        <>
          <ControlButton className="swiper-button-prev sm:!left-10">
            <ChevronLeft className="!size-6" />
          </ControlButton>

          <ControlButton className="swiper-button-next sm:!right-10">
            <ChevronRight className="!size-6" />
          </ControlButton>
        </>
      )}
    </Swiper>
  );
}
function ControlButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      className={cn(
        "flex !size-10 items-center justify-center rounded-full bg-white !text-dark-5 shadow-card-2 after:hidden dark:bg-dark-2 dark:!text-dark-6 sm:!size-12.5",
        className,
      )}
    >
      {children}
    </button>
  );
}
