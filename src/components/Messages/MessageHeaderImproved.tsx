"use client";

import { useMessagesContext } from "@/context/MessagesContext";
import { ChevronLeft } from "@/assets/icons";
import { motion } from "framer-motion";
import SearchBar from "./SearchBar";

interface MessageHeaderImprovedProps {
  selectedUserId: string;
  onBack?: () => void;
  isMobile?: boolean;
  onShowCustomerInfo?: () => void;
}

const MessageHeaderImproved = ({ selectedUserId, onBack, isMobile = false, onShowCustomerInfo }: MessageHeaderImprovedProps) => {
  const { users } = useMessagesContext();
  const currentUser = users.find(user => user.tg_id === selectedUserId);

  const getStatusText = () => {
    if (currentUser?.isTyping) return "печатает...";
    if (currentUser?.isOnline) return "в сети";
    return `${currentUser?.messageCount || 0} сообщений`;
  };

  const getStatusColor = () => {
    if (currentUser?.isTyping) return "text-[#1A6DFF]";
    if (currentUser?.isOnline) return "text-green-500";
    return "text-[#64748B] dark:text-gray-400";
  };

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-transparent py-4 px-6">
      <div className="flex items-center gap-4">
        {/* Back Button (Mobile) */}
        {isMobile && onBack && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#1E293B] dark:text-white" />
          </motion.button>
        )}

        {/* User Avatar */}
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {selectedUserId.slice(-2)}
            </span>
          </div>
          
          {/* Status Indicator */}
          {currentUser?.isOnline && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-dark bg-green-500" />
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h5 className="font-semibold text-[#1E293B] dark:text-white truncate">
            {isMobile ? `ID ${selectedUserId.slice(-8)}` : `Telegram ID: ${selectedUserId}`}
          </h5>
          <motion.p 
            key={getStatusText()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-sm ${getStatusColor()} transition-colors`}
          >
            {getStatusText()}
          </motion.p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Customer Info */}
        {onShowCustomerInfo && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onShowCustomerInfo}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Информация о клиенте"
          >
            <svg className="w-5 h-5 text-[#64748B] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </motion.button>
        )}

        {/* Search in Chat */}
        <SearchBar 
          onSearch={(query) => console.log('Поиск:', query)}
          placeholder="Поиск в диалоге..."
        />

        {/* More Options */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Дополнительные опции"
        >
          <svg className="w-5 h-5 text-[#64748B] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
};

export default MessageHeaderImproved; 