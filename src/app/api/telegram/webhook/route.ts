import { NextRequest } from 'next/server'

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8159006212:AAEjYn-bU-Nh89crlue9GUJKuv6pV4Z986M'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('📥 Получен webhook от Telegram:', JSON.stringify(body, null, 2))

    // Handle callback query (button press)
    if (body.callback_query) {
      const callbackQuery = body.callback_query
      const callbackData = callbackQuery.data
      const messageId = callbackQuery.message.message_id
      const chatId = callbackQuery.message.chat.id

      console.log('🔘 Обработка callback query:', {
        callbackData,
        messageId,
        chatId
      })

      // Parse callback data: order_orderId_newStatus
      if (callbackData.startsWith('order_')) {
        const parts = callbackData.split('_')
        if (parts.length === 3) {
          const orderId = parts[1]
          const newStatus = parts[2]

          console.log('🔄 Изменение статуса заказа:', {
            orderId,
            newStatus
          })

          try {
            // Обновляем статус заказа в базе данных через backend API
            const updateResponse = await fetch(`http://localhost:3011/api/purchases/${orderId}/status`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: newStatus })
            })

            if (updateResponse.ok) {
              const updateData = await updateResponse.json()
              console.log('✅ Статус заказа обновлен в БД:', updateData)

              // Получаем обновленные данные заказа
              const orderResponse = await fetch(`http://localhost:3011/api/purchases/${orderId}`)
              if (orderResponse.ok) {
                const orderData = await orderResponse.json()
                const order = orderData.data

                // Форматируем обновленное сообщение
                const statusEmojis: Record<string, string> = {
                  pending: '🔄',
                  confirmed: '✅',
                  ready_for_payment: '💰',
                  paid: '💳',
                  in_transit: '🚚',
                  delivering: '🚛',
                  received: '📦',
                  cancelled: '❌'
                }

                const statusNames: Record<string, string> = {
                  pending: 'Ожидает подтверждения',
                  confirmed: 'Подтверждено (собирается)',
                  ready_for_payment: 'Готов к оплате',
                  paid: 'Оплачено',
                  in_transit: 'В пути',
                  delivering: 'Доставляется',
                  received: 'Получено',
                  cancelled: 'Отменено'
                }

                const urgentFlag = order.isUrgent ? '🔥 СРОЧНЫЙ ' : ''
                const statusInfo = statusEmojis[newStatus] || '❓'
                const statusName = statusNames[newStatus] || newStatus

                const itemsList = order.items.map((item: any) =>
                  `• ${item.name} — ${item.quantity} шт. × ${Number(item.price).toFixed(2)} ₺ = ${Number(item.total).toFixed(2)} ₺`
                ).join('\n')

                const timestamp = new Date(order.createdAt).toLocaleString('ru-RU', {
                  timeZone: 'Europe/Moscow',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })

                const updatedText = `${urgentFlag}📋 *ЗАКАЗ #${order.sequenceId}*

${statusInfo} *Статус:* ${statusName}
💰 *Сумма:* ${Number(order.totalCost).toFixed(2)} ₺
📋 *Товаров:* ${order.items.length} поз.

*СОСТАВ ЗАКАЗА:*
${itemsList}

⏰ *Создан:* ${timestamp}`

                // Создаем новые кнопки в зависимости от статуса
                const nextStatusButtons: Record<string, string[]> = {
                  pending: ['confirmed', 'cancelled'],
                  confirmed: ['ready_for_payment', 'cancelled'],
                  ready_for_payment: ['paid', 'cancelled'],
                  paid: ['in_transit', 'cancelled'],
                  in_transit: ['delivering'],
                  delivering: ['received'],
                  received: [],
                  cancelled: []
                }

                const nextStatuses = nextStatusButtons[newStatus] || []
                const newButtons = nextStatuses.map(status => ({
                  text: `${statusEmojis[status]} ${statusNames[status]}`,
                  callback_data: `order_${orderId}_${status}`
                }))

                const editMessageBody: any = {
                  chat_id: chatId,
                  message_id: messageId,
                  text: updatedText,
                  parse_mode: 'Markdown'
                }

                if (newButtons.length > 0) {
                  // Разбиваем кнопки по строкам (максимум 2 кнопки в строке)
                  const keyboard = []
                  for (let i = 0; i < newButtons.length; i += 2) {
                    keyboard.push(newButtons.slice(i, i + 2))
                  }
                  editMessageBody.reply_markup = {
                    inline_keyboard: keyboard
                  }
                }

                // Обновляем сообщение в Telegram
                const editResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(editMessageBody)
                })

                const editData = await editResponse.json()
                console.log('📝 Результат обновления сообщения:', editData)

                // Отвечаем на callback query
                await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    callback_query_id: callbackQuery.id,
                    text: `✅ Статус изменен на "${statusName}"`,
                    show_alert: false
                  })
                })

              } else {
                throw new Error('Failed to fetch updated order data')
              }

            } else {
              const errorData = await updateResponse.json()
              throw new Error(`Failed to update order status: ${JSON.stringify(errorData)}`)
            }

          } catch (error) {
            console.error('❌ Ошибка обработки callback:', error)

            // Отвечаем на callback query с ошибкой
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                callback_query_id: callbackQuery.id,
                text: `❌ Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`,
                show_alert: true
              })
            })
          }
        } else {
          console.error('❌ Неверный формат callback_data:', callbackData)
        }
      } else {
        console.log('ℹ️ Неизвестный тип callback_data:', callbackData)
      }
    }

    // Handle regular messages (optional)
    if (body.message) {
      console.log('💬 Получено сообщение:', body.message.text)
      // Здесь можно добавить обработку текстовых команд
    }

    return Response.json({ success: true })

  } catch (error) {
    console.error('❌ Ошибка webhook:', error)
    return Response.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
