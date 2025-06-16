"use client";

import dynamic from "next/dynamic";

const InitializeMap = dynamic(() => import("./initialize-map"), {
  ssr: false,
});

export function TopCountriesMap() {
  return (
    <>
      <InitializeMap />

      <div className="flex h-65 items-center justify-center md:h-95">
        <div id="mapTwo" className="mapTwo map-btn" />
      </div>
    </>
  );
}
