// Next Imports
import { Inter } from 'next/font/google'
import { Golos_Text } from 'next/font/google'

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Component Imports
import ConsoleFilter from '@/components/ConsoleFilter'
import Providers from '@/components/Providers'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

// Style Imports
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

const golosText = Golos_Text({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-golos-text'
})

export const metadata = {
  title: 'Telesklad - Система управления закупками',
  description: 'Современная система управления закупками и складом'
}

const RootLayout = async ({ children }: ChildrenType) => {
  // Vars
  const systemMode = await getSystemMode()

  return (
    <html id='__next' lang='ru' dir='ltr' suppressHydrationWarning>
      <head>
        <meta name="emotion-insertion-point" content="" />
      </head>
      <body className={`${inter.className} ${golosText.variable} flex is-full min-bs-full flex-auto flex-col`}>
        <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
        <Providers direction='ltr'>
          <ConsoleFilter />
          {children}
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
