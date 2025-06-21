"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, CreditCard, Eye, EyeOff, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface BankCard {
  id: string;
  name: string;
  fio: string;
  number: string;
  active: boolean;
  orders_count: number;
  created_at: string;
  updated_at: string;
}

interface BankCardsResponse {
  cards: BankCard[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    total_cards: number;
    active_cards: number;
    inactive_cards: number;
  };
}

interface BankCardFormData {
  name: string;
  fio: string;
  number: string;
  active: boolean;
}

export default function BankCardsManager() {
  const [cards, setCards] = useState<BankCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total_cards: 0,
    active_cards: 0,
    inactive_cards: 0
  });

  // Модальные окна
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<BankCard | null>(null);

  // Форма
  const [formData, setFormData] = useState<BankCardFormData>({
    name: '',
    fio: '',
    number: '',
    active: true
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Фильтры
  const [filters, setFilters] = useState({
    search: '',
    active: 'true' // 'all', 'true', 'false' - по умолчанию только активные
  });

  // Пагинация
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Скрытие номеров карт (по умолчанию все видны)
  const [hiddenNumbers, setHiddenNumbers] = useState<Set<string>>(new Set());

  const fetchCards = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: filters.search
      });

      if (filters.active !== 'all') {
        params.append('active', filters.active);
      }

      const response = await fetch(`/api/settings/bank-cards?${params}`);
      if (!response.ok) throw new Error('Ошибка загрузки карт');

      const data: BankCardsResponse = await response.json();
      setCards(data.cards);
      setPagination(data.pagination);
      setStats(data.stats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards(1);
  }, [filters]);

  const handlePageChange = (newPage: number) => {
    fetchCards(newPage);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      fio: '',
      number: '',
      active: true
    });
    setFormError(null);
  };

  const handleCreateCard = async () => {
    if (!formData.name || !formData.fio || !formData.number) {
      setFormError('Заполните все обязательные поля');
      return;
    }

    try {
      setFormLoading(true);
      const response = await fetch('/api/settings/bank-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      await fetchCards(pagination.page);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Ошибка создания');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCard = async () => {
    if (!selectedCard || !formData.name || !formData.fio || !formData.number) {
      setFormError('Заполните все обязательные поля');
      return;
    }

    try {
      setFormLoading(true);
      const response = await fetch('/api/settings/bank-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedCard.id, ...formData })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      await fetchCards(pagination.page);
      setIsEditModalOpen(false);
      setSelectedCard(null);
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Ошибка обновления');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!selectedCard) return;

    try {
      setFormLoading(true);
      const response = await fetch(`/api/settings/bank-cards?id=${selectedCard.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      await fetchCards(pagination.page);
      setIsDeleteModalOpen(false);
      setSelectedCard(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Ошибка удаления');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (card: BankCard) => {
    setSelectedCard(card);
    setFormData({
      name: card.name,
      fio: card.fio,
      number: card.number,
      active: card.active
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (card: BankCard) => {
    setSelectedCard(card);
    setIsDeleteModalOpen(true);
  };

  const toggleNumberVisibility = (cardId: string) => {
    const newHidden = new Set(hiddenNumbers);
    if (newHidden.has(cardId)) {
      newHidden.delete(cardId);
    } else {
      newHidden.add(cardId);
    }
    setHiddenNumbers(newHidden);
  };

  const maskCardNumber = (number: string, isHidden: boolean) => {
    if (!isHidden) return number;
    return number.replace(/\d(?=\d{4})/g, '*');
  };

  const formatCardNumber = (number: string) => {
    if (!number) return '';
    // Проверяем, является ли это номером телефона (начинается с + или цифры и содержит 10-15 цифр)
    if (number.match(/^[\+]?[0-9\s\-\(\)]{10,15}$/)) {
      // Форматируем как номер телефона
      const cleaned = number.replace(/\D/g, '');
      if (cleaned.length === 11 && cleaned.startsWith('7')) {
        return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
      }
      return number; // Возвращаем как есть, если не удалось отформатировать
    }
    // Форматируем как номер карты (группы по 4 цифры)
    return number.replace(/(.{4})/g, '$1 ').trim();
  };

  const getCardIcon = (bankName: string) => {
    const name = bankName.toLowerCase();
    if (name.includes('сбербанк')) return '🟢';
    if (name.includes('тинькофф') || name.includes('t-банк')) return '💛';
    if (name.includes('втб')) return '🔵';
    if (name.includes('альфа')) return '🔴';
    return '🏦';
  };

  const getNumberType = (number: string) => {
    if (!number) return 'unknown';
    // Проверяем, является ли это номером телефона
    if (number.match(/^[\+]?[0-9\s\-\(\)]{10,15}$/)) {
      return 'phone';
    }
    // Иначе считаем номером карты
    return 'card';
  };

  const getNumberIcon = (number: string) => {
    const type = getNumberType(number);
    return type === 'phone' ? '📞' : '💳';
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#64748B] dark:text-gray-400">Всего карт</p>
              <p className="text-2xl font-bold text-[#1E293B] dark:text-white">{stats.total_cards}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-800/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-[#64748B] dark:text-gray-400">Активные</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active_cards}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-800/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-[#64748B] dark:text-gray-400">Неактивные</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.inactive_cards}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Заголовок и кнопка создания */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B] dark:text-white">Банковские карты</h2>
          <p className="text-[#64748B] dark:text-gray-400 mt-1">Управление банковскими картами для платежей</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-6 py-3 rounded-lg font-medium hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Добавить карту</span>
        </button>
      </div>

      {/* Фильтры */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B] dark:text-gray-400" />
                         <input
               type="text"
               placeholder="Поиск по названию банка, ФИО, номеру карты или телефона..."
               value={filters.search}
               onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
               className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white placeholder-[#64748B] dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 focus:border-[#1A6DFF] dark:focus:border-[#1A6DFF] transition-all duration-300"
             />
          </div>
          <select
            value={filters.active}
            onChange={(e) => setFilters(prev => ({ ...prev, active: e.target.value }))}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 focus:border-[#1A6DFF] dark:focus:border-[#1A6DFF] transition-all duration-300"
          >
            <option value="all">Все карты</option>
            <option value="true">Только активные</option>
            <option value="false">Только неактивные</option>
          </select>
        </div>
             </div>

      {/* Список карт */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A6DFF]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 text-lg font-medium">{error}</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard className="w-12 h-12 text-[#64748B] dark:text-gray-400 mx-auto mb-4" />
            <p className="text-[#64748B] dark:text-gray-400 text-lg">Банковские карты не найдены</p>
            <p className="text-sm text-[#64748B] dark:text-gray-400 mt-2">Добавьте первую карту для начала работы</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border transition-all duration-300 hover:shadow-lg ${
                    card.active 
                      ? 'border-gray-200 dark:border-gray-600 hover:border-[#1A6DFF]/30' 
                      : 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  {/* Статус активности */}
                  <div className="absolute top-4 right-4">
                    {card.active ? (
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    )}
                  </div>

                  {/* Иконка банка */}
                  <div className="text-3xl mb-4">
                    {getCardIcon(card.name)}
                  </div>

                  {/* Информация о карте */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-[#1E293B] dark:text-white">
                        {card.name}
                      </h3>
                      <p className="text-sm text-[#64748B] dark:text-gray-400">
                        {card.fio}
                      </p>
                    </div>

                                         <div className="flex items-center justify-between">
                       <div className="font-mono text-sm flex items-center space-x-2">
                         <span className="text-lg">{getNumberIcon(card.number)}</span>
                         <span className="text-[#1E293B] dark:text-white">
                           {formatCardNumber(maskCardNumber(card.number, hiddenNumbers.has(card.id)))}
                         </span>
                       </div>
                       <button
                         onClick={() => toggleNumberVisibility(card.id)}
                         className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                         title={hiddenNumbers.has(card.id) ? "Показать номер" : "Скрыть номер"}
                       >
                         {hiddenNumbers.has(card.id) ? (
                           <Eye className="w-4 h-4 text-[#64748B] dark:text-gray-400" />
                         ) : (
                           <EyeOff className="w-4 h-4 text-[#64748B] dark:text-gray-400" />
                         )}
                       </button>
                     </div>

                    {/* Статистика использования */}
                    <div className="text-xs text-[#64748B] dark:text-gray-400">
                      <span>{card.orders_count} заказов</span>
                    </div>

                    {/* Дата создания */}
                    <div className="text-xs text-[#64748B] dark:text-gray-400">
                      Создана: {new Date(card.created_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>

                  {/* Действия */}
                  <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => openEditModal(card)}
                      className="p-2 text-[#1A6DFF] hover:bg-[#1A6DFF]/10 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(card)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Пагинация */}
            {pagination.pages > 1 && (
              <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#64748B] dark:text-gray-400">
                    Показано {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300"
                    >
                      ←
                    </button>
                    <span className="text-sm text-[#64748B] dark:text-gray-400">
                      {pagination.page} из {pagination.pages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Модальное окно создания карты */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-[#1E293B] dark:text-white">Добавить банковскую карту</h3>
              <p className="text-sm text-[#64748B] dark:text-gray-400 mt-1">Заполните информацию о новой карте</p>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                  <p className="text-red-600 dark:text-red-400 text-sm">{formError}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                  Название банка *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 focus:border-[#1A6DFF] dark:focus:border-[#1A6DFF] transition-all duration-300"
                  placeholder="Например: Сбербанк"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                  ФИО владельца *
                </label>
                <input
                  type="text"
                  value={formData.fio}
                  onChange={(e) => setFormData(prev => ({ ...prev, fio: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 focus:border-[#1A6DFF] dark:focus:border-[#1A6DFF] transition-all duration-300"
                  placeholder="Иванов Иван Иванович"
                />
              </div>

                             <div>
                 <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                   Номер карты или телефона *
                 </label>
                 <input
                   type="text"
                   value={formData.number}
                   onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 focus:border-[#1A6DFF] dark:focus:border-[#1A6DFF] transition-all duration-300"
                   placeholder="1234567890123456 или +7 (999) 123-45-67"
                 />
                 <p className="text-xs text-[#64748B] dark:text-gray-400 mt-1">
                   Введите номер банковской карты (16 цифр) или номер телефона
                 </p>
               </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 text-[#1A6DFF] bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[#1A6DFF] focus:ring-2"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-[#374151] dark:text-gray-300">
                  Активная карта
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 text-[#64748B] dark:text-gray-400 hover:text-[#1E293B] dark:hover:text-white transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateCard}
                disabled={formLoading}
                className="px-6 py-2 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
              >
                {formLoading ? 'Создание...' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования карты */}
      {isEditModalOpen && selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-[#1E293B] dark:text-white">Редактировать карту</h3>
              <p className="text-sm text-[#64748B] dark:text-gray-400 mt-1">Изменение информации о карте</p>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                  <p className="text-red-600 dark:text-red-400 text-sm">{formError}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                  Название банка *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 focus:border-[#1A6DFF] dark:focus:border-[#1A6DFF] transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                  ФИО владельца *
                </label>
                <input
                  type="text"
                  value={formData.fio}
                  onChange={(e) => setFormData(prev => ({ ...prev, fio: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 focus:border-[#1A6DFF] dark:focus:border-[#1A6DFF] transition-all duration-300"
                />
              </div>

                             <div>
                 <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                   Номер карты или телефона *
                 </label>
                 <input
                   type="text"
                   value={formData.number}
                   onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 focus:border-[#1A6DFF] dark:focus:border-[#1A6DFF] transition-all duration-300"
                 />
                 <p className="text-xs text-[#64748B] dark:text-gray-400 mt-1">
                   Введите номер банковской карты (16 цифр) или номер телефона
                 </p>
               </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 text-[#1A6DFF] bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[#1A6DFF] focus:ring-2"
                />
                <label htmlFor="edit-active" className="ml-2 block text-sm text-[#374151] dark:text-gray-300">
                  Активная карта
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedCard(null);
                  resetForm();
                }}
                className="px-4 py-2 text-[#64748B] dark:text-gray-400 hover:text-[#1E293B] dark:hover:text-white transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleEditCard}
                disabled={formLoading}
                className="px-6 py-2 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
              >
                {formLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно удаления карты */}
      {isDeleteModalOpen && selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Удалить карту</h3>
              <p className="text-sm text-[#64748B] dark:text-gray-400 mt-1">Это действие нельзя отменить</p>
            </div>
            <div className="p-6">
              {formError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-4">
                  <p className="text-red-600 dark:text-red-400 text-sm">{formError}</p>
                </div>
              )}
              
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-500 mt-0.5" />
                <div>
                  <p className="text-[#1E293B] dark:text-white font-medium">
                    Вы уверены, что хотите удалить карту?
                  </p>
                  <div className="mt-2 text-sm text-[#64748B] dark:text-gray-400">
                    <p><strong>Банк:</strong> {selectedCard.name}</p>
                    <p><strong>Владелец:</strong> {selectedCard.fio}</p>
                    <p><strong>Номер:</strong> {formatCardNumber(selectedCard.number)}</p>
                    <p><strong>Заказов:</strong> {selectedCard.orders_count}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedCard(null);
                  setFormError(null);
                }}
                className="px-4 py-2 text-[#64748B] dark:text-gray-400 hover:text-[#1E293B] dark:hover:text-white transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleDeleteCard}
                disabled={formLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {formLoading ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 