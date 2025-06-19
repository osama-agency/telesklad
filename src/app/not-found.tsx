import { ArrowLeftIcon } from "@/assets/icons";
import Image from "next/image";
import Link from "next/link";

const FrownEmojiIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <line x1="7" y1="9" x2="7.01" y2="9"/>
    <line x1="17" y1="9" x2="17.01" y2="9"/>
  </svg>
);

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030C1A] flex items-center justify-center">
      <div className="rounded-xl p-8 text-center max-w-lg mx-auto">
        <div className="relative z-1">
          <div className="text-center">
            <div className="mx-auto mb-10 flex h-28 w-28 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700">
              <FrownEmojiIcon />
            </div>

            <h1 className="mb-5 text-3xl font-bold text-[#1E293B] dark:text-white">
              Страница не найдена
            </h1>

            <p className="mx-auto w-full max-w-md text-[#64748B] dark:text-gray-400 mb-8">
              Страница, которую вы ищете, не существует. Вот несколько полезных ссылок:
            </p>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] px-6 py-3 font-medium text-white hover:scale-105 transition-all duration-300"
            >
              <ArrowLeftIcon />
              <span>Вернуться к аналитике</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
