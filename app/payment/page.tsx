'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/register');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#06101e] flex items-center justify-center text-[#fbbf24] text-sm font-bold">
      ನೋಂದಣಿ ಉಚಿತವಾಗಿದೆ. ನೋಂದಣಿ ಪುಟಕ್ಕೆ ಮರುನಿರ್ದೇಶಿಸಲಾಗುತ್ತಿದೆ...
    </div>
  );
}
