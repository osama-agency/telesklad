"use client";
import MessageHeader from "@/components/Messages/MessageHeader";
import MessageInputBox from "@/components/Messages/MessageInputBox";
import MessageOutputBox from "@/components/Messages/MessageOutputBox";
import MessageSidebar from "@/components/Messages/MessageSidebar";

export function Messages() {
  return (
    <>
      <div className="h-[calc(100vh-186px)] overflow-hidden sm:h-[calc(100vh-174px)]">
        <div className="h-full rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card xl:flex">
          <div className="hidden h-full flex-col xl:flex xl:w-full xl:max-w-[347px]">
            <MessageSidebar />
          </div>
          <div className="flex h-full flex-col border-l border-stroke dark:border-dark-3 xl:w-3/4">
            <MessageHeader />
            <MessageOutputBox />
            <MessageInputBox />
          </div>
        </div>
      </div>
    </>
  );
};

export default Messages;
