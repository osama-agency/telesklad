"use client";

import { SearchIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import { useMessages } from "@/hooks/useMessages";
import { useState } from "react";

interface MessageSidebarProps {
  selectedUserId: string | null;
  onUserSelect: (userId: string) => void;
}

export default function MessageSidebar({ selectedUserId, onUserSelect }: MessageSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { users, loading } = useMessages();

  const filteredUsers = users.filter(user => 
    user.tg_id?.includes(searchQuery) || searchQuery === ""
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}м назад`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}ч назад`;
    } else {
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <>
      <div className="sticky border-b border-stroke py-7.5 pl-6 pr-7.5 dark:border-dark-3">
        <h3 className="flex items-center justify-between text-lg font-medium text-dark dark:text-white 2xl:text-xl">
          Диалоги Telegram
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-body-sm font-medium text-white">
            {filteredUsers.length}
          </span>
        </h3>
      </div>
      
      <div className="no-scrollbar flex max-h-full flex-col overflow-y-auto px-6 py-7.5">
        <form className="sticky top-0 z-20 mb-4 bg-white pb-5 dark:bg-gray-dark" onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[7px] border border-stroke bg-gray-2 py-2.5 pl-4.5 pr-12 text-body-sm text-dark outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              placeholder="Поиск по ID..."
            />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </button>
          </div>
        </form>

        <div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-body-sm text-dark-5 dark:text-dark-6">
                {searchQuery ? "Пользователи не найдены" : "Нет диалогов"}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.tg_id}
                onClick={() => onUserSelect(user.tg_id!)}
                className={cn(
                  "flex cursor-pointer items-center rounded-lg py-3 hover:bg-gray-1 dark:hover:bg-dark-2 2xl:px-4",
                  selectedUserId === user.tg_id && "bg-gray-1 dark:bg-dark-2"
                )}
              >
                <div className="relative mr-4.5 size-14 rounded-full">
                  <div className="size-full rounded-full bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.tg_id?.slice(-2)}
                    </span>
                  </div>
                  <span className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-white dark:border-dark-2 bg-green" />
                </div>

                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <h5 className="font-medium text-dark dark:text-white">
                      ID: {user.tg_id}
                    </h5>
                    <div className="mt-px text-body-sm font-medium text-dark-5 dark:text-dark-6">
                      {user.messageCount} сообщений
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-body-sm text-dark-5 dark:text-dark-6">
                      {formatTime(user.lastMessageAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

