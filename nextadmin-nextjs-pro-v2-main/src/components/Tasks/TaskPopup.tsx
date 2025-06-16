import {
  CircleMinusIcon,
  CirclePlusIcon,
  UploadIcon,
  XIcon,
} from "@/assets/icons";
import { useClickOutside } from "@/hooks/use-click-outside";
import React, { useState } from "react";

interface TaskPopupProps {
  popupOpen: boolean;
  setPopupOpen: (open: boolean) => void;
}

const TaskPopup: React.FC<TaskPopupProps> = (props) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const ref = useClickOutside<HTMLDivElement>(() => props.setPopupOpen(false));

  return (
    <div
      className={`fixed left-0 top-0 z-99999 flex h-screen w-full justify-center bg-[#111928]/70 px-4 py-5`}
    >
      <div
        ref={ref}
        className="max-h-[98vh] w-full max-w-[730px] overflow-clip overflow-y-auto rounded-xl"
      >
        <div className="relative m-auto rounded-xl border border-stroke bg-gray-2 p-4 shadow-3 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-8 xl:p-10">
          <button
            onClick={() => props.setPopupOpen(false)}
            className="absolute right-1 top-1 sm:right-5 sm:top-5"
          >
            <XIcon width={22} height={22} />
          </button>

          <form action="#">
            <div className="mb-5">
              <label
                htmlFor="taskTitle"
                className="mb-2.5 block font-medium text-dark dark:text-white"
              >
                Task title
              </label>
              <input
                type="text"
                name="taskTitle"
                id="taskTitle"
                placeholder="Enter task title"
                className="w-full rounded-[7px] border border-stroke bg-white px-4.5 py-3 text-dark focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              />
            </div>

            <div className="mb-5">
              <label
                htmlFor="taskDescription"
                className="mb-2.5 block font-medium text-dark dark:text-white"
              >
                Task description
              </label>
              <textarea
                name="taskDescription"
                id="taskDescription"
                cols={30}
                rows={7}
                placeholder="Enter task description"
                className="w-full rounded-[7px] border border-stroke bg-white px-4.5 py-3 text-dark focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              ></textarea>
            </div>

            <div className="mb-5">
              <label
                htmlFor="taskList"
                className="mb-2.5 block font-medium text-black dark:text-white"
              >
                Task list
              </label>
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center gap-2.5">
                  <input
                    type="text"
                    name="taskList"
                    id="taskList"
                    placeholder="Enter list text"
                    className="w-full rounded-[7px] border border-stroke bg-white px-4.5 py-3 text-dark focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  />

                  <button className="flex h-12.5 w-full max-w-12.5 items-center justify-center rounded-[7px] border border-stroke bg-white hover:text-primary dark:border-dark-3 dark:bg-dark-2">
                    <CirclePlusIcon />
                  </button>
                </div>
                <div className="flex items-center gap-2.5">
                  <input
                    type="text"
                    name="taskList"
                    id="taskList"
                    placeholder="Enter list text"
                    className="w-full rounded-[7px] border border-stroke bg-white px-4.5 py-3 text-dark focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  />

                  <button className="ml-1.5 flex h-12.5 w-full max-w-12.5 items-center justify-center rounded-[7px] border border-stroke bg-white hover:text-primary dark:border-dark-3 dark:bg-dark-2">
                    <CircleMinusIcon />
                  </button>
                  <button className="flex h-12.5 w-full max-w-12.5 items-center justify-center rounded-[7px] border border-stroke bg-white hover:text-primary dark:border-dark-3 dark:bg-dark-2">
                    <CirclePlusIcon />
                  </button>
                </div>
                <div className="flex items-center gap-2.5">
                  <input
                    type="text"
                    name="taskList"
                    id="taskList"
                    placeholder="Enter list text"
                    className="w-full rounded-[7px] border border-stroke bg-white px-4.5 py-3 text-dark focus:border-primary focus-visible:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  />

                  <button className="ml-1.5 flex h-12.5 w-full max-w-12.5 items-center justify-center rounded-[7px] border border-stroke bg-white hover:text-primary dark:border-dark-3 dark:bg-dark-2">
                    <CircleMinusIcon />
                  </button>
                  <button className="flex h-12.5 w-full max-w-12.5 items-center justify-center rounded-[7px] border border-stroke bg-white hover:text-primary dark:border-dark-3 dark:bg-dark-2">
                    <CirclePlusIcon />
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label
                htmlFor="taskImg"
                className="mb-2.5 block font-medium text-dark dark:text-white"
              >
                Add image
              </label>
              <div>
                <div
                  id="FileUpload"
                  className="relative block w-full appearance-none rounded-[7px] border border-dashed border-stroke bg-white px-4 py-4 dark:border-dark-3 dark:bg-dark-2 sm:py-14"
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 z-50 m-0 h-full w-full p-0 opacity-0 outline-none"
                    onChange={(event) => setFiles(event.target.files)}
                  />
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <span className="flex h-13.5 w-13.5 items-center justify-center rounded-full border border-stroke bg-primary/5 dark:border-dark-3">
                      <UploadIcon />
                    </span>
                    <p className="text-body-sm">
                      <span className="text-primary">Click to upload</span> or
                      drag and drop
                    </p>
                  </div>
                </div>

                {files !== null && (
                  <div className="mt-4.5 rounded-[7px] border border-stroke bg-white px-4 py-3 dark:border-dark-3 dark:bg-dark-2">
                    <div className="flex items-center justify-between">
                      <span>{files[0].name}</span>

                      <button onClick={() => setFiles(null)}>
                        <XIcon />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-[7px] bg-primary px-4.5 py-3.5 font-medium text-white hover:bg-opacity-90">
              <CirclePlusIcon />
              Add task
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskPopup;
