"use client";

import { motion } from "framer-motion";

export function AnimatedLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Анимированная иконка логотипа */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 1.0,
          duration: 0.6,
          ease: "easeOut",
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
      >
        <svg width="32" height="32" viewBox="0 0 221 221" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoIconGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1B6EF3" />
              <stop offset="100%" stopColor="#3EB5EA" />
            </linearGradient>
          </defs>
          <path d="M77.259 0.609375H0.767578V77.1008H77.259V0.609375Z" fill="url(#logoIconGradient)"/>
          <path d="M220.366 5.63159V77.1053H148.719V220.646H147.644C108.775 220.646 77.2654 189.136 77.2654 150.267V76.0103C77.2654 37.1413 108.775 5.63159 147.644 5.63159H220.366Z" fill="url(#logoIconGradient)"/>
        </svg>
      </motion.div>
      
      {/* Анимированное название по слогам */}
      <div className="flex text-xl font-bold font-golos text-dark dark:text-white">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 1.8,
            duration: 0.4,
            ease: "easeOut"
          }}
        >
          tele
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 2.1,
            duration: 0.4,
            ease: "easeOut"
          }}
        >
          sklad
        </motion.span>
      </div>
    </div>
  );
} 