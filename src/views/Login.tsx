'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import {
  Box,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Link,
  Alert,
  useTheme
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff
} from '@mui/icons-material'

// Third-party Imports
import { signIn } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { email, object, minLength, string, pipe, nonEmpty } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'

// Component Imports
import BrandLogo from '@components/layout/shared/BrandLogo'

// Schema для валидации формы
const loginSchema = object({
  email: pipe(string(), nonEmpty('Введите email'), email('Введите корректный email')),
  password: pipe(string(), nonEmpty('Введите пароль'), minLength(6, 'Пароль должен содержать минимум 6 символов'))
})

type LoginFormData = InferInput<typeof loginSchema>

const Login = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [apiError, setApiError] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const theme = useTheme()

  const locale = params?.lang as string || 'ru'
  const redirectTo = searchParams?.get('redirectTo') ?? `/${locale}/dashboard`

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: valibotResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsLoading(true)
    setApiError('')

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      })

      if (result?.error) {
        setApiError('Неверные учетные данные')
      } else if (result?.ok) {
        router.push(redirectTo)
      }
    } catch (error) {
      console.error('Login error:', error)
      setApiError('Произошла ошибка при входе в систему')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #1B6EF3 0%, #3EB5EA 100%)',
        padding: 2,
        position: 'relative'
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          backdropFilter: 'blur(20px)',
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(30, 30, 30, 0.9)'
            : 'rgba(255, 255, 255, 0.95)',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 4,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 20px 40px rgba(0, 0, 0, 0.4)'
            : '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent sx={{ p: 6 }}>
          {/* Brand Logo */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4
            }}
          >
            <BrandLogo size="large" showText={true} />
          </Box>

          {/* Title */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)'
                  : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Добро пожаловать
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Войдите в свой аккаунт для продолжения
            </Typography>
          </Box>

          {/* Error Alert */}
          {apiError && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2
              }}
            >
              {apiError}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mb: 3 }}>
            {/* Email Field */}
            <Box sx={{ mb: 3 }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="email"
                    label="Email адрес"
                    placeholder="demo@demo.com"
                    autoComplete="email"
                    autoFocus
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlined sx={{ color: theme.palette.text.secondary }} />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.divider
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main
                        }
                      }
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: theme.palette.text.secondary,
                        fontWeight: 600
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '1rem',
                        fontWeight: 500
                      }
                    }}
                  />
                )}
              />
            </Box>

            {/* Password Field */}
            <Box sx={{ mb: 3 }}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type={isPasswordVisible ? 'text' : 'password'}
                    label="Пароль"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined sx={{ color: theme.palette.text.secondary }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            edge="end"
                            sx={{
                              color: theme.palette.text.secondary,
                              '&:hover': {
                                color: theme.palette.primary.main
                              }
                            }}
                          >
                            {isPasswordVisible ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.divider
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main
                        }
                      }
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: theme.palette.text.secondary,
                        fontWeight: 600
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '1rem',
                        fontWeight: 500
                      }
                    }}
                  />
                )}
              />
            </Box>

            {/* Submit Button */}
            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              loading={isLoading}
              loadingPosition="start"
              startIcon={isLoading ? undefined : <EmailOutlined />}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #1B6EF3 0%, #3EB5EA 100%)',
                border: 'none',
                boxShadow: '0 8px 32px rgba(27, 110, 243, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(27, 110, 243, 0.4)'
                },
                '&:active': {
                  transform: 'translateY(0px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {isLoading ? 'Вход в систему...' : 'Войти в аккаунт'}
            </LoadingButton>
          </Box>

          {/* Links */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 4
            }}
          >
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault()
                console.log('Forgot password clicked')
              }}
              sx={{
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                '&:hover': {
                  color: theme.palette.primary.main,
                  textDecoration: 'underline'
                },
                transition: 'color 0.2s ease'
              }}
            >
              Забыли пароль?
            </Link>

            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault()
                console.log('Register clicked')
              }}
              sx={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'underline'
                },
                transition: 'color 0.2s ease'
              }}
            >
              Создать аккаунт
            </Link>
          </Box>

          {/* Test Data Alert */}
          <Alert
            severity="info"
            sx={{
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(29, 78, 216, 0.1)'
                : 'rgba(29, 78, 216, 0.05)',
              border: `1px solid ${theme.palette.primary.main}`,
              '& .MuiAlert-icon': {
                color: theme.palette.primary.main
              }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Тестовые данные для входа
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 1
              }}
            >
              <Box
                component="span"
                sx={{
                  fontFamily: 'monospace',
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(29, 78, 216, 0.2)'
                    : 'rgba(29, 78, 216, 0.1)',
                  color: theme.palette.primary.main,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                demo@demo.com
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  display: { xs: 'none', sm: 'inline' }
                }}
              >
                /
              </Typography>
              <Box
                component="span"
                sx={{
                  fontFamily: 'monospace',
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(76, 175, 80, 0.2)'
                    : 'rgba(76, 175, 80, 0.1)',
                  color: theme.palette.success.main,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                demo123
              </Box>
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                display: 'block',
                mt: 1,
                fontStyle: 'italic'
              }}
            >
              Демо пользователь
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Login
