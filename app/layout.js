import './globals.css'
import { Toaster } from 'react-hot-toast'
import Providers from './providers'

export const metadata = {
  title: 'Discord Rules Bot Dashboard',
  description: 'Manage and sync your Discord server rules from the web.',
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
