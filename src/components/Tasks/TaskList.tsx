"use client";

import { CheckIcon } from "@/assets/icons";
import DropdownDefault from "@/components/DropdownDefault";
import { useEffect } from "react";

interface TaskLanes {
  title: string;
  tasks: {
    title: string;
    taskItems: {
      name: string;
      completed: boolean;
    }[];
  }[];
}

const lanes: TaskLanes[] = [
  {
    title: "To Do's",
    tasks: [
      {
        title: "Task title",
        taskItems: [
          {
            name: "Here is task one",
            completed: false,
          },
          {
            name: "Here is task Two",
            completed: true,
          },
          {
            name: "Here is task Three",
            completed: false,
          },
        ],
      },
      {
        title: "Task title",
        taskItems: [
          {
            name: "Here is task one",
            completed: false,
          },
          {
            name: "Here is task Two",
            completed: true,
          },
        ],
      },
      {
        title: "Task title",
        taskItems: [
          {
            name: "Here is task one",
            completed: false,
          },
        ],
      },
    ],
  },
  {
    title: "In Progress",
    tasks: [
      {
        title: "Task title",
        taskItems: [
          {
            name: "Here is task one",
            completed: false,
          },
        ],
      },
    ],
  },
  {
    title: "Completed",
    tasks: [
      {
        title: "Task title",
        taskItems: [
          {
            name: "Here is task one",
            completed: true,
          },
          {
            name: "Here is task Two",
            completed: true,
          },
        ],
      },
    ],
  },
];

const TaskList = () => {
  useEffect(() => {
    const draggables = document.querySelectorAll(".task");
    const droppables = document.querySelectorAll(".swim-lane");

    draggables.forEach((task) => {
      task.addEventListener("dragstart", () => {
        task.classList.add("is-dragging");
      });
      task.addEventListener("dragend", () => {
        task.classList.remove("is-dragging");
      });
    });

    droppables.forEach((zone) => {
      zone.addEventListener("dragover", (e: Event) => {
        e.preventDefault();

        const bottomTask = insertAboveTask(
          zone as HTMLElement,
          (e as DragEvent).clientY,
        );
        const curTask = document.querySelector(".is-dragging");

        if (!bottomTask) {
          if (curTask) {
            zone.appendChild(curTask);
          }
        } else {
          if (curTask) {
            zone.insertBefore(curTask, bottomTask);
          }
        }
      });
    });

    const insertAboveTask = (
      zone: HTMLElement,
      mouseY: number,
    ): HTMLElement | null => {
      const els = Array.from(zone.querySelectorAll(".task:not(.is-dragging)"));

      let closestTask: HTMLElement | null = null;
      let closestOffset = Number.NEGATIVE_INFINITY;

      els.forEach((task) => {
        const { top } = task.getBoundingClientRect();

        const offset = mouseY - top;

        if (offset < 0 && offset > closestOffset) {
          closestOffset = offset;
          closestTask = task as HTMLElement;
        }
      });

      return closestTask;
    };
  }, []);
  return (
    <>
      <div className="mt-9 flex flex-col gap-9">
        {lanes.map((lane, laneIndex) => (
          <div key={laneIndex} className="swim-lane flex flex-col gap-5.5">
            <h4 className="text-xl font-bold text-dark dark:text-white">
              {lane.title} ({lane.tasks.length})
            </h4>

            {lane.tasks.map((task, taskIndex) => (
              <div
                key={taskIndex}
                draggable="true"
                className="task relative flex cursor-move justify-between rounded-[10px] bg-white p-7 shadow-1 dark:bg-gray-dark dark:shadow-card"
              >
                <div>
                  <h5 className="mb-4 text-lg font-medium text-black dark:text-white">
                    {task.title}
                  </h5>

                  <div className="flex flex-col gap-2">
                    {task.taskItems.map((item, index) => (
                      <label
                        key={index}
                        htmlFor={`taskCheckbox-${laneIndex}-${taskIndex}-${index}`}
                        className="cursor-pointer"
                      >
                        <div className="relative flex items-center pt-0.5">
                          <input
                            type="checkbox"
                            id={`taskCheckbox-${laneIndex}-${taskIndex}-${index}`}
                            className="taskCheckbox sr-only"
                            defaultChecked={item.completed}
                          />
                          <div className="box mr-3 flex h-5 w-5 items-center justify-center rounded border border-stroke dark:border-dark-3 dark:bg-dark-2">
                            <span className="text-white opacity-0">
                              <CheckIcon />
                            </span>
                          </div>
                          <p>{item.name}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="absolute right-4 top-4">
                  <DropdownDefault />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default TaskList;
