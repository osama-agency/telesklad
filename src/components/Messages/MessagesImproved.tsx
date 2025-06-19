"use client";

import { useState, useEffect } from "react";
import { useMessagesContext } from "@/context/MessagesContext";
import MessageHeader from "@/components/Messages/MessageHeaderImproved";
import MessageInputBox from "@/components/Messages/MessageInputBoxImproved";
import MessageOutputBox from "@/components/Messages/MessageOutputBoxImproved";
import MessageSidebar from "@/components/Messages/MessageSidebarImproved";
import CustomerInfoPanel from "@/components/Messages/CustomerInfoPanel";
import QuickActions from "@/components/Messages/QuickActions";
import { motion, AnimatePresence } from "framer-motion";

export function MessagesImproved() {
  const { selectedUserId, selectUser } = useMessagesContext();
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280); // xl breakpoint
      if (window.innerWidth < 1280) {
        setShowSidebar(!selectedUserId); // На мобильных показываем сайдбар только если не выбран пользователь
      } else {
        setShowSidebar(true); // На десктопе всегда показываем
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [selectedUserId]);

  const handleBackToUsers = () => {
    selectUser(null);
    if (isMobile) {
      setShowSidebar(true);
    }
  };

  const handleUserSelect = (userId: string) => {
    selectUser(userId);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  return (
    <div className="h-[calc(100vh-186px)] overflow-hidden sm:h-[calc(100vh-174px)]">
      <div className="h-full bg-container rounded-xl border border-gray-200 dark:border-gray-700 flex">
        
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {(showSidebar || !isMobile) && (
            <motion.div
              initial={{ width: isMobile ? "100%" : 347 }}
              animate={{ width: isMobile ? "100%" : 347 }}
              exit={{ width: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`
                flex flex-col overflow-hidden bg-transparent
                ${isMobile ? 'w-full' : 'w-[347px] border-r border-gray-200 dark:border-gray-700'}
              `}
            >
              <MessageSidebar 
                selectedUserId={selectedUserId}
                onUserSelect={handleUserSelect}
                isMobile={isMobile}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <AnimatePresence mode="wait">
          {(!isMobile || selectedUserId) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex h-full flex-1 flex-col"
            >
              {selectedUserId ? (
                <>
                  <MessageHeader 
                    selectedUserId={selectedUserId} 
                    onBack={isMobile ? handleBackToUsers : undefined}
                    isMobile={isMobile}
                    onShowCustomerInfo={() => setShowCustomerInfo(true)}
                  />
                  <MessageOutputBox selectedUserId={selectedUserId} />
                  <MessageInputBox selectedUserId={selectedUserId} />
                  <QuickActions 
                    userId={selectedUserId}
                    onCreateOrder={() => console.log('Создать заказ для', selectedUserId)}
                    onViewOrders={() => setShowCustomerInfo(true)}
                    onViewProfile={() => setShowCustomerInfo(true)}
                  />
                </>
              ) : (
                !isMobile && (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center max-w-md mx-auto px-6">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-24 h-24 rounded-full bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] flex items-center justify-center mx-auto mb-6"
                      >
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.934-.546l-3.566 1.188a.75.75 0 01-.944-.944l1.188-3.566A8.013 8.013 0 013 12a8 8 0 1118 0z" />
                        </svg>
                      </motion.div>
                      <h3 className="text-xl font-semibold text-[#1E293B] dark:text-white mb-3">
                        Выберите диалог
                      </h3>
                      <p className="text-[#64748B] dark:text-gray-400 leading-relaxed">
                        Выберите пользователя из списка слева, чтобы начать переписку через Telegram бота
                      </p>
                    </div>
                  </div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Customer Info Panel */}
        <CustomerInfoPanel
          userId={selectedUserId}
          isVisible={showCustomerInfo}
          onClose={() => setShowCustomerInfo(false)}
        />
      </div>
    </div>
  );
}

export default MessagesImproved; 