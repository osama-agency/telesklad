import Image from "next/image";
import React from "react";
import DropdownDefault from "./DropdownDefault";

const feedbackData = [
  {
    avatar: "/images/user/user-14.png",
    name: "Timothy Smith",
    name2: "Killan James",
    feedback: `It's an Affiliate commissions SaaS application that allows you
    to track your affiliate revenue.`,
    time: 1,
  },
  {
    avatar: "/images/user/user-15.png",
    name: "Nancy Martino",
    name2: "Matney",
    feedback: `There are many variations of passages of Lorem Ipsum available, but the majority have suffered.`,
    time: 2,
  },
  {
    avatar: "/images/user/user-11.png",
    name: "Michael Morris",
    name2: "Williams Son",
    feedback: `It's an Affiliate commissions SaaS application that allows you
    to track your affiliate revenue.`,
    time: 3,
  },
];

const Feedback: React.FC = () => {
  return (
    <div className="col-span-12 rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-6">
      <div className="flex items-center justify-between border-b border-stroke px-6 pb-5.5 pt-6 dark:border-dark-3">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Feedback
        </h2>

        <DropdownDefault />
      </div>

      <div className="p-6">
        <ul className="flex flex-col gap-7">
          {feedbackData.map((item, key) => (
            <li className="relative z-1 flex gap-5.5" key={key}>
              <Image
                src={item.avatar}
                className="size-16 rounded-full object-cover ring ring-stroke dark:ring-dark-3"
                width={64}
                height={64}
                quality={90}
                alt={"Avatar for " + item.name}
              />

              <div>
                <p className="text-dark dark:text-white">
                  <span className="font-medium">{item.name}</span>
                  <span className="px-1">Commented on Cloud</span>

                  <span className="font-medium">{item.name2}</span>
                </p>
                <span className="mt-1 block text-body-sm">
                  {" "}
                  {item.time} hour ago
                </span>
                <p className="mt-2.5 text-dark dark:text-white">
                  {item.feedback}
                </p>
              </div>

              {key === 0 && (
                <span className="absolute left-8 -z-1 block h-[300%] w-[1px] border-l border-dashed border-stroke dark:border-dark-3"></span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Feedback;
