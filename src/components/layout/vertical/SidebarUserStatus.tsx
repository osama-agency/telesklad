'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import {
  Box,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Chip,
  Tooltip,
  Card,
  CardContent
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'

// Third-party Imports
import { motion } from 'framer-motion'
import {
  ChevronDown
} from 'lucide-react'

// MUI Icons
import {
  Person as User,
  Settings,
  Language as Globe,
  DarkMode as Moon,
  ExitToApp as LogOut
} from '@mui/icons-material'

// Hook Imports
// import useVerticalNav from '@menu/hooks/useVerticalNav'

type SidebarUserStatusProps = {
  avatar?: string
  name?: string
  status?: 'online' | 'offline' | 'away'
  className?: string
}

const SidebarUserStatus = ({
  avatar = '/images/avatars/8.png',
  name = 'Демо пользователь',
  status = 'online',
  className
}: SidebarUserStatusProps) => {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const open = Boolean(anchorEl)

  // Демо данные
  const role = 'Администратор'
  const apiText = 'API: Подключено'
  const apiTooltip = 'Соединение с API активно'

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const getStatusColor = () => {
    switch (status) {
      case 'online': return '#4ade80'
      case 'away': return '#fbbf24'
      case 'offline': return '#6b7280'
      default: return '#4ade80'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'online': return 'В сети'
      case 'away': return 'Отошел'
      case 'offline': return 'Не в сети'
      default: return 'В сети'
    }
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      style={{
        padding: theme.spacing(2)
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
            boxShadow: theme.shadows[8]
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
                backgroundColor: getStatusColor(),
                    border: `3px solid ${theme.palette.background.paper}`,
                    boxShadow: `0 0 0 2px ${alpha(getStatusColor(), 0.3)}`
              }}
            />
          }
        >
          <Avatar
            src={avatar}
            alt={name}
            sx={{
                  width: 64,
                  height: 64,
                  border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
              '&:hover': {
                transform: 'scale(1.05)',
                    borderColor: alpha(theme.palette.primary.main, 0.4),
                    boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.3)}`
              }
            }}
          />
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
                {name}
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
                {role}
              </Typography>

              {/* Статус пользователя */}
              <Chip
                label={getStatusText()}
                size="small"
                sx={{
                  backgroundColor: alpha(getStatusColor(), 0.15),
                  color: getStatusColor(),
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: `1px solid ${alpha(getStatusColor(), 0.3)}`,
                  mb: 2
                }}
              />

              {/* Разделитель */}
              <Divider sx={{ mb: 2, opacity: 0.6 }} />

              {/* Статус API с Tooltip */}
              <Tooltip title={apiTooltip} placement="top">
                <Chip
                  label={apiText}
              size="small"
                  icon={
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#4ade80',
                        animation: 'pulse 2s infinite'
                      }}
                    />
                  }
              sx={{
                    backgroundColor: alpha('#4ade80', 0.15),
                    color: '#4ade80',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    border: `1px solid ${alpha('#4ade80', 0.3)}`,
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
                    transition: 'transform 0.2s ease'
                  }}
                />
              </Box>
            </Box>
      </Box>
        </CardContent>
      </Card>

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
        <MenuItem onClick={handleClose}>
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

        <MenuItem onClick={handleClose}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Moon />
          </ListItemIcon>
          <ListItemText primary="Переключить тему" />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem
          onClick={handleClose}
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

export default SidebarUserStatus
