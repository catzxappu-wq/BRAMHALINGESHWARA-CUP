'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  User,
  Shield,
  AlertCircle,
  RefreshCw,
  Trophy,
  ArrowRight,
  Eye,
  EyeOff,
  Database,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetail, setErrorDetail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setErrorDetail('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ.');
        if (data.errorDetail) {
          setErrorDetail(data.errorDetail);
        }
        setLoading(false);
        return;
      }

      if (data.mustChangePassword) {
        router.push('/admin/change-password');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err) {
      setErrorMessage('ಸರ್ವರ್ ಸಂಪರ್ಕದಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06101e] via-[#0a1b33] to-[#06101e] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-[#b91c1c] via-[#d4af37] to-[#fbbf24] p-0.5 shadow-gold">
          <div className="w-full h-full bg-[#0a1b33] rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-[#fbbf24]" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
          ನಿರ್ವಾಹಕರ ಲಾಗಿನ್ (Admin Portal)
        </h1>
        <p className="text-xs sm:text-sm text-[#d4af37] font-semibold mt-1">
          ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್ 2026 • ಆಡಳಿತ ಮಂಡಳಿ ಪ್ರವೇಶ
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#0a192f] py-8 px-6 sm:px-10 rounded-3xl border-2 border-[#d4af37]/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#b91c1c] via-[#fbbf24] to-[#15803d]" />

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-300 text-sm space-y-2">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
              {errorDetail && (
                <div className="text-xs bg-black/40 p-2 rounded text-red-400 font-mono break-all border border-red-500/20">
                  {errorDetail}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-200 mb-1.5">
                ಬಳಕೆದಾರ ಹೆಸರು (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-5 h-5 text-[#fbbf24]" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ನಿರ್ವಾಹಕ ಬಳಕೆದಾರ ಹೆಸರು"
                  className="w-full pl-11 pr-4 py-3 bg-[#0e2444] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-200 mb-1.5">
                ಪಾಸ್‌ವರ್ಡ್ (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5 text-[#fbbf24]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ಗುಪ್ತ ಪಾಸ್‌ವರ್ಡ್"
                  className="w-full pl-11 pr-11 py-3 bg-[#0e2444] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-gold transition-all ${
                loading
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d4af37] text-gray-950 hover:brightness-110'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-gray-950" />
                  <span>ಪ್ರವೇಶಿಸಲಾಗುತ್ತಿದೆ...</span>
                </>
              ) : (
                <>
                  <span>ಲಾಗಿನ್ ಮಾಡಿ (Sign In)</span>
                  <ArrowRight className="w-4 h-4 text-gray-950" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-800 text-center">
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              ← ಸಾರ್ವಜನಿಕ ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          * ಸುರಕ್ಷತೆಯ ದೃಷ್ಟಿಯಿಂದ ಅನಧಿಕೃತ ಪ್ರವೇಶ ಪ್ರಯತ್ನಗಳನ್ನು ಸಿಸ್ಟಮ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ದಾಖಲಿಸುತ್ತದೆ ಮತ್ತು ಖಾತೆಯನ್ನು ಲಾಕ್ ಮಾಡುತ್ತದೆ.
        </div>
      </div>
    </div>
  );
}
