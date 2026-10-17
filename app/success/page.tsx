'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Copy,
  Printer,
  ArrowRight,
  Calendar,
  MapPin,
  Sparkles,
  Check,
  RefreshCw,
} from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || 'SBK26-000001';
  const name = searchParams.get('name') || 'ಆಟಗಾರರು';

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1b33] via-[#081526] to-[#06101e] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div id="print-area" className="bg-[#0a192f] rounded-3xl border-2 border-[#fbbf24] p-6 sm:p-10 shadow-gold relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#b91c1c] via-[#fbbf24] to-[#15803d]" />

          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-[#15803d] to-[#22c55e] p-1 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ಶುಲ್ಕ ಪಾವತಿ ಮತ್ತು ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white">
            ಅಭಿನಂದನೆಗಳು! <span className="text-[#fbbf24]">{decodeURIComponent(name)}</span>
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್ 2026 ಕ್ರಿಕೆಟ್ ಪಂದ್ಯಾವಳಿಗೆ ನಿಮ್ಮ ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ.
          </p>

          <div className="my-8 p-6 rounded-2xl bg-gradient-to-br from-[#1a140b] via-[#0f2444] to-[#1a0f0f] border-2 border-[#d4af37] shadow-inner text-center">
            <div className="text-xs uppercase tracking-widest text-[#d4af37] font-extrabold mb-1">
              ನಿಮ್ಮ ಅನನ್ಯ ನೋಂದಣಿ ಕೋಡ್ (Unique Registration Code)
            </div>
            <div className="text-3xl sm:text-4xl font-black text-[#fbbf24] tracking-wider my-2 font-mono selection:bg-yellow-300 selection:text-black">
              {code}
            </div>
            <p className="text-xs text-amber-200/90 font-medium mt-1">
              * ನಿಮ್ಮ ಆಯ್ಕೆಯ ಸ್ಥಿತಿ (Selection Status) ತಿಳಿಯಲು ಈ ಕೋಡ್ ಕಡ್ಡಾಯವಾಗಿದೆ.
            </p>

            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#132d54] hover:bg-[#1a3a6b] text-white border border-[#d4af37]/40 shadow-sm transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">ಕೋಡ್ ಕಾಪಿಯಾಗಿದೆ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#fbbf24]" />
                    <span>ಕೋಡ್ ಕಾಪಿ ಮಾಡಿ (Copy Code)</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#132d54] hover:bg-[#1a3a6b] text-white border border-gray-600 shadow-sm transition-all"
              >
                <Printer className="w-4 h-4 text-[#fbbf24]" />
                <span>ಪ್ರಿಂಟ್ / PDF ಉಳಿಸಿ</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left text-xs mb-6">
            <div className="bg-[#0e2444]/60 p-3 rounded-xl border border-gray-700/60 flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-[#fbbf24] shrink-0" />
              <div>
                <div className="text-gray-400">ದಿನಾಂಕ:</div>
                <div className="font-bold text-white">20, 21, 22 ನವೆಂಬರ್ 2026</div>
              </div>
            </div>

            <div className="bg-[#0e2444]/60 p-3 rounded-xl border border-gray-700/60 flex items-center gap-2.5">
              <MapPin className="w-5 h-5 text-[#ef4444] shrink-0" />
              <div>
                <div className="text-gray-400">ಸ್ಥಳ:</div>
                <div className="font-bold text-white">ಗೆಣಸಿನಕುಣಿ</div>
              </div>
            </div>
          </div>

          <div className="text-left bg-blue-950/40 border border-blue-500/30 p-4 rounded-xl text-xs text-blue-200 leading-relaxed mb-6">
            <div className="font-bold text-white mb-1">ಮುಖ್ಯ ಸೂಚನೆ:</div>
            ೧. ಪಂದ್ಯಾವಳಿ ಸಮಿತಿಯು ಆಟಗಾರರ ಪಟ್ಟಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಶೀಘ್ರದಲ್ಲೇ ಅಂತಿಮ ತಂಡಗಳ ಹರಾಜು ಮತ್ತು ಆಯ್ಕೆ ಪಟ್ಟಿಯನ್ನು ಪ್ರಕಟಿಸಲಿದೆ.<br />
            ೨. ನಿಮ್ಮ ನೋಂದಣಿ ಕೋಡ್ ಅನ್ನು ಭದ್ರವಾಗಿ ಇರಿಸಿಕೊಳ್ಳಿ. 'ನೋಂದಣಿ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ' ಪುಟದಲ್ಲಿ ಈ ಕೋಡ್ ನಮೂದಿಸಿ ನಿಮ್ಮ ಆಯ್ಕೆಯ ಫಲಿತಾಂಶವನ್ನು ವೀಕ್ಷಿಸಬಹುದು.
          </div>

          <div className="space-y-3">
            <Link
              href="/status"
              className="w-full inline-flex items-center justify-center py-3.5 px-6 rounded-xl text-sm font-extrabold bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d4af37] text-gray-950 hover:brightness-110 shadow-gold transition-all"
            >
              <span>ಆಯ್ಕೆಯ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ (Check Selection Status)</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>

            <Link
              href="/"
              className="inline-block text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            >
              ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ (Back to Homepage)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#06101e] flex items-center justify-center py-20 text-[#fbbf24]">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
