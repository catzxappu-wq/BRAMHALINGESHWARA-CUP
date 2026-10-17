'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Menu, X, ShieldCheck, UserCheck, Phone, Info } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Hide public navbar on admin dashboard pages
  if (pathname.startsWith('/admin/dashboard')) {
    return null;
  }

  const navLinks = [
    { href: '/', label: 'ಮುಖಪುಟ' },
    { href: '/register', label: 'ಆಟಗಾರರ ನೋಂದಣಿ' },
    { href: '/status', label: 'ನೋಂದಣಿ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ' },
    { href: '/info', label: 'ಪಂದ್ಯಾವಳಿ ಮಾಹಿತಿ' },
    { href: '/contact', label: 'ಸಂಪರ್ಕಿಸಿ' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#06101e]/95 backdrop-blur-md border-b border-[#d4af37]/30 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Tournament Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#b91c1c] via-[#d4af37] to-[#fbbf24] p-0.5 shadow-gold">
              <div className="w-full h-full bg-[#0a1b33] rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-[#fbbf24] group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-extrabold text-white tracking-wide flex items-center gap-1.5">
                <span className="text-[#fbbf24]">ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ</span> ಕಪ್
              </div>
              <div className="text-xs text-[#d4af37] font-semibold tracking-wider">
                ಕ್ರಿಕೆಟ್ ಪಂದ್ಯಾವಳಿ 2026 • ಸೀಸನ್ - 01
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-[#b91c1c] to-[#991b1b] text-white shadow-md border border-[#fbbf24]/40 font-bold'
                      : 'text-gray-200 hover:text-[#fbbf24] hover:bg-[#132d54]/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link
              href="/register"
              className="ml-3 inline-flex items-center px-4 py-2 border border-[#fbbf24] rounded-lg text-sm font-bold text-gray-900 bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d4af37] hover:brightness-110 shadow-gold transition-all duration-300"
            >
              ನೋಂದಣಿ ಮಾಡಿ
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-[#fbbf24] hover:bg-[#132d54] focus:outline-none"
              aria-label="ಮುಖ್ಯ ಮೆನು"
            >
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#0a1b33] border-b border-[#d4af37]/30 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  active
                    ? 'bg-[#b91c1c] text-white font-bold border-l-4 border-[#fbbf24]'
                    : 'text-gray-200 hover:bg-[#132d54] hover:text-[#fbbf24]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-4 py-3 rounded-lg text-base font-bold text-gray-950 bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d4af37] shadow-gold"
            >
              ಈಗಲೇ ನೋಂದಾಯಿಸಿ
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
