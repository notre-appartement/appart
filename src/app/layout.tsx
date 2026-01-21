import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProjectProvider } from '@/contexts/ProjectContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import AuthGuard from '@/components/AuthGuard'
import Navigation from '@/components/Navigation'
import ToastProvider from '@/components/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Notre Appart - Recherche d\'appartement',
  description: 'Application pour organiser notre recherche d\'appartement ensemble',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <ProjectProvider>
              <AuthGuard>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
                  <Navigation />
                  <main>
                    {children}
                  </main>
                </div>
              </AuthGuard>
            </ProjectProvider>
          </AuthProvider>
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}
