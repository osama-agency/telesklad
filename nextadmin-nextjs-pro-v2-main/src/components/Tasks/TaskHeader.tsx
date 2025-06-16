"use client";

import Image from "next/image";
import { useState } from "react";
import TaskPopup from "./TaskPopup";
import { RoundedPlusIcon } from "./icons";

const USERS_IMG = [
  "/images/user/user-05.png",
  "/images/user/user-07.png",
  "/images/user/user-09.png",
  "/images/user/user-10.png",
];

const TaskHeader = () => {
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <div className="flex flex-col gap-y-4 rounded-[10px] bg-white p-2.5 shadow-1 dark:bg-gray-dark dark:shadow-card sm:flex-row sm:items-center sm:justify-between">
      <h2 className="pl-2.5 text-heading-5 font-bold leading-[34px] text-dark dark:text-white">
        Tasks
      </h2>

      <div className="flex flex-col gap-4 2xsm:flex-row 2xsm:items-center">
        <div className="flex -space-x-2">
          {USERS_IMG.map((img) => (
            <Image
              key={img}
              src={img}
              className="size-9 rounded-full ring-2 ring-white dark:ring-dark-2"
              width={150}
              height={150}
              quality={100}
              alt="User"
            />
          ))}

          <button className="flex size-9 items-center justify-center rounded-full border border-stroke bg-white text-primary dark:border-dark-3 dark:bg-dark-2">
            <span className="sr-only">Add new user</span>
            <RoundedPlusIcon />
          </button>
        </div>

        <div>
          <button
            onClick={() => setPopupOpen(!popupOpen)}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 font-medium text-white hover:bg-opacity-90"
          >
            <RoundedPlusIcon />
            <span>Add task</span>
          </button>

          {/* <!-- ===== Task Popup Star ===== --> */}
          {popupOpen && (
            <TaskPopup popupOpen={popupOpen} setPopupOpen={setPopupOpen} />
          )}
          {/* <!-- ===== Task Popup End ===== --> */}
        </div>
      </div>
    </div>
  );
};

export default TaskHeader;
