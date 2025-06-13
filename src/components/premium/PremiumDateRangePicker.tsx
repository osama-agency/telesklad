'use client'

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  Grid,
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
  ButtonBase,
  Divider,
  ClickAwayListener,
  Popper,
  SwipeableDrawer
} from '@mui/material'

import AccessTimeIcon from '@mui/icons-material/AccessTime'
import TodayIcon from '@mui/icons-material/Today'
import EventIcon from '@mui/icons-material/Event'
import DateRangeIcon from '@mui/icons-material/DateRange'
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth'
import AllInclusiveIcon from '@mui/icons-material/AllInclusive'
import { Calendar, ChevronDown } from 'lucide-react'

import { format, subDays, startOfDay, endOfDay, isToday, isYesterday, subMonths, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { useDateRangeStore } from '@/store/dateRangeStore'

// Русская локализация для react-datepicker
const russianLocale = {
  localize: {
    month: (monthIndex: number) => {
      const months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
      ]
      return months[monthIndex]
    },
    day: (dayIndex: number) => {
      const days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ']
      return days[dayIndex]
    }
  },
  formatLong: {
    date: () => 'dd.MM.yyyy'
  }
}

interface PresetOption {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  getDates: () => [Date, Date]
  isSelected: (start: Date | null, end: Date | null) => boolean
}

interface PremiumDateRangePickerProps {
  sticky?: boolean
  stickyTop?: number
  className?: string
}

const PremiumDateRangePicker: React.FC<PremiumDateRangePickerProps> = ({
  sticky = false,
  stickyTop = 64,
  className = ''
}) => {
  const { range, setRange } = useDateRangeStore()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))

  // States
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeStep, setActiveStep] = useState<'quick' | 'calendar'>('quick')
  const anchorRef = useRef<HTMLButtonElement>(null)
  const [localRange, setLocalRange] = useState<[Date | null, Date | null]>([null, null])
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  // Hooks
  useEffect(() => {
    setMounted(true)
  }, [])

  // Format date range display
  const formatDateRange = useCallback(() => {
    if (!range.start || !range.end) return 'Выбрать период'

    const selected = presetOptions.find(preset => preset.isSelected(range.start, range.end))
    if (selected) {
      return selected.label
    }

    return `${format(range.start, 'd MMM', { locale: ru })} - ${format(range.end, 'd MMM', { locale: ru })}`
  }, [range])

  // Preset options with modern icons
  const presetOptions: PresetOption[] = useMemo(
    () => [
      {
        id: 'today',
        label: 'Сегодня',
        description: format(new Date(), 'd MMMM', { locale: ru }),
        icon: <TodayIcon sx={{ fontSize: 20 }} />,
        getDates: () => {
          const today = new Date()
          return [startOfDay(today), endOfDay(today)]
        },
        isSelected: (start, end) => {
          if (!start || !end) return false
          return isToday(start) && isToday(end)
        }
      },
      {
        id: 'yesterday',
        label: 'Вчера',
        description: format(subDays(new Date(), 1), 'd MMMM', { locale: ru }),
        icon: <AccessTimeIcon sx={{ fontSize: 20 }} />,
        getDates: () => {
          const yesterday = subDays(new Date(), 1)
          return [startOfDay(yesterday), endOfDay(yesterday)]
        },
        isSelected: (start, end) => {
          if (!start || !end) return false
          return isYesterday(start) && isYesterday(end)
        }
      },
      {
        id: 'week',
        label: 'Неделя',
        description: 'Последние 7 дней',
        icon: <EventIcon sx={{ fontSize: 20 }} />,
        getDates: () => {
          const end = endOfDay(new Date())
          const start = startOfDay(subDays(end, 6))
          return [start, end]
        },
        isSelected: (start, end) => {
          if (!start || !end) return false
          const weekAgo = startOfDay(subDays(new Date(), 6))
          const today = endOfDay(new Date())
          return isSameDay(start, weekAgo) && isSameDay(end, today)
        }
      },
      {
        id: 'month',
        label: 'Месяц',
        description: 'Последние 30 дней',
        icon: <DateRangeIcon sx={{ fontSize: 20 }} />,
        getDates: () => {
          const end = endOfDay(new Date())
          const start = startOfDay(subDays(end, 29))
          return [start, end]
        },
        isSelected: (start, end) => {
          if (!start || !end) return false
          const monthAgo = startOfDay(subDays(new Date(), 29))
          const today = endOfDay(new Date())
          return isSameDay(start, monthAgo) && isSameDay(end, today)
        }
      },
      {
        id: 'quarter',
        label: 'Квартал',
        description: 'Последние 3 месяца',
        icon: <CalendarViewMonthIcon sx={{ fontSize: 20 }} />,
        getDates: () => {
          const end = endOfDay(new Date())
          const start = startOfDay(subMonths(end, 3))
          return [start, end]
        },
        isSelected: (start, end) => {
          if (!start || !end) return false
          const quarterAgo = startOfDay(subMonths(new Date(), 3))
          const today = endOfDay(new Date())
          return isSameDay(start, quarterAgo) && isSameDay(end, today)
        }
      },
      {
        id: 'all',
        label: 'Весь период',
        description: 'Все доступные данные',
        icon: <AllInclusiveIcon sx={{ fontSize: 20 }} />,
        getDates: () => {
          const end = endOfDay(new Date())
          const start = startOfDay(subMonths(end, 12))
          return [start, end]
        },
        isSelected: (start, end) => {
          if (!start || !end) return false
          const yearAgo = startOfDay(subMonths(new Date(), 12))
          const today = endOfDay(new Date())
          return isSameDay(start, yearAgo) && isSameDay(end, today)
        }
      }
    ],
    []
  )

  // Check which preset is selected
  useEffect(() => {
    if (!mounted) return

    const selected = presetOptions.find(preset => preset.isSelected(range.start, range.end))
    setSelectedPreset(selected?.id || null)
  }, [range, presetOptions, mounted])

  // Initialize localRange from global store
  useEffect(() => {
    if (!mounted) return

    setLocalRange([range.start, range.end])
  }, [range.start, range.end, mounted])

  // Handle open/close
  const handleOpen = useCallback(() => {
    setIsOpen(true)
    setActiveStep('quick')
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleStepChange = useCallback((step: 'quick' | 'calendar') => {
    setActiveStep(step)
  }, [])

  const handlePresetSelect = (preset: PresetOption) => {
    const dates = preset.getDates()
    setRange({ start: dates[0], end: dates[1] })
    setSelectedPreset(preset.id)
    // Автоматически закрываем для десктопа
    if (!isMobile) {
      handleClose()
    }
  }

  const handleApply = () => {
    setRange({ start: localRange[0], end: localRange[1] })
    handleClose()
  }

  const handleCalendarChange = (dates: any) => {
    const [start, end] = dates
    setLocalRange([start, end])
    setSelectedPreset(null)
  }

  const handleShowCalendar = () => {
    // Calendar functionality handled by activeStep state
  }

  // Desktop Trigger Button
  const triggerButton = (
    <ButtonBase
      ref={anchorRef}
      onClick={handleOpen}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 3,
        py: 2,
        borderRadius: 1.5, // rounded-md
        border: 'none',
        bgcolor: theme.palette.mode === 'dark' ? '#20202A' : alpha(theme.palette.action.hover, 0.02),
        color: 'text.secondary',
        fontSize: '0.875rem', // text-sm
        fontWeight: 500, // font-medium
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        minWidth: 200,
        justifyContent: 'flex-start',
        '&:hover': {
          bgcolor: theme.palette.mode === 'dark'
            ? alpha('#20202A', 0.8)
            : alpha(theme.palette.action.hover, 0.06),
          boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`, // ring-1 ring-primary/20
          color: 'text.primary'
        },
        '&:focus-visible': {
          outline: 'none',
          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
        },
        '&:active': {
          transform: 'scale(0.98)'
        },
        ...(sticky && {
          position: 'sticky',
          top: stickyTop,
          zIndex: 100
        })
      }}
      className={className}
    >
      {/* Lucide Calendar Icon */}
      <Calendar
        size={16}
        strokeWidth={1.5}
        color={theme.palette.text.secondary}
        style={{ flexShrink: 0 }}
      />

      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontWeight: 500,
          fontSize: '0.875rem',
          flex: 1
        }}
      >
        {formatDateRange()}
      </Typography>

      {/* Lucide ChevronDown Icon */}
      <ChevronDown
        size={16}
        strokeWidth={1.5}
        color={theme.palette.text.secondary}
        style={{
          flexShrink: 0,
          opacity: 0.7,
          transition: 'transform 0.2s ease'
        }}
      />
    </ButtonBase>
  )

  // Mobile Bottom Sheet Content - КОМПАКТНЫЙ С SWIPE-TO-DISMISS
  const bottomSheetContent = (
    <Box
      sx={{
        height: '75vh',
        maxHeight: '650px',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        borderRadius: '24px 24px 0 0',
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        boxShadow: `0 -8px 32px ${alpha(theme.palette.common.black, 0.12)}`
      }}
    >
      {/* Swipe Handle - улучшенный для swipe gesture */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          pt: 2,
          pb: 1.5,
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing'
          }
        }}
        onTouchStart={(e) => {
          const startY = e.touches[0].clientY
          const handleTouchMove = (moveEvent: TouchEvent) => {
            const currentY = moveEvent.touches[0].clientY
            const diff = currentY - startY
            if (diff > 50) { // Swipe down threshold
              handleClose()
              document.removeEventListener('touchmove', handleTouchMove)
            }
          }
          document.addEventListener('touchmove', handleTouchMove, { passive: true })
          document.addEventListener('touchend', () => {
            document.removeEventListener('touchmove', handleTouchMove)
          }, { once: true })
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 6,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.text.primary, 0.2),
            background: `linear-gradient(90deg, ${alpha(theme.palette.text.primary, 0.15)} 0%, ${alpha(theme.palette.text.primary, 0.25)} 50%, ${alpha(theme.palette.text.primary, 0.15)} 100%)`
          }}
        />
      </Box>

      {/* Header - улучшенный с иконкой календаря слева */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, transparent 100%)`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
                          background: 'linear-gradient(135deg, #1B6EF3 0%, #3EB5EA 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
              color: 'white',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
            }}
          >
            <i className="bx-calendar" style={{ fontSize: '1.125rem' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600} letterSpacing="-0.01em">
              Период
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: '0.8125rem', mt: 0.25 }}
            >
              Выберите диапазон для анализа
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={handleClose}
          sx={{
            color: 'text.secondary',
            bgcolor: alpha(theme.palette.action.hover, 0.5),
            '&:hover': {
              bgcolor: 'action.hover',
              transform: 'scale(1.05)'
            }
          }}
        >
          <i className="bx-x" />
        </IconButton>
      </Box>

      {/* Step Navigation - ЭТАП 1 и ЭТАП 2 */}
      <Box
        sx={{
          display: 'flex',
          px: 3,
          py: 2.5,
          gap: 1.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`
        }}
      >
        <Chip
          label="🚀 Этап 1: Быстрый выбор"
          variant={activeStep === 'quick' ? 'filled' : 'outlined'}
          onClick={() => handleStepChange('quick')}
          sx={{
            fontWeight: 600,
            fontSize: '0.875rem',
            px: 1,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            ...(activeStep === 'quick' && {
              background: 'linear-gradient(135deg, #1B6EF3 0%, #3EB5EA 100%)',
              color: 'white',
              '& .MuiChip-label': { color: 'white' },
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
            }),
            '&:hover': {
              transform: 'translateY(-1px)'
            }
          }}
        />
        <Chip
          label="📅 Этап 2: Календарь"
          variant={activeStep === 'calendar' ? 'filled' : 'outlined'}
          onClick={() => handleStepChange('calendar')}
          sx={{
            fontWeight: 600,
            fontSize: '0.875rem',
            px: 1,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            ...(activeStep === 'calendar' && {
              background: 'linear-gradient(135deg, #1B6EF3 0%, #3EB5EA 100%)',
              color: 'white',
              '& .MuiChip-label': { color: 'white' },
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
            }),
            '&:hover': {
              transform: 'translateY(-1px)'
            }
          }}
        />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3 }}>
        <AnimatePresence mode="wait">
          {activeStep === 'quick' ? (
            <motion.div
              key="quick"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <Box sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {presetOptions.map((preset, index) => {
                  const isSelected = preset.isSelected(range.start, range.end)
                  return (
                    <motion.div
                      key={preset.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.1,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                    >
                      <ButtonBase
                        onClick={() => handlePresetSelect(preset)}
                        sx={{
                          width: '100%',
                          minHeight: 72,
                          p: 2,
                          borderRadius: 3,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          textAlign: 'left',
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          ...(isSelected ? {
                            background: 'linear-gradient(135deg, #1B6EF3 0%, #3EB5EA 100%)',
                            color: 'white',
                            boxShadow: `0 8px 32px ${alpha('#1B6EF3', 0.25)}`,
                            transform: 'translateY(-2px)',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: `0 12px 40px ${alpha('#1B6EF3', 0.3)}`
                            }
                          } : {
                            bgcolor: alpha(theme.palette.action.hover, 0.02),
                            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                            color: 'text.primary',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.action.hover, 0.05),
                              transform: 'translateY(-1px) scale(1.01)',
                              boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.08)}`
                            }
                          }),
                          '&:active': {
                            transform: isSelected ? 'translateY(-1px) scale(0.98)' : 'translateY(0) scale(0.98)'
                          }
                        }}
                      >
                        {/* Icon Container */}
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            flexShrink: 0,
                            ...(isSelected ? {
                              bgcolor: alpha('#fff', 0.15),
                              color: '#fff'
                            } : {
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              color: theme.palette.primary.main
                            })
                          }}
                        >
                          {preset.icon}
                        </Box>

                        {/* Text Content */}
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontSize: '1.125rem',
                              fontWeight: 600,
                              lineHeight: 1.2,
                              mb: 0.5,
                              color: isSelected ? '#fff' : 'text.primary'
                            }}
                          >
                            {preset.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '0.875rem',
                              lineHeight: 1.3,
                              color: isSelected ? alpha('#fff', 0.8) : 'text.secondary'
                            }}
                          >
                            {preset.description}
                          </Typography>
                        </Box>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: alpha('#fff', 0.2),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff'
                            }}
                          >
                            ✓
                          </Box>
                        )}
                      </ButtonBase>
                    </motion.div>
                  )
                })}
              </Box>
            </motion.div>
          ) : (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  pt: 2,
                  px: 1,
                  // СОВРЕМЕННЫЙ КАЛЕНДАРЬ - BEST PRACTICES
                  '& .react-datepicker': {
                    border: 'none',
                    bgcolor: 'transparent',
                    fontFamily: theme.typography.fontFamily,
                    borderRadius: 4,
                    width: '100%'
                  },
                  // КОМПАКТНЫЙ HEADER
                  '& .react-datepicker__header': {
                    bgcolor: 'transparent',
                    borderBottom: theme.palette.mode === 'dark'
                      ? '1px solid #2A2B36'
                      : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    pb: 1.5,
                    mb: 1.5,
                    position: 'relative'
                  },
                  // МЕСЯЦ И ГОД
                  '& .react-datepicker__current-month': {
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: theme.palette.mode === 'dark' ? '#C7C9D9' : theme.palette.text.primary,
                    mb: 1.5,
                    letterSpacing: '-0.01em',
                    textAlign: 'center'
                  },
                  // НАВИГАЦИЯ
                  '& .react-datepicker__navigation': {
                    top: '8px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    bgcolor: theme.palette.mode === 'dark'
                      ? alpha('#C7C9D9', 0.05)
                      : alpha(theme.palette.action.hover, 0.05),
                    border: theme.palette.mode === 'dark'
                      ? '1px solid #2A2B36'
                      : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark'
                        ? alpha('#C7C9D9', 0.1)
                        : alpha(theme.palette.primary.main, 0.08),
                      borderColor: alpha(theme.palette.primary.main, 0.3)
                    },
                    '&::before': {
                      borderColor: theme.palette.mode === 'dark' ? '#C7C9D9' : theme.palette.text.secondary,
                      borderWidth: '2px 2px 0 0',
                      width: '5px',
                      height: '5px'
                    }
                  },
                  '& .react-datepicker__navigation--previous': {
                    left: '12px'
                  },
                  '& .react-datepicker__navigation--next': {
                    right: '12px'
                  },
                  // ДНИ НЕДЕЛИ
                  '& .react-datepicker__day-names': {
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 0.5
                  },
                  '& .react-datepicker__day-name': {
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    color: theme.palette.mode === 'dark' ? alpha('#C7C9D9', 0.6) : theme.palette.text.secondary,
                    width: '32px',
                    height: '20px',
                    lineHeight: '20px',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em'
                  },
                  // СТРОКИ С ДАТАМИ
                  '& .react-datepicker__week': {
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 0.25
                  },
                  // ДНИ КАЛЕНДАРЯ
                  '& .react-datepicker__day': {
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px', // КВАДРАТНЫЕ
                    fontSize: '0.8125rem',
                    fontWeight: 400, // УБРАНА ЖИРНОСТЬ
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '1px',
                    transition: 'all 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    cursor: 'pointer',
                    // ОБЫЧНОЕ СОСТОЯНИЕ
                    color: theme.palette.text.primary,
                    bgcolor: 'transparent',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark'
                        ? alpha('#C7C9D9', 0.08)
                        : alpha(theme.palette.primary.main, 0.08),
                      transform: 'scale(1.05)'
                    }
                  },
                  // ВЫБРАННЫЕ ДАТЫ - ПЛАВНЫЙ ГРАДИЕНТ
                  '& .react-datepicker__day--selected': {
                    background: theme.palette.mode === 'dark'
                      ? theme.palette.primary.main
                      : 'linear-gradient(135deg, #1B6EF3 0%, #3EB5EA 100%)',
                    color: 'white !important',
                    fontWeight: 500,
                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
                    '&:hover': {
                      background: theme.palette.mode === 'dark'
                        ? theme.palette.primary.dark
                        : 'linear-gradient(135deg, #134EC0 0%, #1B6EF3 100%)',
                      transform: 'scale(1.05)',
                      boxShadow: `0 3px 12px ${alpha(theme.palette.primary.main, 0.35)}`
                    }
                  },
                  // ДИАПАЗОН - ПЛАВНЫЙ ГРАДИЕНТ
                  '& .react-datepicker__day--in-range': {
                    bgcolor: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.12)
                      : alpha('#1B6EF3', 0.08),
                    color: theme.palette.mode === 'dark' ? '#C7C9D9' : '#1B6EF3',
                    fontWeight: 400,
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark'
                        ? alpha(theme.palette.primary.main, 0.18)
                        : alpha('#1B6EF3', 0.12),
                      transform: 'scale(1.05)'
                    }
                  },
                  // НАЧАЛО И КОНЕЦ ДИАПАЗОНА
                  '& .react-datepicker__day--range-start, & .react-datepicker__day--range-end': {
                    background: theme.palette.mode === 'dark'
                      ? theme.palette.primary.main
                      : 'linear-gradient(135deg, #1B6EF3 0%, #3EB5EA 100%)',
                    color: 'white !important',
                    fontWeight: 500,
                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`
                  },
                  // СЕГОДНЯ - ТОНКАЯ ОБВОДКА
                  '& .react-datepicker__day--today': {
                    fontWeight: 500,
                    color: theme.palette.mode === 'dark' ? '#C7C9D9' : theme.palette.primary.main,
                    bgcolor: 'transparent',
                    boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`, // RING
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark'
                        ? alpha(theme.palette.primary.main, 0.08)
                        : alpha(theme.palette.primary.main, 0.08),
                      transform: 'scale(1.05)'
                    }
                  },
                  // ОТКЛЮЧЕННЫЕ
                  '& .react-datepicker__day--disabled': {
                    color: theme.palette.action.disabled,
                    cursor: 'not-allowed',
                    '&:hover': {
                      bgcolor: 'transparent',
                      transform: 'none'
                    }
                  },
                  // ДРУГИЕ МЕСЯЦЫ
                  '& .react-datepicker__day--outside-month': {
                    color: theme.palette.mode === 'dark'
                      ? alpha('#C7C9D9', 0.3)
                      : alpha(theme.palette.text.secondary, 0.3),
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark'
                        ? alpha('#C7C9D9', 0.03)
                        : alpha(theme.palette.action.hover, 0.03)
                    }
                  }
                }}
              >
                <AppReactDatepicker
                  selectsRange
                  startDate={range.start ?? undefined}
                  endDate={range.end ?? undefined}
                  onChange={(dates: [Date | null, Date | null]) => {
                    setRange({ start: dates[0], end: dates[1] })
                    // Автозакрытие если выбран полный диапазон
                    if (dates[0] && dates[1] && !isMobile) {
                      setTimeout(() => handleClose(), 200)
                    }
                  }}
                  inline
                  monthsShown={1}
                  dateFormat="dd.MM.yyyy"
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  calendarStartDay={1}
                  locale={ru}
                  fixedHeight
                  shouldCloseOnSelect={false}
                  maxDate={new Date()}
                  placeholderText="Выберите период"
                  renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 2,
                        py: 1
                      }}
                    >
                      <IconButton
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                        size="small"
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '6px',
                          bgcolor: theme.palette.mode === 'dark'
                            ? alpha('#C7C9D9', 0.05)
                            : alpha(theme.palette.action.hover, 0.05),
                          border: theme.palette.mode === 'dark'
                            ? '1px solid #2A2B36'
                            : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark'
                              ? alpha('#C7C9D9', 0.1)
                              : alpha(theme.palette.primary.main, 0.08),
                            borderColor: alpha(theme.palette.primary.main, 0.3)
                          }
                        }}
                      >
                        <ChevronDown
                          size={14}
                          style={{
                            transform: 'rotate(90deg)',
                            color: theme.palette.mode === 'dark' ? '#C7C9D9' : theme.palette.text.secondary
                          }}
                        />
                      </IconButton>

                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                          color: theme.palette.mode === 'dark' ? '#C7C9D9' : theme.palette.text.primary,
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {format(date, 'LLLL yyyy', { locale: ru })}
                      </Typography>

                      <IconButton
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}
                        size="small"
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '6px',
                          bgcolor: theme.palette.mode === 'dark'
                            ? alpha('#C7C9D9', 0.05)
                            : alpha(theme.palette.action.hover, 0.05),
                          border: theme.palette.mode === 'dark'
                            ? '1px solid #2A2B36'
                            : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark'
                              ? alpha('#C7C9D9', 0.1)
                              : alpha(theme.palette.primary.main, 0.08),
                            borderColor: alpha(theme.palette.primary.main, 0.3)
                          }
                        }}
                      >
                        <ChevronDown
                          size={14}
                          style={{
                            transform: 'rotate(-90deg)',
                            color: theme.palette.mode === 'dark' ? '#C7C9D9' : theme.palette.text.secondary
                          }}
                        />
                      </IconButton>
                    </Box>
                  )}
                  formatWeekDay={(nameOfDay) => {
                    const russianDays = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ']
                    const dayIndex = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].indexOf(nameOfDay)
                    return russianDays[dayIndex] || nameOfDay.substring(0, 2).toUpperCase()
                  }}
                />
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Bottom Action Bar - ТОЛЬКО ДЛЯ МОБИЛЬНЫХ */}
      <AnimatePresence>
        {(range.start || range.end) && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
          >
            <Box
              sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(20px)',
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
                zIndex: 1400
              }}
            >
              {/* Apply Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleClose}
                disabled={!range.start || !range.end}
                sx={{
                  py: 2,
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #1B6EF3 0%, #3EB5EA 100%)',
                  boxShadow: `0 4px 12px ${alpha('#1B6EF3', 0.3)}`,
                  minHeight: 56,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #134EC0 0%, #1B6EF3 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${alpha('#1B6EF3', 0.4)}`
                  },
                  '&:active': {
                    transform: 'translateY(0)'
                  },
                  '&:disabled': {
                    background: alpha(theme.palette.action.disabled, 0.12),
                    color: theme.palette.action.disabled
                  }
                }}
              >
                Применить
              </Button>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )

  // Desktop Popover Content - МОДЕРНИЗИРОВАННЫЙ В СТИЛЕ LINEAR/AVIASALES
  const desktopContent = (
    <ClickAwayListener onClickAway={handleClose}>
      <Paper
        elevation={8}
        sx={{
          minWidth: 380,
          maxWidth: 420,
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: theme.palette.mode === 'dark' ? '#1B1C24' : 'background.paper',
          border: theme.palette.mode === 'dark'
            ? '1px solid #2A2B36'
            : `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.4)'
            : `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`
        }}
      >
        {/* Header - МИНИМАЛИСТИЧНЫЙ */}
        <Box
          sx={{
            px: 4,
            py: 3,
            borderBottom: theme.palette.mode === 'dark'
              ? '1px solid #2A2B36'
              : `1px solid ${alpha(theme.palette.divider, 0.08)}`
          }}
        >
          <Typography
            variant="h6"
            fontWeight={600}
            letterSpacing="-0.02em"
            sx={{
              fontSize: '1rem',
              color: theme.palette.mode === 'dark' ? '#C7C9D9' : 'text.primary'
            }}
          >
            Период
          </Typography>
        </Box>

        {/* Quick Presets - КОМПАКТНЫЕ */}
        <Box sx={{ p: 4 }}>
          <Grid container spacing={2}>
            {presetOptions.map((preset) => {
              const isSelected = preset.isSelected(range.start, range.end)
              return (
                <Grid item xs={4} key={preset.id}>
                  <Button
                    fullWidth
                    variant={isSelected ? 'contained' : 'outlined'}
                    onClick={() => handlePresetSelect(preset)}
                    startIcon={preset.icon}
                    sx={{
                      py: 1.5,
                      px: 1,
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      fontWeight: 500,
                      borderRadius: 2,
                      minHeight: 44,
                      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                      flexDirection: 'column',
                      gap: 0.25,
                      ...(isSelected ? {
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: theme.palette.primary.dark,
                          transform: 'translateY(-1px)',
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
                        }
                      } : {
                        borderColor: theme.palette.mode === 'dark' ? '#2A2B36' : alpha(theme.palette.divider, 0.2),
                        bgcolor: 'transparent',
                        color: theme.palette.mode === 'dark' ? '#C7C9D9' : 'text.primary',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark'
                            ? alpha('#C7C9D9', 0.05)
                            : alpha(theme.palette.action.hover, 0.08),
                          borderColor: theme.palette.primary.main,
                          boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`
                        }
                      }),
                      '&:active': {
                        transform: 'scale(0.98)',
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`
                      },
                      '& .MuiButton-startIcon': {
                        margin: 0,
                        fontSize: '1rem'
                      }
                    }}
                  >
                    <Box sx={{ fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.2 }}>
                      {preset.label}
                    </Box>
                  </Button>
                </Grid>
              )
            })}
          </Grid>

          {/* Разделитель перед календарем */}
          <Box
            sx={{
              mt: 3,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Divider sx={{ flex: 1, opacity: 0.4 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Calendar
                size={14}
                strokeWidth={1.5}
                color={theme.palette.text.secondary}
              />
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}
              >
                Произвольный диапазон
              </Typography>
            </Box>
            <Divider sx={{ flex: 1, opacity: 0.4 }} />
          </Box>

          {/* КАСТОМНЫЙ КАЛЕНДАРЬ - КОМПАКТНЫЙ */}
          <Box
            sx={{
              '& .react-datepicker-wrapper': {
                width: '100%'
              },
              '& .react-datepicker': {
                border: 'none',
                bgcolor: 'transparent',
                fontFamily: theme.typography.fontFamily,
                borderRadius: 0,
                width: '100%',
                boxShadow: 'none'
              },
              // КОМПАКТНЫЙ HEADER
              '& .react-datepicker__header': {
                bgcolor: 'transparent',
                borderBottom: theme.palette.mode === 'dark'
                  ? '1px solid #2A2B36'
                  : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                pb: 1.5,
                mb: 1.5,
                position: 'relative'
              },
              // МЕСЯЦ И ГОД
              '& .react-datepicker__current-month': {
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: theme.palette.mode === 'dark' ? '#C7C9D9' : theme.palette.text.primary,
                mb: 1.5,
                letterSpacing: '-0.01em',
                textAlign: 'center'
              },
              // НАВИГАЦИЯ
              '& .react-datepicker__navigation': {
                top: '8px',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                bgcolor: theme.palette.mode === 'dark'
                  ? alpha('#C7C9D9', 0.05)
                  : alpha(theme.palette.action.hover, 0.05),
                border: theme.palette.mode === 'dark'
                  ? '1px solid #2A2B36'
                  : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha('#C7C9D9', 0.1)
                    : alpha(theme.palette.primary.main, 0.08),
                  borderColor: alpha(theme.palette.primary.main, 0.3)
                },
                '&::before': {
                  borderColor: theme.palette.mode === 'dark' ? '#C7C9D9' : theme.palette.text.secondary,
                  borderWidth: '2px 2px 0 0',
                  width: '5px',
                  height: '5px'
                }
              },
              '& .react-datepicker__navigation--previous': {
                left: '12px'
              },
              '& .react-datepicker__navigation--next': {
                right: '12px'
              },
              // ДНИ НЕДЕЛИ
              '& .react-datepicker__day-names': {
                display: 'flex',
                justifyContent: 'space-between',
                mb: 0.5
              },
              '& .react-datepicker__day-name': {
                fontSize: '0.6875rem',
                fontWeight: 500,
                color: theme.palette.mode === 'dark' ? alpha('#C7C9D9', 0.6) : theme.palette.text.secondary,
                width: '32px',
                height: '20px',
                lineHeight: '20px',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.03em'
              },
              // НЕДЕЛИ
              '& .react-datepicker__week': {
                display: 'flex',
                justifyContent: 'space-between',
                mb: 0.25
              },
              // ДНИ КАЛЕНДАРЯ - КВАДРАТНЫЕ И КОМПАКТНЫЕ
              '& .react-datepicker__day': {
                width: '32px',
                height: '32px',
                borderRadius: '6px', // КВАДРАТНЫЕ
                fontSize: '0.8125rem',
                fontWeight: 400, // УБРАНА ЖИРНОСТЬ
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '1px',
                transition: 'all 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                cursor: 'pointer',
                color: theme.palette.mode === 'dark' ? '#C7C9D9' : theme.palette.text.primary,
                bgcolor: 'transparent',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha('#C7C9D9', 0.08)
                    : alpha(theme.palette.primary.main, 0.08),
                  transform: 'scale(1.05)'
                }
              },
              // ВЫБРАННЫЕ ДАТЫ - ПЛАВНЫЙ ГРАДИЕНТ
              '& .react-datepicker__day--selected': {
                background: theme.palette.mode === 'dark'
                  ? theme.palette.primary.main
                  : 'linear-gradient(135deg, #1B6EF3 0%, #3EB5EA 100%)',
                color: 'white !important',
                fontWeight: 500,
                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
                '&:hover': {
                  background: theme.palette.mode === 'dark'
                    ? theme.palette.primary.dark
                    : 'linear-gradient(135deg, #134EC0 0%, #1B6EF3 100%)',
                  transform: 'scale(1.05)',
                  boxShadow: `0 3px 12px ${alpha(theme.palette.primary.main, 0.35)}`
                }
              },
              // ДИАПАЗОН - ПЛАВНЫЙ ГРАДИЕНТ
              '& .react-datepicker__day--in-range': {
                bgcolor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.12)
                  : alpha('#1B6EF3', 0.08),
                color: theme.palette.mode === 'dark' ? '#C7C9D9' : '#1B6EF3',
                fontWeight: 400,
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.18)
                    : alpha('#1B6EF3', 0.12),
                  transform: 'scale(1.05)'
                }
              },
              // НАЧАЛО И КОНЕЦ ДИАПАЗОНА
              '& .react-datepicker__day--range-start, & .react-datepicker__day--range-end': {
                background: theme.palette.mode === 'dark'
                  ? theme.palette.primary.main
                  : 'linear-gradient(135deg, #1B6EF3 0%, #3EB5EA 100%)',
                color: 'white !important',
                fontWeight: 500,
                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`
              },
              // СЕГОДНЯ - ТОНКАЯ ОБВОДКА
              '& .react-datepicker__day--today': {
                fontWeight: 500,
                color: theme.palette.mode === 'dark' ? '#C7C9D9' : theme.palette.primary.main,
                bgcolor: 'transparent',
                boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`, // RING
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.08)
                    : alpha(theme.palette.primary.main, 0.08),
                  transform: 'scale(1.05)'
                }
              },
              // ОТКЛЮЧЕННЫЕ
              '& .react-datepicker__day--disabled': {
                color: theme.palette.action.disabled,
                cursor: 'not-allowed',
                '&:hover': {
                  bgcolor: 'transparent',
                  transform: 'none'
                }
              },
              // ДРУГИЕ МЕСЯЦЫ
              '& .react-datepicker__day--outside-month': {
                color: theme.palette.mode === 'dark'
                  ? alpha('#C7C9D9', 0.3)
                  : alpha(theme.palette.text.secondary, 0.3),
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha('#C7C9D9', 0.03)
                    : alpha(theme.palette.action.hover, 0.03)
                }
              }
            }}
          >
            <AppReactDatepicker
              selectsRange
              startDate={range.start ?? undefined}
              endDate={range.end ?? undefined}
              onChange={(dates: [Date | null, Date | null]) => {
                setRange({ start: dates[0], end: dates[1] })
                // Автозакрытие если выбран полный диапазон
                if (dates[0] && dates[1] && !isMobile) {
                  setTimeout(() => handleClose(), 200)
                }
              }}
              inline
              monthsShown={1}
              dateFormat="dd.MM.yyyy"
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              calendarStartDay={1}
              locale={ru}
              fixedHeight
              shouldCloseOnSelect={false}
              maxDate={new Date()}
              placeholderText="Выберите период"
              renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                    py: 1
                  }}
                >
                  <IconButton
                    onClick={decreaseMonth}
                    disabled={prevMonthButtonDisabled}
                    size="small"
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '6px',
                      bgcolor: theme.palette.mode === 'dark'
                        ? alpha('#C7C9D9', 0.05)
                        : alpha(theme.palette.action.hover, 0.05),
                      border: theme.palette.mode === 'dark'
                        ? '1px solid #2A2B36'
                        : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark'
                          ? alpha('#C7C9D9', 0.1)
                          : alpha(theme.palette.primary.main, 0.08),
                        borderColor: alpha(theme.palette.primary.main, 0.3)
                      }
                    }}
                  >
                    <ChevronDown
                      size={14}
                      style={{
                        transform: 'rotate(90deg)',
                        color: theme.palette.mode === 'dark' ? '#C7C9D9' : theme.palette.text.secondary
                      }}
                    />
                  </IconButton>

                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: theme.palette.mode === 'dark' ? '#C7C9D9' : theme.palette.text.primary,
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {format(date, 'LLLL yyyy', { locale: ru })}
                  </Typography>

                  <IconButton
                    onClick={increaseMonth}
                    disabled={nextMonthButtonDisabled}
                    size="small"
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '6px',
                      bgcolor: theme.palette.mode === 'dark'
                        ? alpha('#C7C9D9', 0.05)
                        : alpha(theme.palette.action.hover, 0.05),
                      border: theme.palette.mode === 'dark'
                        ? '1px solid #2A2B36'
                        : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark'
                          ? alpha('#C7C9D9', 0.1)
                          : alpha(theme.palette.primary.main, 0.08),
                        borderColor: alpha(theme.palette.primary.main, 0.3)
                      }
                    }}
                  >
                    <ChevronDown
                      size={14}
                      style={{
                        transform: 'rotate(-90deg)',
                        color: theme.palette.mode === 'dark' ? '#C7C9D9' : theme.palette.text.secondary
                      }}
                    />
                  </IconButton>
                </Box>
              )}
              formatWeekDay={(nameOfDay) => {
                const russianDays = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ']
                const dayIndex = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].indexOf(nameOfDay)
                return russianDays[dayIndex] || nameOfDay.substring(0, 2).toUpperCase()
              }}
            />
          </Box>

          {/* Выбранный диапазон - ЦЕНТРИРОВАННЫЙ С ИКОНКОЙ */}
          {(range.start || range.end) && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.08)
                  : alpha(theme.palette.primary.main, 0.04),
                border: theme.palette.mode === 'dark'
                  ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  : `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}
            >
              <Calendar
                size={14}
                strokeWidth={1.5}
                color={theme.palette.mode === 'dark' ? alpha('#C7C9D9', 0.6) : theme.palette.text.secondary}
              />
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.mode === 'dark' ? alpha('#C7C9D9', 0.8) : 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.8125rem'
                }}
              >
                {range.start && range.end ? (
                  `${format(range.start, 'd MMM', { locale: ru })} - ${format(range.end, 'd MMM', { locale: ru })}`
                ) : range.start ? (
                  `От ${format(range.start, 'd MMM', { locale: ru })}`
                ) : (
                  'Выберите даты'
                )}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </ClickAwayListener>
  )

  return (
    <>
      {triggerButton}

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <SwipeableDrawer
          anchor="bottom"
          open={isOpen}
          onClose={handleClose}
          onOpen={handleOpen}
          disableSwipeToOpen={true}
          PaperProps={{
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none'
            }
          }}
          ModalProps={{
            sx: {
              backdropFilter: 'blur(12px)',
              bgcolor: alpha(theme.palette.common.black, 0.4)
            }
          }}
        >
          {bottomSheetContent}
        </SwipeableDrawer>
      )}

      {/* Desktop Popover */}
      {!isMobile && (
        <Popper
          open={isOpen}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          sx={{ zIndex: 1300 }}
        >
          {desktopContent}
        </Popper>
      )}
    </>
  )
}

export default PremiumDateRangePicker
