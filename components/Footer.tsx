'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, MapPin, Calendar, Phone, Shield, Lock } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide on admin dashboard
  if (pathname.startsWith('/admin/dashboard')) {
    return null;
  }

  return (
    <footer className="bg-[#050c17] text-gray-300 border-t border-[#d4af37]/30 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Tournament Overview */}
          <div>
            <div className="flex items-center space-x-2.5 mb-4">
              <Trophy className="w-6 h-6 text-[#fbbf24]" />
              <h3 className="text-lg font-bold text-white tracking-wide">
                ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್ 2026
              </h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              ಪ್ರಥಮ ವರ್ಷದ ಲೀಗ್ ಮಾದರಿಯ ಕ್ರಿಕೆಟ್ ಪಂದ್ಯಾವಳಿ - ಸೀಸನ್ 01. ಗ್ರಾಮೀಣ ಮತ್ತು ಹೋಬಳಿ ಮಟ್ಟದ ಪ್ರತಿಭಾನ್ವಿತ ಕ್ರಿಕೆಟ್ ಆಟಗಾರರಿಗೆ ಸುವರ್ಣಾವಕಾಶ.
            </p>
            <div className="space-y-2 text-xs text-[#d4af37]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#fbbf24]" />
                <span>20, 21 ಮತ್ತು 22 ನವೆಂಬರ್ 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#fbbf24]" />
                <span>ಸ್ಥಳ: ಗೆಣಸಿನಕುಣಿ</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-bold text-[#fbbf24] mb-4 border-b border-[#d4af37]/30 pb-2">
              ಮುಖ್ಯ ಲಿಂಕ್‌ಗಳು
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-[#fbbf24] transition-colors">
                  ಮುಖಪುಟ
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#fbbf24] transition-colors">
                  ಆಟಗಾರರ ನೋಂದಣಿ
                </Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-[#fbbf24] transition-colors">
                  ನೋಂದಣಿ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ
                </Link>
              </li>
              <li>
                <Link href="/info" className="hover:text-[#fbbf24] transition-colors">
                  ಪಂದ್ಯಾವಳಿ ಮಾಹಿತಿ & ನಿಯಮಗಳು
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#fbbf24] transition-colors">
                  ಸಂಪರ್ಕ ವಿವರಗಳು
                </Link>
              </li>
            </ul>
          </div>

          {/* Prize pool & organizers */}
          <div>
            <h4 className="text-base font-bold text-[#fbbf24] mb-4 border-b border-[#d4af37]/30 pb-2">
              ಬಹುಮಾನಗಳ ವಿವರ
            </h4>
            <div className="space-y-3 text-sm">
              <div className="bg-[#0a1b33] p-2.5 rounded-lg border border-[#d4af37]/40">
                <div className="text-xs text-gray-400">ಪ್ರಥಮ ಬಹುಮಾನ:</div>
                <div className="text-sm font-bold text-[#fbbf24]">₹28,888/- ಹಾಗೂ ಪಾರಿತೋಷಕ</div>
              </div>
              <div className="bg-[#0a1b33] p-2.5 rounded-lg border border-[#d4af37]/40">
                <div className="text-xs text-gray-400">ದ್ವಿತೀಯ ಬಹುಮಾನ:</div>
                <div className="text-sm font-bold text-[#fbbf24]">₹18,888/- ಹಾಗೂ ಪಾರಿತೋಷಕ</div>
              </div>
            </div>

            <div className="mt-4 pt-2 text-xs text-gray-300">
              <span className="font-semibold text-white">ಸಂಪರ್ಕಿಸಿ:</span>
              <div>ತೀರ್ಥೇಶ್‌: 9632520611</div>
              <div>ಪ್ರಜ್ವಲ್ PK: 9606467726</div>
            </div>
          </div>

          {/* Privacy & Terms */}
          <div>
            <h4 className="text-base font-bold text-[#fbbf24] mb-4 border-b border-[#d4af37]/30 pb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#fbbf24]" />
              ಗೌಪ್ಯತೆ ಮತ್ತು ನಿಯಮಾವಳಿಗಳು
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              ನೋಂದಣಿ ಸಮಯದಲ್ಲಿ ಸಂಗ್ರಹಿಸಲಾಗುವ ಆಟಗಾರರ ವೈಯಕ್ತಿಕ ವಿವರ ಮತ್ತು ಭಾವಚಿತ್ರಗಳನ್ನು ಕೇವಲ ಪಂದ್ಯಾವಳಿ ಪರಿಶೀಲನೆ, ಆಟಗಾರರ ಗುರುತಿನ ಚೀಟಿ ಮತ್ತು ಆಡಳಿತಾತ್ಮಕ ಉದ್ದೇಶಗಳಿಗಾಗಿ ಮಾತ್ರ ಬಳಸಲಾಗುತ್ತದೆ. ಯಾವುದೇ ಖಾಸಗಿ ಮಾಹಿತಿಯನ್ನು ಮೂರನೇ ವ್ಯಕ್ತಿಗಳಿಗೆ ಹಂಚಿಕೊಳ್ಳುವುದಿಲ್ಲ.
            </p>
            <div className="mt-3 text-xs text-amber-200/80">
              * ಪಂದ್ಯಾವಳಿಯ ದಿನದಂದು ಆಟಗಾರರು ತಮ್ಮ ಅಸಲಿ ಆಧಾರ್ ಕಾರ್ಡ್ ಅಥವಾ ಐ ಡಿ ಕಾರ್ಡ್ ಹಾಜರುಪಡಿಸುವುದು ಕಡ್ಡಾಯವಾಗಿರುತ್ತದೆ.
            </div>
          </div>
        </div>

        {/* Bottom copyright and discreet admin login */}
        <div className="pt-8 mt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <div>
            © 2026 ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್ ಕ್ರಿಕೆಟ್ ಸಮಿತಿ, ಗೆಣಸಿನಕುಣಿ. ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1 text-gray-500 hover:text-[#fbbf24] transition-colors"
              title="ಆಡಳಿತ ಮಂಡಳಿ ಪ್ರವೇಶ"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>ನಿರ್ವಾಹಕರ ಲಾಗಿನ್</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
