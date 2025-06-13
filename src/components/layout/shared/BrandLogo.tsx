'use client'

// React Imports
import React from 'react'

// MUI Imports
import { Box, Typography, useTheme } from '@mui/material'

// Third-party Imports
import { motion } from 'framer-motion'

interface BrandLogoProps {
  size?: 'small' | 'medium' | 'large'
  showText?: boolean
  className?: string
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'medium',
  showText = true,
  className = ''
}) => {
  const theme = useTheme()

  // Размеры для разных вариантов
  const sizeConfig = {
    small: { icon: 32, text: '1.25rem' },
    medium: { icon: 48, text: '1.75rem' },
    large: { icon: 64, text: '2.25rem' }
  }

  const config = sizeConfig[size]

      // Анимации
  const containerVariants = {
    initial: { opacity: 0, y: -20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        staggerChildren: 0.1
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  }

  const iconVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  }

  const textVariants = {
    initial: { opacity: 0, x: -10 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.2,
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  }

  return (
    <motion.div
      className={`flex items-center justify-center gap-3 ${className}`}
      variants={containerVariants}
      whileHover="hover"
      initial="initial"
      animate="animate"
      style={{ cursor: 'default' }}
    >
      {/* SVG Иконка */}
      <motion.div
        variants={iconVariants}
        className="relative"
        style={{
          filter: 'drop-shadow(0 4px 12px rgba(27, 110, 243, 0.25))'
        }}
      >
        <Box
          sx={{
            width: config.icon,
            height: config.icon,
            borderRadius: 2,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1B6EF3 0%, #3EB5EA 100%)'
              : 'linear-gradient(135deg, #1B6EF3 0%, #3EB5EA 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              borderRadius: 'inherit'
            }
          }}
        >
          <svg
            width={config.icon * 0.7}
            height={config.icon * 0.7}
            viewBox="0 0 221 221"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: 'relative', zIndex: 1 }}
          >
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path
              d="M77.259 0.609375H0.767578V77.1008H77.259V0.609375Z"
              fill="white"
              filter="url(#glow)"
            />
            <path
              d="M220.366 5.63159V77.1053H148.719V220.646H147.644C108.775 220.646 77.2654 189.136 77.2654 150.267V76.0103C77.2654 37.1413 108.775 5.63159 147.644 5.63159H220.366Z"
              fill="white"
              filter="url(#glow)"
            />
          </svg>
        </Box>
      </motion.div>

      {/* Текст логотипа */}
      {showText && (
        <motion.div
          variants={textVariants}
          className="hidden md:block"
        >
          <Typography
            variant="h4"
            sx={{
              fontSize: config.text,
              fontWeight: 700,
              letterSpacing: '-0.5px',
              fontFamily: 'var(--font-golos-text), "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              textShadow: theme.palette.mode === 'light'
                ? '0 1px 2px rgba(0, 0, 0, 0.06)'
                : 'none',
                            // Стили применяются к дочерним элементам
              color: 'initial'
            }}
          >
            {theme.palette.mode === 'light' ? (
              // Светлая тема: весь текст bold с градиентом
              <Box
                component="span"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #1B6EF3 0%, #3EB5EA 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                telesklad
              </Box>
            ) : (
              // Темная тема: градиентный текст
              <Box
                component="span"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                telesklad
              </Box>
            )}
          </Typography>
        </motion.div>
      )}
    </motion.div>
  )
}

export default BrandLogo
