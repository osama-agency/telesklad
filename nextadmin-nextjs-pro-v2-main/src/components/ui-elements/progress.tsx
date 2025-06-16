"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

type ProgressProps = {
  progress: number;
  withMarker?: boolean;
  withLabel?: boolean;
  className?: {
    wrapper?: string;
    progress?: string;
    marker?: string;
    markerIndicator?: string;
  };
};

export function Progress({
  progress,
  withMarker,
  withLabel,
  className,
}: ProgressProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    if (progressRef.current) {
      setProgressWidth(progressRef.current.getBoundingClientRect().width);
    }
  }, []);

  return (
    <div
      className={cn(
        "relative h-2.5 w-[470px] rounded-full bg-stroke dark:bg-dark-3",
        className?.wrapper,
      )}
      style={{
        // Fix overflow clipping in Safari
        // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
        transform: "translateZ(0)",
      }}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={progress}
      aria-valuetext={`${progress}%`}
      role="progressbar"
    >
      <div className="size-full overflow-hidden rounded-full">
        <div
          ref={progressRef}
          className={cn(
            "size-full rounded-full bg-primary text-center",
            className?.progress,
          )}
          style={{ transform: `translateX(-${100 - progress}%)` }}
        />
      </div>

      {withLabel && (
        <div
          aria-hidden
          className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 text-center text-[10px] font-bold leading-none text-white"
          style={{
            right: `${100 - progress}%`,
          }}
        >
          {progress}%
        </div>
      )}

      {withMarker && (
        <Marker
          progress={progress}
          className={{
            marker: className?.marker,
            indicator: className?.markerIndicator,
          }}
        />
      )}
    </div>
  );
}

type MarkerProps = Pick<ProgressProps, "progress"> & {
  className?: {
    marker?: string;
    indicator?: string;
  };
};

function Marker({ progress, className }: MarkerProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute bottom-full z-1 mb-2 inline-block translate-x-[45%] rounded-sm bg-primary px-2 py-1 text-xs font-bold text-white",
        className?.marker,
      )}
      style={{ right: `${100 - progress}%` }}
    >
      <div
        className={cn(
          "absolute -bottom-1 left-1/2 -z-1 size-2 -translate-x-1/2 rotate-45 bg-primary",
          className?.indicator,
        )}
      />
      {progress}%
    </div>
  );
}
