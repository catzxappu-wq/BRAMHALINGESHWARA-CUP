'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  User,
  ShieldCheck,
  Calendar,
  CreditCard,
  Trophy,
  RefreshCw,
  Phone,
} from 'lucide-react';

interface StatusResult {
  registrationCode: string;
  fullName: string;
  category: string;
  categoryKannada: string;
  paymentStatus: string;
  paymentStatusKannada: string;
  paymentStatusColor: string;
  selectionStatus: string;
  selectionStatusKannada: string;
  selectionStatusColor: string;
  registrationStatusKannada: string;
  registrationDate: string;
}

export default function StatusPage() {
  const [registrationCode, setRegistrationCode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StatusResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setResult(null);

    const cleanCode = registrationCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMessage('ದಯವಿಟ್ಟು ನಿಮ್ಮ ನೋಂದಣಿ ಕೋಡ್ ಅನ್ನು ನಮೂದಿಸಿ (ಉದಾ: SBK26-000001).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/status-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationCode: cleanCode,
          mobileNumber: mobileNumber.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'ಮಾಹಿತಿ ಪಡೆಯುವಲ್ಲಿ ವಿಫಲವಾಗಿದೆ.');
      } else {
        setResult(data.data);
      }
    } catch (err) {
      setErrorMessage('ಸರ್ವರ್ ಸಂಪರ್ಕದಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectionBadge = (status: string, kannadaText: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{kannadaText}</span>
          </div>
        );
      case 'not_selected':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950 border border-red-500 text-red-300 font-bold text-sm">
            <XCircle className="w-5 h-5 text-red-400" />
            <span>{kannadaText}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950 border border-blue-500 text-blue-300 font-bold text-sm">
            <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
            <span>{kannadaText}</span>
          </div>
        );
    }
  };

  const getPaymentBadge = (status: string, kannadaText: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-400">
            {kannadaText}
          </span>
        );
      case 'failed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-950 border border-red-500/40 text-red-400">
            {kannadaText}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950 border border-amber-500/40 text-amber-400">
            {kannadaText}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1b33] via-[#081526] to-[#06101e] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-tr from-[#b91c1c] via-[#d4af37] to-[#fbbf24] p-0.5 shadow-gold">
            <div className="w-full h-full bg-[#0a1b33] rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-[#fbbf24]" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            ನೋಂದಣಿ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ (Check Status)
          </h1>
          <p className="text-sm text-gray-300 mt-2">
            ನಿಮ್ಮ ನೋಂದಣಿ ಕೋಡ್ ನಮೂದಿಸಿ ಶುಲ್ಕ ಪಾವತಿ ಮತ್ತು ತಂಡದ ಆಯ್ಕೆಯ ಫಲಿತಾಂಶವನ್ನು ಪರಿಶೀಲಿಸಿ.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-[#0a192f] rounded-2xl border-2 border-[#d4af37]/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-8">
          <form onSubmit={handleCheck} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-200 mb-2">
                ಅನನ್ಯ ನೋಂದಣಿ ಕೋಡ್ (Registration Code) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={registrationCode}
                onChange={(e) => setRegistrationCode(e.target.value.toUpperCase())}
                placeholder="ಉದಾಹರಣೆಗೆ: SBK26-000001"
                className="w-full px-4 py-3 bg-[#0e2444] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] uppercase font-mono tracking-wider font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-200 mb-2">
                ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Mobile Number - Optional)
              </label>
              <input
                type="tel"
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (ಐಚ್ಛಿಕ ಭದ್ರತಾ ಪರಿಶೀಲನೆ)"
                className="w-full px-4 py-3 bg-[#0e2444] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-6 rounded-xl text-base font-extrabold flex items-center justify-center gap-2 shadow-gold transition-all ${
                loading
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d4af37] text-gray-950 hover:brightness-110'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ (Search Status)</span>
                </>
              )}
            </button>
          </form>

          {errorMessage && (
            <div className="mt-5 p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex items-start gap-3 text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Status Result Card */}
        {result && (
          <div className="bg-[#0a192f] rounded-2xl border-2 border-[#fbbf24] p-6 sm:p-8 shadow-gold relative overflow-hidden">
            <div className="text-center pb-4 mb-4 border-b border-gray-700">
              <span className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider">
                ಆಟಗಾರರ ಪರಿಶೀಲನಾ ವಿವರ
              </span>
              <h2 className="text-2xl font-black text-white mt-1">{result.fullName}</h2>
              <div className="inline-block mt-2 font-mono text-base font-bold px-3 py-1 bg-[#132d54] text-[#fbbf24] rounded-lg border border-[#d4af37]/40">
                {result.registrationCode}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {/* Selection status - Prominent */}
              <div className="bg-[#0e2444] p-4 rounded-xl border border-gray-700">
                <div className="text-xs text-gray-400 mb-2 font-semibold">
                  ತಂಡದ ಆಯ್ಕೆಯ ಸ್ಥಿತಿ (Player Selection Status):
                </div>
                <div>{getSelectionBadge(result.selectionStatus, result.selectionStatusKannada)}</div>
              </div>

              {/* Payment status */}
              <div className="flex items-center justify-between p-3.5 bg-[#0e2444] rounded-xl border border-gray-700 text-sm">
                <span className="text-gray-300 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#fbbf24]" />
                  <span>ನೋಂದಣಿ ಶುಲ್ಕ ಪಾವತಿ:</span>
                </span>
                <div>{getPaymentBadge(result.paymentStatus, result.paymentStatusKannada)}</div>
              </div>

              {/* Player category */}
              <div className="flex items-center justify-between p-3.5 bg-[#0e2444] rounded-xl border border-gray-700 text-sm">
                <span className="text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#fbbf24]" />
                  <span>ಆಟಗಾರರ ವಿಭಾಗ:</span>
                </span>
                <span className="font-bold text-[#fbbf24]">{result.categoryKannada}</span>
              </div>

              {/* Registration Date */}
              <div className="flex items-center justify-between p-3.5 bg-[#0e2444] rounded-xl border border-gray-700 text-sm">
                <span className="text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#fbbf24]" />
                  <span>ನೋಂದಾಯಿಸಿದ ದಿನಾಂಕ:</span>
                </span>
                <span className="text-gray-200">
                  {new Date(result.registrationDate).toLocaleDateString('kn-IN')}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed text-center">
              * ಆಡಳಿತ ಮಂಡಳಿಯು ಅಂತಿಮ ತಂಡಗಳನ್ನು ಪ್ರಕಟಿಸಿದ ನಂತರ ಆಯ್ಕೆಯಾದ ಆಟಗಾರರಿಗೆ ಪ್ರತ್ಯೇಕವಾಗಿ ಕರೆ ಮಾಡಿ ಮಾಹಿತಿ ನೀಡಲಾಗುತ್ತದೆ.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
