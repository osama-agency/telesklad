"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function MobileMenuButton({ isOpen, onClick, className }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-2 rounded-lg transition-colors",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "focus:outline-none focus:ring-2 focus:ring-[#1A6DFF] focus:ring-offset-2",
        "dark:focus:ring-offset-gray-900",
        className
      )}
      aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
      aria-expanded={isOpen}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        {/* Top Line */}
        <motion.span
          className="block h-0.5 w-6 bg-gray-700 dark:bg-gray-300 rounded-full"
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 6 : 0,
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        />
        
        {/* Middle Line */}
        <motion.span
          className="block h-0.5 w-6 bg-gray-700 dark:bg-gray-300 rounded-full mt-1.5"
          animate={{
            opacity: isOpen ? 0 : 1,
            x: isOpen ? -10 : 0,
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        />
        
        {/* Bottom Line */}
        <motion.span
          className="block h-0.5 w-6 bg-gray-700 dark:bg-gray-300 rounded-full mt-1.5"
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -6 : 0,
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        />
      </div>
    </button>
  );
} 