"use client";

import { signIn, useSession } from "next-auth/react";
import { useState } from "react";

export default function TestAuthPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("go@osama.agency");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTestLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('🔐 Тестируем вход:', { email, password: '***' });
      
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log('📋 Результат входа:', result);
      setResult(result);
    } catch (error) {
      console.error('❌ Ошибка:', error);
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Тест аутентификации</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Текущая сессия:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({ status, session }, null, 2)}
          </pre>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Тест входа:</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Пароль:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <button
              onClick={handleTestLogin}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Тестируем..." : "Тест входа"}
            </button>
          </div>
        </div>

        {result && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Результат:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 