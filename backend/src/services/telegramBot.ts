import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8159006212:AAEjYn-bU-Nh89crlue9GUJKuv6pV4Z986M'
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-4729817036'
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

// Статусы заказов и их переходы
export const ORDER_STATUSES = {
  pending: {
    name: 'Ожидает подтверждения',
    emoji: '🔄',
    color: '#FFA726',
    nextStatuses: ['confirmed', 'cancelled']
  },
  confirmed: {
    name: 'Подтверждено (собирается)',
    emoji: '✅',
    color: '#66BB6A',
    nextStatuses: ['ready_for_payment', 'cancelled']
  },
  ready_for_payment: {
    name: 'Готов к оплате',
    emoji: '💰',
    color: '#42A5F5',
    nextStatuses: ['paid', 'cancelled']
  },
  paid: {
    name: 'Оплачено',
    emoji: '💳',
    color: '#26A69A',
    nextStatuses: ['in_transit', 'cancelled']
  },
  in_transit: {
    name: 'В пути',
    emoji: '🚚',
    color: '#AB47BC',
    nextStatuses: ['delivering']
  },
  delivering: {
    name: 'Доставляется',
    emoji: '🚛',
    color: '#FF7043',
    nextStatuses: ['received']
  },
  received: {
    name: 'Получено',
    emoji: '📦',
    color: '#4CAF50',
    nextStatuses: []
  },
  cancelled: {
    name: 'Отменено',
    emoji: '❌',
    color: '#F44336',
    nextStatuses: []
  }
} as const

export type OrderStatus = keyof typeof ORDER_STATUSES

// Интерфейс для заказа
interface OrderData {
  id: string
  sequenceId: number
  status: OrderStatus
  totalCost: number
  isUrgent: boolean
  supplier?: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  createdAt: Date
}

// Форматирование сообщения о заказе
function formatOrderMessage(order: OrderData): string {
  const statusInfo = ORDER_STATUSES[order.status]
  const urgentFlag = order.isUrgent ? '🔥 СРОЧНЫЙ ' : ''

  const itemsList = order.items.map(item =>
    `• ${item.name} — ${item.quantity} шт. × ${item.price.toFixed(2)} ₺ = ${item.total.toFixed(2)} ₺`
  ).join('\n')

  const timestamp = order.createdAt.toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return `${urgentFlag}📦 *ЗАКУПКА #${order.sequenceId}*

${statusInfo.emoji} *Статус:* ${statusInfo.name}
💰 *Сумма:* ${order.totalCost.toFixed(2)} ₺
📋 *Товаров:* ${order.items.length} поз.

*СОСТАВ ЗАКУПКИ:*
${itemsList}

⏰ *Создано:* ${timestamp}`
}

// Создание кнопок для редактирования заказа (без WebApp)
function createEditOrderButtons(orderId: string, currentStatus: OrderStatus, sequenceId: number, messageId?: number, chatId?: string): any {
  // Всегда показываем кнопки, кроме отмененных заказов
  if (currentStatus === 'cancelled') {
    return null
  }

  // WebApp URL для ручного перехода
  const webAppUrl = process.env.WEBAPP_URL || 'https://dsgrating.ru/telegram-webapp'
  const editUrl = `${webAppUrl}/edit-order.html?orderId=${orderId}&currentStatus=${currentStatus}&sequenceId=${sequenceId}&messageId=${messageId || ''}&chatId=${chatId || ''}&backendUrl=${process.env.BACKEND_URL || 'https://dsgrating.ru'}`

  // Добавляем кнопки быстрого изменения статуса для критических переходов
  const quickActions = []

  if (currentStatus === 'pending') {
    quickActions.push([
      { text: "✅ Подтвердить", callback_data: `status_${orderId}_confirmed` },
      { text: "❌ Отменить", callback_data: `status_${orderId}_cancelled` }
    ])
  } else if (currentStatus === 'ready_for_payment') {
    quickActions.push([
      { text: "💳 Оплачено", callback_data: `status_${orderId}_paid` }
    ])
  } else if (currentStatus === 'delivering') {
    quickActions.push([
      { text: "📦 Получено", callback_data: `status_${orderId}_received` }
    ])
  }

  // Добавляем кнопку с ссылкой на WebApp
  quickActions.push([
    { text: "✏️ Редактировать заказ", url: editUrl }
  ])

  return { inline_keyboard: quickActions }
}

// Отправка нового сообщения о заказе
export async function sendOrderNotification(order: OrderData): Promise<{ success: boolean; messageId?: number; error?: string }> {
  try {
    const message = formatOrderMessage(order)
    const keyboard = createEditOrderButtons(order.id, order.status, order.sequenceId)

    const requestBody: any = {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    }

    if (keyboard) {
      requestBody.reply_markup = keyboard
    }

    console.log('📤 Отправляю заказ в Telegram:', {
      orderId: order.id,
      sequenceId: order.sequenceId,
      status: order.status,
      hasButtons: !!keyboard
    })

    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    const data = await response.json() as any

    if (data.ok) {
      console.log('✅ Заказ отправлен в Telegram, message_id:', data.result.message_id)
      return { success: true, messageId: data.result.message_id }
    } else {
      console.error('❌ Ошибка Telegram API:', data)
      return { success: false, error: data.description || 'Unknown error' }
    }

  } catch (error) {
    console.error('❌ Ошибка отправки в Telegram:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Обновление существующего сообщения
export async function updateOrderMessage(
  chatId: string | number,
  messageId: number,
  order: OrderData
): Promise<{ success: boolean; error?: string }> {
  try {
    const message = formatOrderMessage(order)
    const keyboard = createEditOrderButtons(order.id, order.status, order.sequenceId, messageId, String(chatId))

    const requestBody: any = {
      chat_id: chatId,
      message_id: messageId,
      text: message,
      parse_mode: 'Markdown'
    }

    if (keyboard) {
      requestBody.reply_markup = keyboard
    }

    console.log('📝 Обновляю сообщение в Telegram:', {
      messageId,
      orderId: order.id,
      newStatus: order.status
    })

    const response = await fetch(`${TELEGRAM_API_URL}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    const data = await response.json() as any

    if (data.ok) {
      console.log('✅ Сообщение обновлено в Telegram')
      return { success: true }
    } else {
      console.error('❌ Ошибка обновления в Telegram:', data)
      return { success: false, error: data.description || 'Unknown error' }
    }

  } catch (error) {
    console.error('❌ Ошибка обновления сообщения:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Обработка нажатия кнопки (callback query)
export async function handleOrderStatusCallback(
  callbackQueryId: string,
  callbackData: string,
  messageId: number,
  chatId: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Обработка кнопки "Изменить статус"
    if (callbackData.startsWith('change_status_')) {
      const orderId = callbackData.replace('change_status_', '')
      return await handleChangeStatusMenu(callbackQueryId, orderId, messageId, chatId)
    }

    // Парсим callback_data: order_orderId_newStatus или status_orderId_newStatus
    const parts = callbackData.split('_')
    if (parts.length !== 3 || (parts[0] !== 'order' && parts[0] !== 'status')) {
      throw new Error('Invalid callback data format')
    }

    const orderId = parts[1]
    const newStatus = parts[2] as OrderStatus

    console.log('🔄 Обрабатываю изменение статуса:', {
      orderId,
      newStatus,
      messageId
    })

    // Проверяем валидность статуса
    if (!ORDER_STATUSES[newStatus]) {
      throw new Error(`Invalid status: ${newStatus}`)
    }

    // Обновляем статус в базе данных
    const updatedOrder = await prisma.purchase.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        statusUpdatedAt: new Date()
      } as any,
      include: {
        items: true
      }
    }) as any

    // Преобразуем данные для отправки
    const orderData: OrderData = {
      id: updatedOrder.id,
      sequenceId: updatedOrder.sequenceId,
      status: newStatus,
      totalCost: Number(updatedOrder.totalCost),
      isUrgent: updatedOrder.isUrgent,
      supplier: updatedOrder.supplier || undefined,
      items: updatedOrder.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.total)
      })),
      createdAt: updatedOrder.createdAt
    }

    // Обновляем сообщение в Telegram
    const updateResult = await updateOrderMessage(chatId, messageId, orderData)

    if (updateResult.success) {
      // Отвечаем на callback query
      await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: `✅ Статус изменен на "${ORDER_STATUSES[newStatus].name}"`,
          show_alert: false
        })
      })

      console.log('✅ Статус заказа успешно обновлен')
      return { success: true }
    } else {
      throw new Error(updateResult.error || 'Failed to update message')
    }

  } catch (error) {
    console.error('❌ Ошибка обработки callback:', error)

    // Отвечаем на callback query с ошибкой
    await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: `❌ Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`,
        show_alert: true
      })
    })

    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Получение информации о заказе из базы данных
export async function getOrderById(orderId: string): Promise<OrderData | null> {
  try {
    const order = await prisma.purchase.findUnique({
      where: { id: orderId },
      include: { items: true }
    }) as any

    if (!order) {
      return null
    }

    return {
      id: order.id,
      sequenceId: order.sequenceId,
      status: order.status as OrderStatus,
      totalCost: Number(order.totalCost),
      isUrgent: order.isUrgent,
      supplier: order.supplier || undefined,
      items: order.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.total)
      })),
      createdAt: order.createdAt
    }
  } catch (error) {
    console.error('❌ Ошибка получения заказа:', error)
    return null
  }
}

// Обработка меню изменения статуса
async function handleChangeStatusMenu(
  callbackQueryId: string,
  orderId: string,
  messageId: number,
  chatId: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Получаем заказ из базы данных
    const order = await getOrderById(orderId)
    if (!order) {
      throw new Error('Заказ не найден')
    }

    const currentStatusInfo = ORDER_STATUSES[order.status]
    const nextStatuses = currentStatusInfo.nextStatuses

    if (nextStatuses.length === 0) {
      // Отвечаем что нет доступных статусов
      await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: `ℹ️ Этот заказ находится в финальном состоянии (${currentStatusInfo.name})`,
          show_alert: true
        })
      })
      return { success: true }
    }

    // Создаем кнопки для доступных статусов
    const statusButtons = nextStatuses.map(status => {
      const statusInfo = ORDER_STATUSES[status]
      return {
        text: `${statusInfo.emoji} ${statusInfo.name}`,
        callback_data: `status_${orderId}_${status}`
      }
    })

    // Разбиваем кнопки по строкам (максимум 2 в строке)
    const keyboard = []
    for (let i = 0; i < statusButtons.length; i += 2) {
      keyboard.push(statusButtons.slice(i, i + 2))
    }

    // Добавляем кнопку "Отмена"
    keyboard.push([{
      text: "❌ Отмена",
      callback_data: `cancel_${orderId}`
    }])

    // Отправляем новое сообщение с выбором статуса
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🔄 *Изменить статус закупки #${order.sequenceId}*\n\n` +
              `📋 Текущий статус: ${currentStatusInfo.emoji} ${currentStatusInfo.name}\n\n` +
              `Выберите новый статус:`,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard }
      })
    })

    const data = await response.json() as any

    if (data.ok) {
      // Отвечаем на callback query
      await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: "Выберите новый статус ⬇️"
        })
      })

      console.log('✅ Меню изменения статуса отправлено')
      return { success: true }
    } else {
      throw new Error(data.description || 'Failed to send status menu')
    }

  } catch (error) {
    console.error('❌ Ошибка отправки меню статусов:', error)

    // Отвечаем на callback query с ошибкой
    await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: `❌ Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`,
        show_alert: true
      })
    })

    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Тестовая функция для отправки тестового заказа
export async function sendTestOrder(): Promise<{ success: boolean; error?: string }> {
  const testOrder: OrderData = {
    id: 'test_' + Date.now(),
    sequenceId: 999999,
    status: 'pending',
    totalCost: 1500.50,
    isUrgent: true,
    supplier: 'Тестовый поставщик',
    items: [
      { name: 'Тестовый товар 1', quantity: 5, price: 100, total: 500 },
      { name: 'Тестовый товар 2', quantity: 10, price: 100.05, total: 1000.50 }
    ],
    createdAt: new Date()
  }

  return await sendOrderNotification(testOrder)
}
