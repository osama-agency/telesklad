interface ExpenseStatsProps {
  totalAmount: number;
  totalCount: number;
}

export default function ExpenseStats({ totalAmount, totalCount }: ExpenseStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Total Amount Card */}
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 transform rounded-full bg-rose-500/10"></div>
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/10">
              <svg className="h-6 w-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#64748B] dark:text-gray-400">Общая сумма</p>
              <p className="text-2xl font-bold text-[#1E293B] dark:text-white">
                ₽{totalAmount.toLocaleString('ru-RU')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Total Count Card */}
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 transform rounded-full bg-gradient-to-br from-[#1A6DFF]/10 to-[#00C5FF]/10"></div>
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#1A6DFF]/10 to-[#00C5FF]/10">
              <svg className="h-6 w-6 text-[#1A6DFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#64748B] dark:text-gray-400">Количество записей</p>
              <p className="text-2xl font-bold text-[#1E293B] dark:text-white">{totalCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 