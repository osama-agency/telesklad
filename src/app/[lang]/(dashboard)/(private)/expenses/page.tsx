'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import InputAdornment from '@mui/material/InputAdornment'
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import Checkbox from '@mui/material/Checkbox'
import Tooltip from '@mui/material/Tooltip'
import { alpha, useTheme } from '@mui/material/styles'

// Icons
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material'

// Third-party Imports
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { ru } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

// Store Imports
import { useDateRangeStore } from '@/store/dateRangeStore'

// Types
interface Expense {
  id: string
  date: string
  category: 'Реклама' | 'Логистика' | 'ЗП Курьеру' | 'Закупка товаров'
  description: string
  amount: number
}

interface NewExpense {
  date: Date | null
  category: string
  description: string
  amount: string
}

const ExpensesPage = () => {
  const theme = useTheme()

  // States
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [totalCount, setTotalCount] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [newExpense, setNewExpense] = useState<NewExpense>({
    date: new Date(),
    category: '',
    description: '',
    amount: ''
  })
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)

  const { range } = useDateRangeStore()

  // Категории расходов с улучшенным дизайном
  const categories = [
    {
      value: 'Реклама',
      label: 'Реклама',
      color: { bg: '#fef3c7', text: '#d97706', border: '#fbbf24' }
    },
    {
      value: 'Логистика',
      label: 'Логистика',
      color: { bg: '#dbeafe', text: '#2563eb', border: '#3b82f6' }
    },
    {
      value: 'ЗП Курьеру',
      label: 'ЗП Курьеру',
      color: { bg: '#dcfce7', text: '#16a34a', border: '#22c55e' }
    },
    {
      value: 'Закупка товаров',
      label: 'Закупка товаров',
      color: { bg: '#fce7f3', text: '#be185d', border: '#ec4899' }
    }
  ]

  // Загрузка данных
  const fetchExpenses = async () => {
    try {
      setLoading(true)

      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        ...(range.start && { dateFrom: range.start.toISOString().split('T')[0] }),
        ...(range.end && { dateTo: range.end.toISOString().split('T')[0] })
      })

      const response = await fetch(`/api/expenses?${queryParams}`)
      const data = await response.json()

      if (data.success) {
        // Маппим данные с сервера, преобразуя comment в description
        const mappedExpenses = (data.data.expenses || []).map((expense: any) => ({
          ...expense,
          description: expense.comment || '',
          amount: parseFloat(expense.amount) || 0
        }))
        console.log('Mapped expenses:', mappedExpenses)
        setExpenses(mappedExpenses)
        setTotalCount(data.data.pagination?.totalItems || data.data.total || 0)
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
      showSnackbar('Ошибка загрузки расходов', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [page, rowsPerPage, range.start, range.end])

  // Итоги за период
  const totals = useMemo(() => {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalCount = expenses.length

    return { totalAmount, totalCount }
  }, [expenses])

  // Обработчики пагинации
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Сохранение нового расхода
  const handleSaveExpense = async () => {
    if (!newExpense.date || !newExpense.category || !newExpense.amount) {
      showSnackbar('Заполните все обязательные поля', 'error')
      return
    }

    try {
      setSaving(true)

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newExpense.date.toISOString().split('T')[0],
          category: newExpense.category,
          comment: newExpense.description,
          amount: parseFloat(newExpense.amount)
        })
      })

      if (!response.ok) throw new Error('Failed to create expense')

      showSnackbar('💸 Расход добавлен', 'success')
      setModalOpen(false)
      setNewExpense({
        date: new Date(),
        category: '',
        description: '',
        amount: ''
      })
      fetchExpenses()

    } catch (error) {
      console.error('Error saving expense:', error)
      showSnackbar('Ошибка при сохранении расхода', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Показать уведомление
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  // Получить стили категории
  const getCategoryStyles = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat?.color || { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' }
  }

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Обработка выбора строк
  const handleSelectRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedRows.length === expenses.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(expenses.map(expense => expense.id))
    }
  }

  // Открытие модалки редактирования
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setEditModalOpen(true)
  }

  // Сохранение изменений расхода
  const handleUpdateExpense = async () => {
    if (!editingExpense || !editingExpense.category || !editingExpense.amount) {
      showSnackbar('Заполните все обязательные поля', 'error')
      return
    }

    try {
      setSaving(true)

      const response = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editingExpense.date,
          category: editingExpense.category,
          comment: editingExpense.description,
          amount: editingExpense.amount
        })
      })

      if (!response.ok) throw new Error('Failed to update expense')

      showSnackbar('✏️ Расход обновлен', 'success')
      setEditModalOpen(false)
      setEditingExpense(null)
      fetchExpenses()

    } catch (error) {
      console.error('Error updating expense:', error)
      showSnackbar('Ошибка при обновлении расхода', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Открытие диалога подтверждения удаления
  const handleDeleteConfirm = (expense: Expense) => {
    setExpenseToDelete(expense)
    setDeleteConfirmOpen(true)
  }

  // Удаление расхода
  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return

    try {
      const response = await fetch(`/api/expenses/${expenseToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete expense')

      showSnackbar('🗑️ Расход удален', 'success')
      setDeleteConfirmOpen(false)
      setExpenseToDelete(null)
      fetchExpenses()

    } catch (error) {
      console.error('Error deleting expense:', error)
      showSnackbar('Ошибка при удалении расхода', 'error')
    }
  }

  return (
    <>
      {/* Современный заголовок с action */}
      <Box sx={{
        mb: 4,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        gap: 2
      }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              mb: 0.5,
              background: 'linear-gradient(135deg, #1B6EF3 0%, #3EB5EA 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}
          >
            Расходы
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            Управление финансовыми расходами и затратами
          </Typography>
        </Box>

        {/* Кнопка добавления в заголовке */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1.5,
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'none',
            minWidth: 160,
            background: 'linear-gradient(135deg, #1B6EF3 0%, #3EB5EA 100%)',
            boxShadow: '0 4px 12px rgba(27, 110, 243, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #134EC0 0%, #1B6EF3 100%)',
              boxShadow: '0 6px 16px rgba(27, 110, 243, 0.4)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Новый расход
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Улучшенные карточки статистики */}
        <Grid size={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                  },
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
                  }
                }}>
                  <CardHeader
                    avatar={
                      <Box sx={{
                        p: 2,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%)',
                        border: '1px solid rgba(220, 38, 38, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <MoneyIcon sx={{ color: '#dc2626', fontSize: 28 }} />
                      </Box>
                    }
                    title={
                      <Typography variant="h3" sx={{
                        fontWeight: 700,
                        mb: 0.5,
                        color: '#dc2626',
                        fontSize: '2rem'
                      }}>
                        {totals.totalAmount.toLocaleString('ru-RU')} ₽
                      </Typography>
                    }
                    subheader={
                      <Typography variant="body2" color="text.secondary" sx={{
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        Общая сумма расходов
                      </Typography>
                    }
                    sx={{ pb: 3, pt: 3 }}
                  />
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                  },
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: 'linear-gradient(135deg, #1B6EF3 0%, #3EB5EA 100%)'
                  }
                }}>
                  <CardHeader
                    avatar={
                      <Box sx={{
                        p: 2,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, rgba(27, 110, 243, 0.1) 0%, rgba(62, 181, 234, 0.1) 100%)',
                        border: '1px solid rgba(27, 110, 243, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ReceiptIcon sx={{ color: '#1B6EF3', fontSize: 28 }} />
                      </Box>
                    }
                    title={
                      <Typography variant="h3" sx={{
                        fontWeight: 700,
                        mb: 0.5,
                        color: '#1B6EF3',
                        fontSize: '2rem'
                      }}>
                        {totals.totalCount}
                      </Typography>
                    }
                    subheader={
                      <Typography variant="body2" color="text.secondary" sx={{
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        Количество записей
                      </Typography>
                    }
                    sx={{ pb: 3, pt: 3 }}
                  />
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        </Grid>

        {/* Таблица расходов */}
        <Grid size={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card sx={{
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              borderRadius: 3
            }}>
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                        '& .MuiTableCell-head': {
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          letterSpacing: '0.01em',
                          color: 'text.primary',
                          borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`
                        }
                      }}>
                        <TableCell sx={{ width: 48 }}>
                          <Checkbox
                            checked={selectedRows.length === expenses.length && expenses.length > 0}
                            indeterminate={selectedRows.length > 0 && selectedRows.length < expenses.length}
                            onChange={handleSelectAll}
                            size="small"
                            sx={{
                              color: alpha('#1B6EF3', 0.6),
                              '&.Mui-checked': { color: '#1B6EF3' },
                              '&.MuiCheckbox-indeterminate': { color: '#1B6EF3' }
                            }}
                          />
                        </TableCell>
                        <TableCell>Дата</TableCell>
                        <TableCell>Категория</TableCell>
                        <TableCell>Описание</TableCell>
                        <TableCell align="right">Сумма</TableCell>
                        <TableCell align="center" sx={{ width: 120 }}>Действия</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <AnimatePresence>
                        {loading ? (
                          Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={index}>
                              <TableCell><Skeleton width={24} height={24} /></TableCell>
                              <TableCell><Skeleton animation="wave" width={80} /></TableCell>
                              <TableCell><Skeleton animation="wave" width={100} /></TableCell>
                              <TableCell><Skeleton animation="wave" width={200} /></TableCell>
                              <TableCell><Skeleton animation="wave" width={80} /></TableCell>
                              <TableCell><Skeleton animation="wave" width={80} /></TableCell>
                            </TableRow>
                          ))
                        ) : expenses.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                                  Нет данных о расходах
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  За выбранный период расходы не найдены
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ) : (
                          expenses.map((expense, index) => {
                            const categoryStyles = getCategoryStyles(expense.category)
                            const isSelected = selectedRows.includes(expense.id)
                            const isHovered = hoveredRow === expense.id

                            return (
                              <motion.tr
                                key={expense.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                style={{
                                  backgroundColor: isSelected
                                    ? alpha(theme.palette.primary.main, 0.08)
                                    : isHovered
                                    ? alpha(theme.palette.action.hover, 0.4)
                                    : 'transparent'
                                }}
                                onMouseEnter={() => setHoveredRow(expense.id)}
                                onMouseLeave={() => setHoveredRow(null)}
                              >
                                <TableCell>
                                  <Checkbox
                                    checked={isSelected}
                                    onChange={() => handleSelectRow(expense.id)}
                                    size="small"
                                    sx={{
                                      color: alpha('#1B6EF3', 0.6),
                                      '&.Mui-checked': { color: '#1B6EF3' }
                                    }}
                                  />
                                </TableCell>

                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: '0.875rem',
                                      color: 'text.secondary',
                                      fontFamily: 'monospace'
                                    }}
                                  >
                                    {formatDate(expense.date)}
                                  </Typography>
                                </TableCell>

                                <TableCell>
                                  <Chip
                                    label={expense.category}
                                    size="small"
                                    sx={{
                                      bgcolor: categoryStyles.bg,
                                      color: categoryStyles.text,
                                      border: `1px solid ${categoryStyles.border}20`,
                                      fontWeight: 500,
                                      fontSize: '0.75rem',
                                      '& .MuiChip-label': {
                                        px: 1
                                      }
                                    }}
                                  />
                                </TableCell>

                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      maxWidth: 240,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                    title={expense.description || '—'}
                                  >
                                    {expense.description || '—'}
                                  </Typography>
                                </TableCell>

                                <TableCell align="right">
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: '1.125rem',
                                      fontFamily: 'monospace'
                                    }}
                                  >
                                    {expense.amount.toLocaleString('ru-RU')} ₽
                                  </Typography>
                                </TableCell>

                                <TableCell align="center">
                                  <Box sx={{
                                    display: 'flex',
                                    gap: 0.5,
                                    justifyContent: 'center',
                                    opacity: isHovered ? 1 : 0.6,
                                    transition: 'opacity 0.2s ease'
                                  }}>
                                    <Tooltip title="Редактировать" placement="top">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleEditExpense(expense)}
                                        sx={{
                                          color: '#1B6EF3',
                                          bgcolor: alpha('#1B6EF3', 0.1),
                                          border: `1px solid ${alpha('#1B6EF3', 0.2)}`,
                                          borderRadius: 2,
                                          '&:hover': {
                                            bgcolor: alpha('#1B6EF3', 0.15),
                                            border: `1px solid ${alpha('#1B6EF3', 0.3)}`,
                                            transform: 'scale(1.05)'
                                          },
                                          transition: 'all 0.2s ease'
                                        }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Удалить" placement="top">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleDeleteConfirm(expense)}
                                        sx={{
                                          color: '#dc2626',
                                          bgcolor: alpha('#dc2626', 0.1),
                                          border: `1px solid ${alpha('#dc2626', 0.2)}`,
                                          borderRadius: 2,
                                          '&:hover': {
                                            bgcolor: alpha('#dc2626', 0.15),
                                            border: `1px solid ${alpha('#dc2626', 0.3)}`,
                                            transform: 'scale(1.05)'
                                          },
                                          transition: 'all 0.2s ease'
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </TableCell>
                              </motion.tr>
                            )
                          })
                        )}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  component="div"
                  count={totalCount}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Строк на странице:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
                  sx={{
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    '& .MuiTablePagination-toolbar': {
                      px: 3,
                      py: 2
                    },
                    '& .MuiTablePagination-actions': {
                      '& .MuiIconButton-root': {
                        color: '#1B6EF3',
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: alpha('#1B6EF3', 0.1)
                        },
                        '&.Mui-disabled': {
                          color: alpha('#1B6EF3', 0.3)
                        }
                      }
                    },
                    '& .MuiTablePagination-select': {
                      color: '#1B6EF3',
                      fontWeight: 500
                    }
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Модалка добавления расхода */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 48px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 600,
          fontSize: '1.25rem',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          Добавить расход
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
              <DatePicker
                label="Дата"
                value={newExpense.date}
                onChange={(newValue) => setNewExpense({ ...newExpense, date: newValue })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            </LocalizationProvider>

            <FormControl fullWidth required>
              <InputLabel>Категория</InputLabel>
              <Select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                label="Категория"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Описание"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="Опишите расход..."
            />

            <TextField
              label="Сумма"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value.replace(/[^0-9.]/g, '') })}
              fullWidth
              required
              InputProps={{
                endAdornment: <InputAdornment position="end">₽</InputAdornment>,
              }}
              placeholder="0.00"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setModalOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSaveExpense}
            variant="contained"
            disabled={saving}
            sx={{
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(135deg, #1B6EF3 0%, #3EB5EA 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #134EC0 0%, #1B6EF3 100%)'
              }
            }}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модалка редактирования расхода */}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 48px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 600,
          fontSize: '1.25rem',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          Редактировать расход
        </DialogTitle>
        <DialogContent>
          {editingExpense && (
            <Box sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                <DatePicker
                  label="Дата"
                  value={new Date(editingExpense.date)}
                  onChange={(newValue) => setEditingExpense({
                    ...editingExpense,
                    date: newValue?.toISOString().split('T')[0] || editingExpense.date
                  })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>

              <FormControl fullWidth required>
                <InputLabel>Категория</InputLabel>
                <Select
                  value={editingExpense.category}
                  onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value as any })}
                  label="Категория"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Описание"
                value={editingExpense.description || ''}
                onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                fullWidth
                multiline
                rows={2}
                placeholder="Опишите расход..."
              />

              <TextField
                label="Сумма"
                value={editingExpense.amount}
                onChange={(e) => setEditingExpense({
                  ...editingExpense,
                  amount: parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0
                })}
                fullWidth
                required
                InputProps={{
                  endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                }}
                placeholder="0.00"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setEditModalOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleUpdateExpense}
            variant="contained"
            disabled={saving}
            sx={{
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1976D2 0%, #0288D1 100%)'
              }
            }}
          >
            {saving ? 'Сохранение...' : 'Обновить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
              : '0 32px 64px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(16px)',
            bgcolor: theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.95)
              : theme.palette.background.paper,
            border: theme.palette.mode === 'dark'
              ? `1px solid ${alpha(theme.palette.divider, 0.1)}`
              : 'none'
          }
        }}
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(8px)',
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(0,0,0,0.8)'
              : 'rgba(0,0,0,0.5)'
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 700,
          fontSize: '1.3rem',
          color: '#EF4444',
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.1 : 0.15)}`
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: alpha('#EF4444', 0.15),
            color: '#EF4444'
          }}>
            🗑️
          </Box>
          Подтвердите удаление
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography
            variant="body1"
            sx={{
              fontSize: '1rem',
              lineHeight: 1.6,
              color: theme.palette.text.primary,
              mb: 2
            }}
          >
            Вы уверены, что хотите удалить этот расход?
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              mb: 2.5,
              fontSize: '0.875rem'
            }}
          >
            Это действие нельзя будет отменить.
          </Typography>
          {expenseToDelete && (
            <Box sx={{
              mt: 2,
              p: 3,
              bgcolor: theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.default, 0.6)
                : alpha(theme.palette.grey[50], 0.8),
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.1 : 0.15)}`,
              backdropFilter: 'blur(10px)'
            }}>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 1.5,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Детали расхода:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Категория:
                  </Typography>
                  <Box sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    bgcolor: getCategoryStyles(expenseToDelete.category).bg,
                    border: `1px solid ${getCategoryStyles(expenseToDelete.category).border}`
                  }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: getCategoryStyles(expenseToDelete.category).text,
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    >
                      {expenseToDelete.category}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Сумма:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: '#EF4444'
                    }}
                  >
                    {expenseToDelete.amount.toLocaleString('ru-RU')} ₽
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Дата:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: theme.palette.text.primary
                    }}
                  >
                    {formatDate(expenseToDelete.date)}
                  </Typography>
                </Box>
                {expenseToDelete.description && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Описание:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontStyle: 'italic',
                        color: theme.palette.text.primary,
                        bgcolor: theme.palette.mode === 'dark'
                          ? alpha(theme.palette.background.paper, 0.5)
                          : alpha(theme.palette.grey[100], 0.8),
                        p: 1.5,
                        borderRadius: 2,
                        fontSize: '0.875rem'
                      }}
                    >
                      {expenseToDelete.description}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              borderColor: theme.palette.mode === 'dark'
                ? alpha(theme.palette.divider, 0.3)
                : theme.palette.divider,
              color: theme.palette.text.secondary,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                color: theme.palette.primary.main,
                transform: 'translateY(-1px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 4px 16px rgba(0,0,0,0.3)'
                  : '0 4px 16px rgba(0,0,0,0.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleDeleteExpense}
            variant="contained"
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 24px rgba(239, 68, 68, 0.4)'
                : '0 8px 24px rgba(239, 68, 68, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 12px 32px rgba(239, 68, 68, 0.5)'
                  : '0 12px 32px rgba(239, 68, 68, 0.4)',
                transform: 'translateY(-2px)'
              },
              '&:active': {
                transform: 'translateY(0px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar для уведомлений */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: 2,
            fontWeight: 500
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ExpensesPage
