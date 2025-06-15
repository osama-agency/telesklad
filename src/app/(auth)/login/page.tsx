"use client";

import { AnimatedLogo } from "@/components/animated-logo";
import { LoadingButton } from "@/components/ui/button";
import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Неверный email или пароль");
      } else {
        // Проверяем сессию и перенаправляем
        const session = await getSession();
        if (session) {
          router.push("/");
        }
      }
    } catch (error) {
      setError("Произошла ошибка при входе");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      {/* Декоративные элементы фона */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-primary opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-primary opacity-8 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Основная карточка входа */}
      <div className="relative w-full max-w-md">
        <motion.div 
          className="bg-white dark:bg-gray-dark rounded-2xl shadow-2xl border border-stroke dark:border-dark-3 p-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.2,
            duration: 0.6,
            ease: "easeOut"
          }}
        >
          {/* Логотип */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex">
              <AnimatedLogo />
            </Link>
          </div>

          {/* Заголовок */}
          <div className="text-center mb-8">
            <p className="text-lg font-medium text-dark dark:text-white mb-2">
              Добро пожаловать! 👋
            </p>
            <h1 className="text-2xl font-bold text-dark dark:text-white mb-2">
              Вход в систему
            </h1>
            <p className="text-sm text-dark-4 dark:text-dark-6">
              Введите ваши данные для входа в панель управления
            </p>
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите ваш email"
                className="w-full rounded-lg border border-stroke bg-gray px-4 py-3 text-dark outline-none focus:ring-gradient dark:border-dark-3 dark:bg-gray-dark dark:text-white transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите ваш пароль"
                className="w-full rounded-lg border border-stroke bg-gray px-4 py-3 text-dark outline-none focus:ring-gradient dark:border-dark-3 dark:bg-gray-dark dark:text-white transition-all duration-200"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <LoadingButton
              type="submit"
              isLoading={isLoading}
              loadingText="Входим..."
              className="w-full"
              size="md"
              variant="primary"
            >
              Войти
            </LoadingButton>
          </form>

          {/* Дополнительные ссылки */}
          <div className="mt-6 text-center">
            <Link 
              href="/forgot-password" 
              className="text-sm text-primary hover:text-primary/80 transition-colors duration-200"
            >
              Забыли пароль?
            </Link>
          </div>
        </motion.div>

        {/* Декоративная подсветка карточки */}
        <motion.div 
          className="absolute inset-0 bg-gradient-primary opacity-5 rounded-2xl blur-xl -z-10 scale-105"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.05, scale: 1.05 }}
          transition={{
            delay: 0.2,
            duration: 0.8,
            ease: "easeOut"
          }}
        ></motion.div>
      </div>
    </div>
  );
} 