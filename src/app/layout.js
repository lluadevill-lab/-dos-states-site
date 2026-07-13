import '../styles/globals.css'
import { Suspense } from 'react'
import { CartProvider } from '../context/CartContext'
import { AuthProvider } from '../context/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import ReferralCapture from '../components/ReferralCapture'

export const metadata = {
  title: 'Dos States — Importação sem fronteira',
  description: 'A Dos States compra, consolida e despacha produtos originais dos Estados Unidos para o Brasil.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Stencil:wght@600;800&family=Work+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={null}><ReferralCapture /></Suspense>
            <Header />
            <main className="min-h-[60vh]">{children}</main>
            <Footer />
            <WhatsAppButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
