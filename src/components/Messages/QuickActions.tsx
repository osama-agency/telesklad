"use client";

import { motion } from "framer-motion";

interface QuickActionsProps {
  userId: string;
  onCreateOrder?: () => void;
  onViewOrders?: () => void;
  onViewProfile?: () => void;
}

export default function QuickActions({ userId, onCreateOrder, onViewOrders, onViewProfile }: QuickActionsProps) {
  const actions = [
    {
      id: "create-order",
      label: "Создать заказ",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: "bg-green-500 hover:bg-green-600",
      onClick: onCreateOrder,
    },
    {
      id: "view-orders",
      label: "История заказов",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: onViewOrders,
    },
    {
      id: "view-profile",
      label: "Профиль клиента",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: "bg-purple-500 hover:bg-purple-600",
      onClick: onViewProfile,
    },
  ];

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-transparent">
      <h4 className="text-sm font-medium text-[#1E293B] dark:text-white mb-3">
        Быстрые действия
      </h4>
      <div className="grid grid-cols-3 gap-2">
        {actions.map((action) => (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.onClick}
            className={`${action.color} text-white p-3 rounded-lg flex flex-col items-center gap-2 transition-colors shadow-sm`}
          >
            {action.icon}
            <span className="text-xs font-medium text-center leading-tight">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
} 