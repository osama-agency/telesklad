"use client";

import flatpickr from "flatpickr";
import { useEffect, useState } from "react";
import { CalendarIcon } from "./icons";

export function DatePicker() {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const fp = flatpickr(".datepicker", {
      mode: "range",
      static: true,
      monthSelectorType: "static",
      dateFormat: "M j, Y",
      defaultDate: [new Date().setDate(new Date().getDate() - 6), new Date()],
      onReady: (_, dateStr, instance) => {
        (instance.element as HTMLInputElement).value = dateStr.replace(
          "to",
          "-",
        );

        setInputValue(dateStr);
        const customClass = instance.element.getAttribute("data-class");

        instance.calendarContainer.classList.add(customClass + "");
      },
      onChange: (_, dateStr, instance) => {
        setInputValue(dateStr);
        (instance.element as HTMLInputElement).value = dateStr.replace(
          "to",
          "-",
        );
      },
    });

    return () => {
      if (!Array.isArray(fp)) {
        fp.destroy();
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3.5 top-1/2 z-1 -translate-y-1/2">
        <CalendarIcon />
      </div>

      <input
        className="datepicker w-[120%] rounded-md bg-white py-[9px] pl-11 pr-4 text-sm font-medium shadow-1 focus-visible:outline-none dark:bg-gray-dark dark:shadow-card"
        placeholder="Select dates"
        data-class="flatpickr-right"
      />
    </div>
  );
}
