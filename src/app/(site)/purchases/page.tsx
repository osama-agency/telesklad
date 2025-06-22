"use client";

import PurchasesModernInterface from "@/components/Purchases/PurchasesModernInterface";
import { useEffect } from "react";

export default function PurchasesPage() {
  // Set document title
  useEffect(() => {
    document.title = "Закупки | TeleAdmin";
  }, []);

  return <PurchasesModernInterface />;
} 