export interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface ExpenseCreateData extends Omit<Expense, 'id'> {}

export interface ExpenseUpdateData extends Partial<ExpenseCreateData> {} 