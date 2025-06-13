'use client'

import { Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'

type StatusType = 'online' | 'offline' | 'away' | 'api-connected' | 'api-disconnected' | 'api-autonomous'

interface StatusBadgeProps {
  status: StatusType
  label?: string
  size?: 'small' | 'medium'
}

const StatusBadge = ({ status, label, size = 'small' }: StatusBadgeProps) => {
  const theme = useTheme()

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-700',
          label: label || 'В сети',
          color: '#10B981'
        }

      case 'api-connected':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: label || 'API: Подключено',
          color: '#16A34A'
        }

      case 'api-autonomous':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          label: label || 'API: Автономно',
          color: '#D97706'
        }

      case 'api-disconnected':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: label || 'API: Отключено',
          color: '#DC2626'
        }

      case 'away':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          label: label || 'Отошел',
          color: '#D97706'
        }

      case 'offline':
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          label: label || 'Не в сети',
          color: '#6B7280'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        backgroundColor: theme.palette.mode === 'light'
          ? `${config.color}1A` // 10% opacity
          : `${config.color}20`, // 12% opacity for dark mode
        color: config.color,
        border: `1px solid ${config.color}30`, // 18% opacity
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        fontFamily: 'var(--font-golos-text), Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        '&:hover': {
          backgroundColor: theme.palette.mode === 'light'
            ? `${config.color}25` // 15% opacity on hover
            : `${config.color}30`, // 18% opacity for dark mode
          transform: 'translateY(-1px)',
          boxShadow: `0 2px 8px ${config.color}20`
        },
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    />
  )
}

export default StatusBadge
