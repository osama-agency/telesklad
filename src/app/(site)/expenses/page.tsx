import { Metadata } from "next";
import ExpensesClient from "./_components/ExpensesClient";

export const metadata: Metadata = {
  title: "Расходы | Dashboard",
  description: "Управление расходами",
};

export default function ExpensesPage() {
  return <ExpensesClient />;
} 