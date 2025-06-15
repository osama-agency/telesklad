"use client";

import { Calendar } from "@/components/Layouts/sidebar/icons";
import flatpickr from "flatpickr";
import { useEffect } from "react";

const DatePickerOne = () => {
  useEffect(() => {
    // Init flatpickr
    flatpickr(".form-datepicker", {
      mode: "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: "M j, Y",
    });
  }, []);

  return (
    <div>
      <label className="mb-3 block text-sm font-medium text-gray-900 dark:text-white">
        Date picker
      </label>
      <div className="relative">
        <input
          className="form-datepicker w-full rounded-lg border border-[#E2E8F0] dark:border-dark-3 bg-white dark:bg-dark-2 px-3 py-2 text-sm font-normal text-gray-900 dark:text-white placeholder:text-muted-foreground outline-none transition focus:ring-gradient active:border-blue-500 dark:active:border-primary"
          placeholder="mm/dd/yyyy"
          data-class="flatpickr-right"
        />

        <div className="pointer-events-none absolute inset-0 left-auto right-3 flex items-center">
          <Calendar className="size-5 text-muted-foreground dark:text-[#9CA3AF]" />
        </div>
      </div>
    </div>
  );
};

export default DatePickerOne;
