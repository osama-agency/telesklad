"use client";

import DropdownDefault from "@/components/DropdownDefault";
import { useMessages } from "@/hooks/useMessages";

interface MessageHeaderProps {
  selectedUserId: string;
}

const MessageHeader = ({ selectedUserId }: MessageHeaderProps) => {
  const { users } = useMessages();
  const currentUser = users.find(user => user.tg_id === selectedUserId);

  return (
    <>
      <div className="sticky flex items-center justify-between border-b border-stroke py-4.5 pl-7.5 pr-6 dark:border-dark-3">
        <div className="flex items-center">
          <div className="mr-4.5 h-13 w-full max-w-13 overflow-hidden rounded-full">
            <div className="h-full w-full bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] flex items-center justify-center rounded-full">
              <span className="text-white font-medium text-sm">
                {selectedUserId.slice(-2)}
              </span>
            </div>
          </div>
          <div>
            <h5 className="font-medium text-dark dark:text-white">
              Telegram ID: {selectedUserId}
            </h5>
            <p className="text-body-sm text-dark-5 dark:text-dark-6">
              {currentUser ? `${currentUser.messageCount} сообщений` : 'Диалог'}
            </p>
          </div>
        </div>
        <div>
          <DropdownDefault />
        </div>
      </div>
    </>
  );
};

export default MessageHeader;
