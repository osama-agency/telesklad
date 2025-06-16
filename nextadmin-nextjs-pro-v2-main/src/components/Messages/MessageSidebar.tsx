import { SearchIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import Image from "next/image";

export const CHAT_LIST = [
  {
    active: true,
    imgSrc: "/images/user/user-12.png",
    name: "Devid Heilo",
    message: "Hello, how are you?",
    unreadCount: 3,
  },
  {
    active: true,
    seen: true,
    imgSrc: "/images/user/user-11.png",
    name: "Henry Fisher",
    message: "I am waiting for you",
    unreadCount: 0,
  },
  {
    active: null,
    seen: true,
    imgSrc: "/images/user/user-22.png",
    name: "Wilium Smith",
    message: "Where are you now?",
    unreadCount: 0,
  },
  {
    active: true,
    imgSrc: "/images/user/user-21.png",
    name: "Henry Deco",
    message: "Thank you so much!",
    unreadCount: 3,
  },
  {
    active: false,
    seen: true,
    imgSrc: "/images/user/user-24.png",
    name: "Jubin Jack",
    message: "Hello, how are you?",
    unreadCount: 0,
  },
];

export default function MessageSidebar() {
  return (
    <>
      <div className="sticky border-b border-stroke py-7.5 pl-6 pr-7.5 dark:border-dark-3">
        <h3 className="flex items-center justify-between text-lg font-medium text-dark dark:text-white 2xl:text-xl">
          Active Conversations
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-body-sm font-medium text-white">
            2
          </span>
        </h3>
      </div>
      <div className="custom-scrollbar flex max-h-full flex-col overflow-y-auto px-6 py-7.5">
        <form className="sticky top-0 z-20 mb-4 bg-white pb-5 dark:bg-gray-dark">
          <div className="relative">
            <input
              type="text"
              className="w-full rounded-[7px] border border-stroke bg-gray-2 py-2.5 pl-4.5 pr-12 text-body-sm text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              placeholder="Search..."
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </button>
          </div>
        </form>

        <div>
          {CHAT_LIST.map((chat, item) => {
            return (
              <div
                key={item}
                className="flex cursor-pointer items-center rounded-lg py-3 hover:bg-gray-1 dark:hover:bg-dark-2 2xl:px-4"
              >
                <div className="relative mr-4.5 size-14 rounded-full">
                  <Image
                    src={chat.imgSrc}
                    alt="profile"
                    className="size-full rounded-full object-cover object-center"
                    width={256}
                    height={256}
                    quality={100}
                  />

                  <span
                    className={cn(
                      "absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-white dark:border-dark-2",
                      chat.active ? "bg-green" : "bg-red-light",
                      chat.active === null && "bg-orange-light",
                    )}
                  />
                </div>

                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <h5 className="font-medium text-dark dark:text-white">
                      {chat.name}
                    </h5>

                    <div
                      className={cn(
                        "mt-px text-body-sm font-medium",
                        chat.seen
                          ? "text-dark-5 dark:text-dark-6"
                          : "text-dark-3 dark:text-white/80",
                      )}
                    >
                      {chat.message}
                    </div>
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="flex size-6 items-center justify-center rounded-full bg-primary px-2 py-0.5">
                      <span className="text-body-sm font-medium text-white">
                        {chat.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
