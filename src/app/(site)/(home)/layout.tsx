import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Telesklad - Управление данными, товары, закупки, заказы, расходы",
  description: "Управляйте товарами, закупками, заказами и расходами в одном интерфейсе. Полная аналитика и удобная работа с данными.",
  keywords: "товары, закупки, заказы, расходы, управление данными, аналитика, telesklad",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 