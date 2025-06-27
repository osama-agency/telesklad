"use client";

import { AnimatedLogo } from "@/components/animated-logo";
import { LoadingButton } from "@/components/ui/button";
import { signIn, getSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

// Иконки для показа/скрытия пароля
const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Загружаем сохранённые данные при монтировании
  useEffect(() => {
    const savedEmail = localStorage.getItem('loginEmail');
    const savedPassword = localStorage.getItem('loginPassword');
    const savedRemember = localStorage.getItem('rememberLogin') === 'true';
    
    if (savedEmail && savedRemember) {
      setEmail(savedEmail);
      setRememberMe(true);
      // Загружаем пароль только если он был сохранён
      if (savedPassword) {
        setPassword(savedPassword);
      }
    }
  }, []);

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
        // Сохраняем данные если включено "Запомнить меня"
        if (rememberMe) {
          localStorage.setItem('loginEmail', email);
          localStorage.setItem('loginPassword', password);
          localStorage.setItem('rememberLogin', 'true');
        } else {
          // Очищаем сохранённые данные
          localStorage.removeItem('loginEmail');
          localStorage.removeItem('loginPassword');
          localStorage.removeItem('rememberLogin');
        }

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
                placeholder="go@osama.agency"
                className="w-full rounded-lg border border-stroke bg-gray px-4 py-3 text-dark outline-none focus:ring-gradient dark:border-dark-3 dark:bg-gray-dark dark:text-white transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите ваш пароль"
                  className="w-full rounded-lg border border-stroke bg-gray px-4 py-3 pr-12 text-dark outline-none focus:ring-gradient dark:border-dark-3 dark:bg-gray-dark dark:text-white transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-4 hover:text-dark dark:text-dark-6 dark:hover:text-white transition-colors duration-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Запомнить меня */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative w-5 h-5 rounded border-2 transition-all duration-200 ${
                  rememberMe 
                    ? 'bg-primary border-primary' 
                    : 'bg-transparent border-stroke dark:border-dark-3'
                }`}>
                  {rememberMe && (
                    <svg 
                      className="absolute inset-0 w-3 h-3 text-white m-auto" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="ml-2 text-sm text-dark dark:text-white">
                  Запомнить меня
                </span>
              </label>

              <Link 
                href="/forgot-password" 
                className="text-sm text-primary hover:text-primary/80 transition-colors duration-200"
              >
                Забыли пароль?
              </Link>
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