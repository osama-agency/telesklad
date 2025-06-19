import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

/*
  Тип записи покупки. Расширьте при необходимости.
*/
export interface Purchase {
  id: string;
  title: string;
  createdAt: string; // ISO строка
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  totalRUB: number;
  totalTRY: number;
}

interface Props {
  purchases: Purchase[];
  onSelect?: (purchase: Purchase) => void;
}

/*
  Современный компонент: адаптивная сетка карт в фирменном стиле Telesklad.
  Без сторонних UI-библиотек, только Tailwind + Framer Motion.
*/
const PurchasesTableAviasalesFixed: React.FC<Props> = ({ purchases, onSelect }) => {
  if (!purchases?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500 dark:text-gray-400">
        <Image 
          src="/images/illustration/illustration-01.svg" 
          alt="Empty" 
          width={160}
          height={160}
          className="mb-6 opacity-80 dark:opacity-60" 
        />
        <p className="text-lg font-medium">Пока нет закупок</p>
        <p className="text-sm">Добавьте первую закупку, чтобы увидеть её здесь.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      <AnimatePresence>
        {purchases.map((p) => (
          <motion.button
            key={p.id}
            layout
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            onClick={() => onSelect?.(p)}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 p-4">
              <h3 className="line-clamp-2 text-left text-base font-semibold text-[#1E293B] dark:text-white">
                {p.title}
              </h3>
              {/* Статусная метка */}
              <span
                className={
                  {
                    draft: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
                    sent: 'bg-blue-100 text-blue-600 dark:bg-blue-600/20 dark:text-blue-300',
                    paid: 'bg-green-100 text-green-600 dark:bg-green-600/20 dark:text-green-300',
                    cancelled: 'bg-red-100 text-red-600 dark:bg-red-600/20 dark:text-red-300',
                  }[p.status]
                +
                  ' inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
              }
              >
                {statusLabel(p.status)}
              </span>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />

            {/* Body */}
            <div className="flex flex-1 flex-col justify-between gap-4 p-4">
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Создано: {formatDate(p.createdAt)}</span>
              </div>
              {/* Сумма */}
              <div>
                <p className="text-lg font-bold text-[#1E293B] dark:text-white">
                  {formatNumber(p.totalRUB)} ₽
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatNumber(p.totalTRY)} ₺
                </p>
              </div>
            </div>

            {/* Градиентная полоса внизу */}
            <div className="mt-auto h-1 w-full bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] group-hover:animate-pulse" />
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default PurchasesTableAviasalesFixed;

// ----------------- helpers -----------------
function statusLabel(status: Purchase['status']) {
  switch (status) {
    case 'draft':
      return 'Черновик';
    case 'sent':
      return 'Отправлен';
    case 'paid':
      return 'Оплачен';
    case 'cancelled':
      return 'Отменён';
    default:
      return status;
  }
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('ru-RU').format(n);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU');
} 