"use client";

import { useMessages } from "@/hooks/useMessages";
import { useEffect, useRef } from "react";

interface MessageOutputBoxProps {
  selectedUserId: string;
}

const MessageOutputBox = ({ selectedUserId }: MessageOutputBoxProps) => {
  const { messages, loading } = useMessages(selectedUserId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="no-scrollbar max-h-full space-y-4 overflow-auto px-7.5 py-7">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-body-sm text-dark-5 dark:text-dark-6">
              Нет сообщений в этом диалоге
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id}>
              {message.is_incoming ? (
                // Входящее сообщение (от пользователя)
                <div className="w-full max-w-[340px]">
                  <p className="mb-2 text-body-sm font-medium text-dark-5 dark:text-dark-6">
                    Telegram ID: {message.tg_id}
                  </p>
                  <div className="rounded-2xl rounded-tl-none bg-[#E8F7FF] px-5 py-3 dark:bg-opacity-10">
                    <p className="font-medium text-dark dark:text-white">
                      {message.text}
                    </p>
                  </div>
                  <p className="mt-2.5 text-body-sm text-dark-5 dark:text-dark-6">
                    {formatTime(message.created_at)}
                  </p>
                </div>
              ) : (
                // Исходящее сообщение (от админа)
                <div className="ml-auto max-w-[328px]">
                  <div className="rounded-2xl rounded-br-none bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] px-5 py-3">
                    <p className="font-medium text-white">
                      {message.text}
                    </p>
                  </div>
                  <p className="mt-2 text-right text-body-sm text-dark-5 dark:text-dark-6">
                    {formatTime(message.created_at)}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </>
  );
};

export default MessageOutputBox;
