import './globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Movie Tracker',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className='py-4 px-8 flex justify-between'>
            <a href='/' className='my-auto'>HOME PAGE</a>
            <div className='flex gap-4'>
              <UserButton />
              <p className='my-auto'>My Account</p>
            </div>
          </div>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
