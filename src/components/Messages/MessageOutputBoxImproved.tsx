"use client";

import { useMessagesContext } from "@/context/MessagesContext";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MessageOutputBoxImprovedProps {
  selectedUserId: string;
}

const MessageOutputBoxImproved = ({ selectedUserId }: MessageOutputBoxImprovedProps) => {
  const { messages, loading } = useMessagesContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userMessages = messages[selectedUserId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [userMessages]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getMessageStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return (
          <div className="w-3 h-3 animate-spin rounded-full border border-white border-t-transparent" />
        );
      case 'sent':
        return (
          <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13l4 4L23 7" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Группируем сообщения по датам
  const groupedMessages = userMessages.reduce((groups: any, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1A6DFF] border-t-transparent"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Загрузка сообщений...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto px-6 py-4 space-y-6 no-scrollbar">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-sm mx-auto">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.934-.546l-3.566 1.188a.75.75 0 01-.944-.944l1.188-3.566A8.013 8.013 0 013 12a8 8 0 1118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-[#1E293B] dark:text-white mb-2">
                Начните диалог
              </h4>
              <p className="text-sm text-[#64748B] dark:text-gray-400">
                Отправьте первое сообщение, чтобы начать переписку с этим пользователем
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {Object.entries(groupedMessages).map(([date, dayMessages]: [string, any]) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Date Separator */}
                <div className="flex items-center justify-center">
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-[#64748B] dark:text-gray-400">
                      {formatDate(date)}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  {dayMessages.map((message: any, index: number) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${message.is_incoming ? 'justify-start' : 'justify-end'}`}
                    >
                      {message.is_incoming ? (
                        // Входящее сообщение
                        <div className="max-w-[75%] md:max-w-[60%]">
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-md px-4 py-3">
                            <p className="text-[#1E293B] dark:text-white leading-relaxed">
                              {message.text}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-1 px-2">
                            <span className="text-xs text-[#64748B] dark:text-gray-400">
                              {formatTime(message.created_at)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        // Исходящее сообщение
                        <div className="max-w-[75%] md:max-w-[60%]">
                          <div className={`
                            rounded-2xl rounded-br-md px-4 py-3 
                            ${message.status === 'failed' 
                              ? 'bg-red-500' 
                              : 'bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF]'
                            }
                          `}>
                            <p className="text-white leading-relaxed">
                              {message.text}
                            </p>
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-1 px-2">
                            <span className="text-xs text-[#64748B] dark:text-gray-400">
                              {formatTime(message.created_at)}
                            </span>
                            {!message.is_incoming && getMessageStatusIcon(message.status)}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageOutputBoxImproved; 