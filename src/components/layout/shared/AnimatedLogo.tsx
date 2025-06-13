'use client'

// React Imports
import type { ComponentProps } from 'react'

// Third-party Imports
import { motion } from 'framer-motion'

type AnimatedLogoProps = ComponentProps<typeof motion.svg> & {
  isCollapsed?: boolean
  isHovered?: boolean
}

const AnimatedLogo = ({
  isCollapsed = false,
  isHovered = false,
  className = '',
  ...props
}: AnimatedLogoProps) => {
  const isCollapsedAndNotHovered = isCollapsed && !isHovered

  return (
    <motion.div
      className={`overflow-visible ${className}`}
      initial={{ rotate: 0 }}
      animate={
        isCollapsedAndNotHovered
          ? { rotate: [0, 2, -2, 0] }
          : { rotate: 0 }
      }
      transition={{
        repeat: isCollapsedAndNotHovered ? Infinity : 0,
        repeatType: 'reverse',
        duration: isCollapsedAndNotHovered ? 6 : 0.3,
        ease: 'easeInOut'
      }}
      whileHover={{
        scale: 1.05,
        rotate: 0,
        transition: { duration: 0.2, ease: 'easeInOut' }
      }}
      whileTap={{
        scale: 0.95,
        rotate: 0,
        transition: { duration: 0.1, ease: 'easeOut' }
      }}
    >
      <motion.svg
        width="221"
        height="221"
        viewBox="0 0 221 221"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ overflow: 'hidden' }}
        {...props}
      >
        <defs>
          {/* Фирменный градиент telesklad */}
          <linearGradient
            id="teleskladGradient"
            x1="0"
            y1="0"
            x2="221"
            y2="221"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#1B6EF3" />
            <stop offset="100%" stopColor="#3EB5EA" />
          </linearGradient>

          {/* Shimmer overlay gradient */}
          <linearGradient
            id="shimmerGradient"
            x1="-100%"
            y1="0%"
            x2="0%"
            y2="0%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="transparent" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0.6)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* Улучшенные фильтры для современного вида */}
          <filter id="modernGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Первый прямоугольник */}
        <motion.path
          d="M77.259 0.609375H0.767578V77.1008H77.259V0.609375Z"
          fill="url(#teleskladGradient)"
          filter="url(#modernGlow)"
        />

        {/* Второй элемент */}
        <motion.path
          d="M220.366 5.63159V77.1053H148.719V220.646H147.644C108.775 220.646 77.2654 189.136 77.2654 150.267V76.0103C77.2654 37.1413 108.775 5.63159 147.644 5.63159H220.366Z"
          fill="url(#teleskladGradient)"
          filter="url(#modernGlow)"
        />

        {/* Shimmer overlay */}
        <motion.g
          animate={{
            x: [-200, 250, -200]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatDelay: 1
          }}
        >
          <path
            d="M77.259 0.609375H0.767578V77.1008H77.259V0.609375Z"
            fill="url(#shimmerGradient)"
            style={{ opacity: 0.4 }}
          />
          <path
            d="M220.366 5.63159V77.1053H148.719V220.646H147.644C108.775 220.646 77.2654 189.136 77.2654 150.267V76.0103C77.2654 37.1413 108.775 5.63159 147.644 5.63159H220.366Z"
            fill="url(#shimmerGradient)"
            style={{ opacity: 0.4 }}
          />
        </motion.g>
      </motion.svg>
    </motion.div>
  )
}

export default AnimatedLogo
