"use client";

import { EmojiIcon, PaperClipIcon, SendMessageIcon } from "@/assets/icons";
import { useMessagesContext } from "@/context/MessagesContext";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface MessageInputBoxImprovedProps {
  selectedUserId: string;
}

const MessageInputBoxImproved = ({ selectedUserId }: MessageInputBoxImprovedProps) => {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, setUserTyping } = useMessagesContext();

  // Автоматическое изменение высоты textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Максимум 120px
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [messageText]);

  // Индикатор печатания
  useEffect(() => {
    if (messageText.trim() && !isTyping) {
      setIsTyping(true);
      setUserTyping(selectedUserId, true);
    } else if (!messageText.trim() && isTyping) {
      setIsTyping(false);
      setUserTyping(selectedUserId, false);
    }

    // Очищаем индикатор печатания через 3 секунды бездействия
    const timeoutId = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        setUserTyping(selectedUserId, false);
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [messageText, isTyping, selectedUserId, setUserTyping]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageText.trim() || isSending) return;

    const textToSend = messageText.trim();
    setMessageText("");
    setIsSending(true);
    setIsTyping(false);
    setUserTyping(selectedUserId, false);

    try {
      await sendMessage(textToSend, selectedUserId);
    } catch (error) {
      console.error('Error sending message:', error);
      // Возвращаем текст обратно при ошибке
      setMessageText(textToSend);
    } finally {
      setIsSending(false);
      // Фокусируемся обратно на поле ввода
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Отправка по Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    // Обычный Enter добавляет новую строку (поведение по умолчанию)
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // TODO: Обработка вставки изображений и файлов
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    
    if (imageItem) {
      e.preventDefault();
      console.log('Image pasted - feature not implemented yet');
      // Здесь можно добавить обработку изображений
    }
  };

  const canSend = messageText.trim().length > 0 && !isSending;

  return (
    <div className="sticky bottom-0 border-t border-gray-200 dark:border-gray-700 bg-transparent px-6 py-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-4">
        {/* Input Area */}
        <div className="flex-1 relative">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              disabled={isSending}
              placeholder="Введите сообщение... (Ctrl+Enter для отправки)"
              className="w-full min-h-[44px] max-h-[120px] resize-none rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-3 pl-4 pr-20 text-[#1E293B] dark:text-white outline-none transition-all focus:border-[#1A6DFF] focus:ring-2 focus:ring-[#1A6DFF]/20 disabled:opacity-50 no-scrollbar"
              rows={1}
            />
            
            {/* Action Buttons in Input */}
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <motion.button 
                type="button" 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 text-[#64748B] dark:text-gray-400 hover:text-[#1A6DFF] transition-colors disabled:opacity-50" 
                disabled={isSending}
                title="Прикрепить файл"
              >
                <PaperClipIcon className="w-5 h-5" />
              </motion.button>
              
              <motion.button 
                type="button" 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 text-[#64748B] dark:text-gray-400 hover:text-[#1A6DFF] transition-colors disabled:opacity-50" 
                disabled={isSending}
                title="Добавить эмодзи"
              >
                <EmojiIcon className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Character Counter */}
          {messageText.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 flex items-center justify-between text-xs text-[#64748B] dark:text-gray-400"
            >
              <span>
                {messageText.length}/4000 символов
              </span>
              <span className="text-[#1A6DFF]">
                Ctrl+Enter для отправки
              </span>
            </motion.div>
          )}
        </div>

        {/* Send Button */}
        <motion.button 
          type="submit"
          disabled={!canSend}
          whileHover={canSend ? { scale: 1.05 } : {}}
          whileTap={canSend ? { scale: 0.95 } : {}}
          className={`
            flex h-11 w-11 items-center justify-center rounded-xl transition-all
            ${canSend 
              ? 'bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white hover:shadow-lg' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }
          `}
          title={canSend ? "Отправить сообщение" : "Введите сообщение"}
        >
          {isSending ? (
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <SendMessageIcon className="w-5 h-5" />
          )}
        </motion.button>
      </form>

      {/* Quick Actions */}
      {messageText.length === 0 && !isSending && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex flex-wrap gap-2"
        >
          {[
            "Привет! 👋",
            "Спасибо за обращение",
            "Как дела?",
            "Всё понятно ✅"
          ].map((quickMessage) => (
            <motion.button
              key={quickMessage}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMessageText(quickMessage)}
              className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-[#1E293B] dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {quickMessage}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default MessageInputBoxImproved; 