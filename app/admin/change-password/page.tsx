'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  KeyRound,
  Lock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತು ಖಚಿತಪಡಿಸಿದ ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.');
        setLoading(false);
        return;
      }

      setSuccessMessage('ಪಾಸ್‌ವರ್ಡ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ! ನಿರ್ವಾಹಕ ಫಲಕಕ್ಕೆ ಕರೆದೊಯ್ಯಲಾಗುತ್ತಿದೆ...');
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1500);
    } catch (err) {
      setErrorMessage('ಸರ್ವರ್ ಸಂಪರ್ಕದಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06101e] via-[#0a1b33] to-[#06101e] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#b91c1c] flex items-center justify-center text-[#fbbf24] shadow-lg">
          <KeyRound className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white">
          ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾವಣೆ (Security Setup)
        </h1>
        <p className="text-xs sm:text-sm text-[#fbbf24] font-medium mt-1">
          ಭದ್ರತೆಯ ಕಾರಣಕ್ಕಾಗಿ ಮೊದಲ ಲಾಗಿನ್‌ನಲ್ಲಿ ತಾತ್ಕಾಲಿಕ ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸುವುದು ಕಡ್ಡಾಯವಾಗಿದೆ.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#0a192f] py-8 px-6 sm:px-10 rounded-3xl border-2 border-[#d4af37]/40 shadow-2xl relative overflow-hidden">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex items-start gap-3 text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/50 flex items-start gap-3 text-emerald-300 text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-200 mb-1.5">
                ಪ್ರಸ್ತುತ ತಾತ್ಕಾಲಿಕ ಪಾಸ್‌ವರ್ಡ್ (Current Temporary Password)
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="admin_credentials.txt ನಲ್ಲಿರುವ ಪಾಸ್‌ವರ್ಡ್"
                className="w-full px-4 py-3 bg-[#0e2444] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#fbbf24] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-200 mb-1.5">
                ಹೊಸ ಬಲಿಷ್ಠ ಪಾಸ್‌ವರ್ಡ್ (New Strong Password)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳು"
                className="w-full px-4 py-3 bg-[#0e2444] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#fbbf24] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-200 mb-1.5">
                ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ (Confirm Password)
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ಪುನಃ ನಮೂದಿಸಿ"
                className="w-full px-4 py-3 bg-[#0e2444] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#fbbf24] text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-gold transition-all mt-4 ${
                loading
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d4af37] text-gray-950 hover:brightness-110'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ಬದಲಾಯಿಸಲಾಗುತ್ತಿದೆ...</span>
                </>
              ) : (
                <>
                  <span>ಪಾಸ್‌ವರ್ಡ್ ಉಳಿಸಿ ಮತ್ತು ಮುಂದುವರಿಯಿರಿ</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
