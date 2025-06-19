"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessages, Message, User } from '@/hooks/useMessages';

interface ChatInterfaceProps {
  selectedUserId?: string | null;
  onUserSelect?: (userId: string) => void;
}

export default function ChatInterface({ selectedUserId, onUserSelect }: ChatInterfaceProps) {
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    users, 
    loading, 
    error, 
    sendMessage, 
    refreshMessages 
  } = useMessages(selectedUserId || undefined);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUserId) return;

    setIsSending(true);
    try {
      await sendMessage(messageText.trim(), selectedUserId);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

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
      return date.toLocaleDateString('ru-RU');
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-gray-900">
      {/* Sidebar - список пользователей */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-[#1E293B] dark:text-white">
            Сообщения Telegram
          </h2>
          <p className="text-sm text-[#64748B] dark:text-gray-400 mt-1">
            {users.length} диалог{users.length === 1 ? '' : users.length < 5 ? 'а' : 'ов'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {loading && !selectedUserId ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1A6DFF] mx-auto"></div>
              <p className="text-sm text-[#64748B] dark:text-gray-400 mt-2">Загрузка...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.934-.546l-3.566 1.188a.75.75 0 01-.944-.944l1.188-3.566A8.013 8.013 0 013 12a8 8 0 1118 0z" />
                </svg>
              </div>
              <p className="text-sm text-[#64748B] dark:text-gray-400">Нет диалогов</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {users.map((user) => (
                <motion.button
                  key={user.tg_id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onUserSelect?.(user.tg_id!)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedUserId === user.tg_id
                      ? 'bg-gradient-to-r from-[#1A6DFF]/10 to-[#00C5FF]/10 border border-[#1A6DFF]/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.tg_id?.slice(-2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#1E293B] dark:text-white truncate">
                        ID: {user.tg_id}
                      </p>
                      <p className="text-xs text-[#64748B] dark:text-gray-400">
                        {user.messageCount} сообщений
                      </p>
                      <p className="text-xs text-[#64748B] dark:text-gray-400">
                        {formatDate(user.lastMessageAt)}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedUserId ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {selectedUserId.slice(-2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1E293B] dark:text-white">
                      Telegram ID: {selectedUserId}
                    </h3>
                    <p className="text-sm text-[#64748B] dark:text-gray-400">
                      {messages.length} сообщений в диалоге
                    </p>
                  </div>
                </div>
                <button
                  onClick={refreshMessages}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-[#64748B] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1A6DFF] mx-auto"></div>
                  <p className="text-sm text-[#64748B] dark:text-gray-400 mt-2">Загрузка сообщений...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#64748B] dark:text-gray-400">Нет сообщений в этом диалоге</p>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.is_incoming ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-sm lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.is_incoming
                            ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                            : 'bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white'
                        }`}
                      >
                        <p className={`text-sm ${
                          message.is_incoming ? 'text-[#1E293B] dark:text-white' : 'text-white'
                        }`}>
                          {message.text}
                        </p>
                        <p className={`text-xs mt-1 ${
                          message.is_incoming ? 'text-[#64748B] dark:text-gray-400' : 'text-white/70'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Введите сообщение..."
                  disabled={isSending}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white placeholder-[#64748B] dark:placeholder-gray-400 focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || isSending}
                  className="px-4 py-2 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSending ? (
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.934-.546l-3.566 1.188a.75.75 0 01-.944-.944l1.188-3.566A8.013 8.013 0 013 12a8 8 0 1118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#1E293B] dark:text-white mb-2">
                Выберите диалог
              </h3>
              <p className="text-[#64748B] dark:text-gray-400">
                Выберите пользователя из списка слева, чтобы начать переписку
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Ошибка: {error}
        </div>
      )}
    </div>
  );
} 