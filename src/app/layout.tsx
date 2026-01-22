import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProjectProvider } from '@/contexts/ProjectContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import AuthGuard from '@/components/AuthGuard'
import ConditionalLayout from '@/components/ConditionalLayout'
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
                <ConditionalLayout>
                  {children}
                </ConditionalLayout>
              </AuthGuard>
            </ProjectProvider>
          </AuthProvider>
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}
