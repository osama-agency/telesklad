'use client'

// React Imports
import React from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import { useTheme, alpha, useColorScheme } from '@mui/material/styles'
import {
  Box,
  Paper,
  Tooltip,
  Typography,
  Avatar,
  Card,
  CardContent,
  Badge,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material'

// Third-party Imports
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { ChevronDown } from 'lucide-react'

// MUI Icons
import {
  Person as User,
  Settings,
  Language as Globe,
  DarkMode as Moon,
  LightMode as Sun,
  ExitToApp as LogOut
} from '@mui/icons-material'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useApiStatus } from '@/hooks/useApiStatus'
import { useSettings } from '@core/hooks/useSettings'

const SidebarFooter = () => {
  const theme = useTheme()
  const router = useRouter()
  const { data: session } = useSession()
  const { isCollapsed, isHovered, isBreakpointReached } = useVerticalNav()
  const { status: apiStatus } = useApiStatus()
  const { setMode } = useColorScheme()
  const { settings, updateSettings } = useSettings()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const open = Boolean(anchorEl)

  // Determine if sidebar is expanded
  const isExpanded = !isCollapsed || (isCollapsed && isHovered) || isBreakpointReached

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleProfileClick = () => {
    router.push('/ru/settings/profile')
    handleClose()
  }

  const handleLogout = async () => {
    try {
      // Если это демо пользователь, сбрасываем демо данные
      if (session?.user?.email === 'demo@demo.com') {
        try {
          await fetch('/api/demo/reset', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          })
        } catch (error) {
          console.error('Ошибка при сбросе демо данных:', error)
        }
      }

      await signOut({
        callbackUrl: `${window.location.origin}/ru/login`,
        redirect: true
      })
      handleClose()
    } catch (error) {
      console.error('Ошибка при выходе из аккаунта:', error)
      handleClose()
    }
  }

  const handleThemeToggle = () => {
    const currentMode = settings.mode || 'light'
    let newMode: 'light' | 'dark' | 'system'

    if (currentMode === 'light') {
      newMode = 'dark'
    } else if (currentMode === 'dark') {
      newMode = 'light'
    } else {
      // system mode - toggle to opposite of current actual mode
      newMode = theme.palette.mode === 'dark' ? 'light' : 'dark'
    }

    // Update settings using the proper context
    updateSettings({ mode: newMode })

    // Also update MUI color scheme
    setMode(newMode)
    handleClose()
  }

  const getApiStatusConfig = () => {
    if (apiStatus === 'connected') {
      return {
        color: '#4ade80',
        text: 'API: Подключено',
        tooltip: 'Соединение с API активно',
        pulse: false
      }
    } else {
      return {
        color: '#fbbf24',
        text: 'API: Автономно',
        tooltip: 'Работа в автономном режиме',
        pulse: true
      }
    }
  }

  const statusConfig = getApiStatusConfig()

  if (!session?.user) {
    return null
  }

  const user = session.user
  const userName = user.name || user.email?.split('@')[0] || 'Пользователь'

  // Check if user has role property, otherwise default to 'Пользователь'
  const userRole = (user as any).role === 'administrator' ? 'Администратор' : 'Демо пользователь'

  const getThemeIcon = () => {
    const currentMode = settings.mode || 'light'

    if (currentMode === 'dark' || theme.palette.mode === 'dark') {
      return Sun // Show sun to indicate "switch to light"
    } else {
      return Moon // Show moon to indicate "switch to dark"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        marginTop: 'auto',
        padding: '12px',
        zIndex: 10,
      }}
    >
      <AnimatePresence mode="wait">
        {isExpanded ? (
          // Expanded layout - Modern Card Design
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              duration: 0.25,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            <Card
              elevation={3}
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 3,
                overflow: 'visible',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                }
              }}
            >
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer'
                  }}
                  onClick={handleClick}
                                 >
                   {/* Увеличенный аватар с индикатором статуса */}
                   <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          backgroundColor: '#4ade80',
                          border: `3px solid ${theme.palette.background.paper}`,
                          boxShadow: `0 0 0 2px ${alpha('#4ade80', 0.3)}`
                        }}
                      />
                    }
                  >
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        '&:hover': {
                          transform: 'scale(1.05)',
                          borderColor: alpha(theme.palette.primary.main, 0.4),
                          boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.3)}`
                        }
                      }}
                    >
                      {userName.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>

                  {/* Информация пользователя */}
                  <Box sx={{ textAlign: 'center', width: '100%' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: theme.palette.text.primary,
                        lineHeight: 1.3,
                        mb: 0.5,
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
                      }}
                    >
                      {userName}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.875rem',
                        color: alpha(theme.palette.text.secondary, 0.8),
                        fontWeight: 500,
                        mb: 1.5
                      }}
                    >
                      {userRole}
                    </Typography>

                    {/* Статус пользователя */}
                    <Chip
                      label="В сети"
                      size="small"
                      sx={{
                        backgroundColor: alpha('#4ade80', 0.15),
                        color: '#4ade80',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        border: `1px solid ${alpha('#4ade80', 0.3)}`,
                        mb: 2
                      }}
                    />

                    {/* Разделитель */}
                    <Divider sx={{ mb: 2, opacity: 0.6 }} />

                    {/* Статус API с Tooltip */}
                    <Tooltip title={statusConfig.tooltip} placement="top">
                      <Chip
                        label={statusConfig.text}
                        size="small"
                        icon={
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: statusConfig.color,
                              animation: statusConfig.pulse ? 'pulse 2s infinite' : 'none'
                            }}
                          />
                        }
                        sx={{
                          backgroundColor: alpha(statusConfig.color, 0.15),
                          color: statusConfig.color,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          border: `1px solid ${alpha(statusConfig.color, 0.3)}`,
                          '& .MuiChip-icon': {
                            marginLeft: 1
                          }
                        }}
                      />
                    </Tooltip>

                    {/* Стрелка вниз */}
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                      <ChevronDown
                        size={16}
                        style={{
                          color: alpha(theme.palette.text.secondary, 0.6),
                          transition: 'transform 0.2s ease',
                          transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          // Collapsed layout
                     <motion.div
             key="collapsed"
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             transition={{
               duration: 0.25,
               ease: [0.4, 0, 0.2, 1]
             }}
             style={{
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
               padding: '12px',
               position: 'relative'
             }}
           >
             <Paper
               elevation={0}
               sx={{
                 backgroundColor: alpha(theme.palette.background.paper, 0.95),
                 backdropFilter: 'blur(20px)',
                 border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                 borderRadius: '16px',
                 padding: '12px',
                 position: 'relative',
                 display: 'flex',
                 justifyContent: 'center',
                 alignItems: 'center'
               }}
             >
               {/* User Avatar */}
               <Tooltip title={`${userName} (${userRole})`} placement="right">
                 <Avatar
                   onClick={handleClick}
                   sx={{
                     width: 42,
                     height: 42,
                     background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                     border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                     fontSize: '1rem',
                     fontWeight: 600,
                     cursor: 'pointer',
                     transition: 'all 0.2s ease',
                     '&:hover': {
                       transform: 'scale(1.05)',
                       boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                     }
                   }}
                 >
                   {userName.charAt(0).toUpperCase()}
                 </Avatar>
               </Tooltip>

               {/* API status indicator */}
               <motion.div
                 animate={statusConfig.pulse ? {
                   scale: [1, 1.3, 1],
                   opacity: [0.6, 1, 0.6],
                 } : {}}
                 transition={{
                   duration: 2,
                   repeat: statusConfig.pulse ? Infinity : 0,
                   ease: "easeInOut"
                 }}
                 style={{
                   position: 'absolute',
                   top: 8,
                   right: 8,
                   width: 8,
                   height: 8,
                   borderRadius: '50%',
                   backgroundColor: statusConfig.color,
                   border: `2px solid ${theme.palette.background.paper}`,
                   boxShadow: `0 0 8px ${alpha(statusConfig.color, 0.4)}`,
                   zIndex: 1,
                 }}
               />
             </Paper>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown меню с дополнительными действиями */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 220,
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: 3,
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              '& .MuiMenuItem-root': {
                borderRadius: 1.5,
                mx: 1,
                my: 0.5,
                fontSize: '0.875rem',
                fontWeight: 500,
                py: 1.5,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  transform: 'translateX(4px)'
                },
                transition: 'all 0.2s ease'
              }
            }
          }
        }}
      >
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <User />
          </ListItemIcon>
          <ListItemText primary="Профиль" />
        </MenuItem>

        <MenuItem onClick={handleClose}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Настройки" />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={handleClose}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Globe />
          </ListItemIcon>
          <ListItemText primary="Язык" />
        </MenuItem>

        <MenuItem onClick={handleThemeToggle}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            {React.createElement(getThemeIcon())}
          </ListItemIcon>
          <ListItemText primary="Переключить тему" />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem
          onClick={handleLogout}
          sx={{
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.08) + ' !important',
              color: theme.palette.error.main
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
            <LogOut />
          </ListItemIcon>
          <ListItemText primary="Выйти" />
        </MenuItem>
      </Menu>

      {/* CSS для анимации пульса */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </motion.div>
  )
}

export default SidebarFooter
