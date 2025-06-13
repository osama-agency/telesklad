'use client'

// React Imports
import { useSession, signOut } from 'next-auth/react'

const AuthStatus = () => {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
        <span>Загрузка...</span>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-red-600 font-medium">
        Не авторизован
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-green-800 font-medium">Вы вошли в систему</h3>
          <div className="text-sm text-green-700 mt-1">
            <p>Email: {session.user?.email}</p>
            <p>Имя: {session.user?.name}</p>
            {/* @ts-ignore */}
            <p>Роль: {session.user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/ru/login' })}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Выйти
        </button>
      </div>
    </div>
  )
}

export default AuthStatus
