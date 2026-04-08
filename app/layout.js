import './globals.css'
import { Toaster } from 'react-hot-toast'
import Providers from './providers'

export const metadata = {
  title: 'NF Rules Bot',
  description: 'Manage and sync your Discord server rules from the web.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  )
}
