import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'

export async function getServerUserSession() {
  return await getServerSession(authOptions)
}

export async function isAdminUser() {
  const session = await getServerUserSession()

  // @ts-ignore
  return session?.user?.role === 'administrator'
}

export async function isDemoUser() {
  const session = await getServerUserSession()

  // @ts-ignore
  return session?.user?.email === 'demo@demo.com'
}

export async function requireAdminAccess() {
  const isAdmin = await isAdminUser()

  if (!isAdmin) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Доступ запрещен. Требуются права администратора.'
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  return null
}
