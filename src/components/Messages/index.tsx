"use client";
import MessageHeader from "@/components/Messages/MessageHeader";
import MessageInputBox from "@/components/Messages/MessageInputBox";
import MessageOutputBox from "@/components/Messages/MessageOutputBox";
import MessageSidebar from "@/components/Messages/MessageSidebar";
import { useState } from "react";

export function Messages() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <>
      <div className="h-[calc(100vh-186px)] overflow-hidden sm:h-[calc(100vh-174px)]">
        <div className="h-full rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card xl:flex">
          <div className="hidden h-full flex-col xl:flex xl:w-full xl:max-w-[347px]">
            <MessageSidebar 
              selectedUserId={selectedUserId}
              onUserSelect={setSelectedUserId}
            />
          </div>
          <div className="flex h-full flex-col border-l border-stroke dark:border-dark-3 xl:w-3/4">
            {selectedUserId ? (
              <>
                <MessageHeader selectedUserId={selectedUserId} />
                <MessageOutputBox selectedUserId={selectedUserId} />
                <MessageInputBox selectedUserId={selectedUserId} />
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.934-.546l-3.566 1.188a.75.75 0 01-.944-.944l1.188-3.566A8.013 8.013 0 013 12a8 8 0 1118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-dark dark:text-white mb-2">
                    Выберите диалог
                  </h3>
                  <p className="text-body-sm text-dark-5 dark:text-dark-6">
                    Выберите пользователя из списка слева, чтобы начать переписку
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Messages;
