"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccessDeniedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
          >
            <ShieldAlert className="h-16 w-16 text-red-600 dark:text-red-400" />
          </motion.div>

          {/* Error Code */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-4 text-6xl font-bold text-gray-900 dark:text-white"
          >
            403
          </motion.h1>

          {/* Error Message */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-2 text-2xl font-semibold text-gray-800 dark:text-gray-200"
          >
            Доступ запрещен
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8 text-gray-600 dark:text-gray-400"
          >
            У вас нет прав для просмотра этой страницы. Обратитесь к администратору для получения доступа.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад
            </button>
            
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 font-medium text-white transition-all hover:bg-gradient-primary-hover hover:shadow-lg"
            >
              <Home className="h-4 w-4" />
              На главную
            </Link>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-12 text-sm text-gray-500 dark:text-gray-500"
          >
            <p>Код ошибки: ACCESS_DENIED</p>
            <p className="mt-1">
              Если вы считаете, что это ошибка, свяжитесь с{" "}
              <a
                href="mailto:support@telesklad.com"
                className="text-primary hover:underline"
              >
                поддержкой
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 