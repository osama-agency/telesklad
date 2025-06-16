'use client';

import React, { useState } from 'react';

const TelegramPurchasesPage: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Тест подключения к боту
  const testBotConnection = async () => {
    setLoading(true);
    setTestResult('Проверка подключения к боту...');

    try {
      const response = await fetch('/api/telegram/test-bot');
      const result = await response.json();
      
      if (result.success) {
        setTestResult(`✅ Бот подключен успешно!\n\nИнформация о боте:\n${JSON.stringify(result.botInfo, null, 2)}`);
      } else {
        setTestResult(`❌ Ошибка подключения: ${result.error}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Создание тестовой закупки
  const createTestPurchase = async () => {
    setLoading(true);
    setTestResult('Создание тестовой закупки...');

    try {
      const testPurchase = {
        items: [
          {
            productName: 'Тестовый товар 1',
            quantity: 2,
            costPrice: 15.50,
            total: 31.00
          },
          {
            productName: 'Тестовый товар 2',
            quantity: 1,
            costPrice: 25.00,
            total: 25.00
          }
        ],
        totalAmount: 56.00,
        isUrgent: false,
        supplierName: 'Тестовый поставщик',
        notes: 'Тестовая закупка для проверки Telegram интеграции'
      };

      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPurchase)
      });

      const result = await response.json();
      
      if (response.ok) {
        setTestResult(`✅ Тестовая закупка создана!\n\nID: ${result.id}\nСтатус: ${result.status}\nСумма: ${result.totalAmount} ₺`);
      } else {
        setTestResult(`❌ Ошибка создания: ${result.error}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Отправка тестового сообщения
  const sendTestMessage = async () => {
    setLoading(true);
    setTestResult('Отправка тестового сообщения...');

    try {
      const response = await fetch('/api/telegram/test-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: '🧪 Тестовое сообщение от TeleAdmin\n\nСистема управления закупками работает корректно!'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setTestResult(`✅ Тестовое сообщение отправлено!\n\nID сообщения: ${result.messageId}`);
      } else {
        setTestResult(`❌ Ошибка отправки: ${result.error}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          🤖 Telegram Закупки - Тестирование
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Панель управления */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Тестирование системы
              </h2>
              
              <div className="space-y-4">
                <button
                  onClick={testBotConnection}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Проверка...</span>
                    </>
                  ) : (
                    <>
                      <span>🔗</span>
                      <span>Проверить подключение к боту</span>
                    </>
                  )}
                </button>

                <button
                  onClick={createTestPurchase}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Создание...</span>
                    </>
                  ) : (
                    <>
                      <span>📝</span>
                      <span>Создать тестовую закупку</span>
                    </>
                  )}
                </button>

                <button
                  onClick={sendTestMessage}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Отправка...</span>
                    </>
                  ) : (
                    <>
                      <span>💬</span>
                      <span>Отправить тестовое сообщение</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Информация о системе */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Информация о системе
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Группа чата:</span>
                  <span className="font-mono text-gray-900 dark:text-white">-4729817036</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ID поставщика:</span>
                  <span className="font-mono text-gray-900 dark:text-white">7828956680</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ID администратора:</span>
                  <span className="font-mono text-gray-900 dark:text-white">125861752</span>
                </div>
              </div>
            </div>

            {/* Процесс работы */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Процесс работы
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Создание закупки в админ панели</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Отправка поставщику через Telegram</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Поставщик редактирует через WebApp</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Уведомление админа о готовности к оплате</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">5</div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Подтверждение оплаты и передача в карго</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">6</div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Уведомление группы о доставке</span>
                </div>
              </div>
            </div>
          </div>

          {/* Результаты тестирования */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Результаты тестирования
              </h3>
              
              {testResult ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                    {testResult}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Выберите тест для выполнения
                </div>
              )}
            </div>

            {/* Статусы закупок */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Статусы закупок
              </h3>
              
              <div className="space-y-2">
                {[
                  { status: 'draft', text: '🗒️ Черновик', color: 'bg-gray-100 text-gray-800' },
                  { status: 'sent_to_supplier', text: '📤 Отправлено поставщику', color: 'bg-blue-100 text-blue-800' },
                  { status: 'supplier_editing', text: '✏️ Поставщик редактирует', color: 'bg-yellow-100 text-yellow-800' },
                  { status: 'awaiting_payment', text: '💳 Ожидает оплату', color: 'bg-orange-100 text-orange-800' },
                  { status: 'paid', text: '💰 Оплачено', color: 'bg-green-100 text-green-800' },
                  { status: 'shipped', text: '🚚 Отправлено в карго', color: 'bg-indigo-100 text-indigo-800' },
                  { status: 'delivered', text: '✅ Доставлено', color: 'bg-emerald-100 text-emerald-800' },
                ].map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.status}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.color}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramPurchasesPage; 