import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್ 2026 | ಕ್ರಿಕೆಟ್ ಪಂದ್ಯಾವಳಿ ಆಟಗಾರರ ನೋಂದಣಿ ತಾಣ',
  description: 'ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್ ಕ್ರಿಕೆಟ್ ಪಂದ್ಯಾವಳಿ 2026 - ಸೀಸನ್ 01, ಗೆಣಸಿನಕುಣಿ. ಅಧಿಕೃತ ಆಟಗಾರರ ಆನ್‌ಲೈನ್ ನೋಂದಣಿ, ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ ಮತ್ತು ಪಂದ್ಯಾವಳಿ ಮಾಹಿತಿ.',
  keywords: 'Brahmalingeshwara Cup, cricket tournament 2026, Genasinakuni, player registration, Kannada cricket, ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className="min-h-screen flex flex-col bg-[#06101e] text-gray-100 font-kannada antialiased selection:bg-[#b91c1c] selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
