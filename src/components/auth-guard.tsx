"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Ждем загрузки сессии

    if (!session) {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  // Показываем загрузку пока проверяем сессию
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Если нет сессии, не показываем контент
  if (!session) {
    return null;
  }

  return <>{children}</>;
} 