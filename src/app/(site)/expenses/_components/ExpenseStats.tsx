interface ExpenseStatsProps {
  totalAmount: number;
  totalCount: number;
}

export default function ExpenseStats({ totalAmount, totalCount }: ExpenseStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-[#1F2937] dark:shadow-card">
        <div className="flex items-center">
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <span className="text-2xl">💰</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-dark dark:text-[#F9FAFB]">
              {totalAmount.toLocaleString('ru-RU')} ₽
            </h3>
            <p className="text-sm text-dark-5 dark:text-[#94A3B8]">
              Общая сумма расходов
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-[#1F2937] dark:shadow-card">
        <div className="flex items-center">
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-dark dark:text-[#F9FAFB]">
              {totalCount}
            </h3>
            <p className="text-sm text-dark-5 dark:text-[#94A3B8]">
              Количество записей
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 