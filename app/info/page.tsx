'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Trophy,
  Calendar,
  MapPin,
  ShieldCheck,
  Award,
  Phone,
  Flame,
  CheckCircle,
  Users,
  Coins,
  ArrowRight,
} from 'lucide-react';

export default function InfoPage() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.tournament);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const defaultRules = [
    "ಅವಿನಹಳ್ಳಿ ಹೋಬಳಿ ಮಟ್ಟದ 9 ಹರಾಜಿನ ತಂಡಗಳು",
    "ಒಂದೇ ಊರಿನ 9 ಐ ಡಿ ಗ್ರಾಮಾಂತರ ತಂಡಗಳಿಗೆ ಮಾತ್ರ ಅವಕಾಶ",
    "ಚೆಕ್ ಬೌಲರ್ ಗಳಿಗೆ ಅವಕಾಶ ಇರುವುದಿಲ್ಲ",
    "ಊಟದ ವ್ಯವಸ್ಥೆ ಇರುತ್ತದೆ",
    "ಐ ಡಿ ತಂಡಗಳಿಗೆ ಹೆಸರು ನೋಂದಾಯಿಸಲು ಕೊನೆಯ ದಿನಾಂಕ : ನವೆಂಬರ್ 01",
    "ಐ ಡಿ ಕಾರ್ಡ್ ಅಂಡ್ ಆಧಾರ್ ಕಾರ್ಡ್ ಕಡ್ಡಾಯ"
  ];

  const rules = settings?.rules?.length > 0 ? settings.rules : defaultRules;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1b33] via-[#081526] to-[#06101e] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#b91c1c] to-[#7f1d1d] border border-[#fbbf24]/50 shadow-md mb-3">
            <Flame className="w-4 h-4 text-[#fbbf24]" />
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
              {settings?.season || 'ಸೀಸನ್ - 01'} • ಗೆಣಸಿನಕುಣಿ
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            {settings?.name || 'ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್'}
          </h1>
          <p className="text-lg text-[#fbbf24] font-bold mt-1">
            {settings?.edition || 'ಕ್ರಿಕೆಟ್ ಪಂದ್ಯಾವಳಿ 2026'}
          </p>
          <p className="text-sm text-gray-300 max-w-2xl mx-auto mt-2">
            ಅವಿನಹಳ್ಳಿ ಹೋಬಳಿ ಮತ್ತು ಗ್ರಾಮಾಂತರ ಮಟ್ಟದ ಲೀಗ್ ಮಾದರಿಯ ಪ್ರತಿಷ್ಠಿತ ಕ್ರಿಕೆಟ್ ಹಬ್ಬದ ಸಂಪೂರ್ಣ ಅಧಿಕೃತ ನಿಯಮಗಳು ಹಾಗೂ ವಿವರಗಳು.
          </p>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0a192f] p-5 rounded-2xl border border-[#d4af37]/40 shadow-md">
            <Calendar className="w-7 h-7 text-[#fbbf24] mb-2" />
            <div className="text-xs text-gray-400">ಪಂದ್ಯಾವಳಿಯ ದಿನಾಂಕಗಳು</div>
            <div className="text-base font-black text-white mt-1">
              {settings?.dates || '20, 21, 22 ನವೆಂಬರ್ 2026'}
            </div>
          </div>

          <div className="bg-[#0a192f] p-5 rounded-2xl border border-[#d4af37]/40 shadow-md">
            <MapPin className="w-7 h-7 text-[#ef4444] mb-2" />
            <div className="text-xs text-gray-400">ಪಂದ್ಯಾವಳಿ ಸ್ಥಳ (Venue)</div>
            <div className="text-base font-black text-white mt-1">
              {settings?.venue || 'ಗೆಣಸಿನಕುಣಿ'}
            </div>
          </div>

          <div className="bg-[#0a192f] p-5 rounded-2xl border border-[#d4af37]/40 shadow-md">
            <Trophy className="w-7 h-7 text-[#fbbf24] mb-2" />
            <div className="text-xs text-gray-400">ಪ್ರಥಮ ಬಹುಮಾನ</div>
            <div className="text-base font-black text-[#fbbf24] mt-1">
              {settings?.firstPrize || '₹28,888/- + ಟ್ರೋಫಿ'}
            </div>
          </div>

          <div className="bg-[#0a192f] p-5 rounded-2xl border border-[#d4af37]/40 shadow-md">
            <Award className="w-7 h-7 text-[#fef08a] mb-2" />
            <div className="text-xs text-gray-400">ದ್ವಿತೀಯ ಬಹುಮಾನ</div>
            <div className="text-base font-black text-[#fef08a] mt-1">
              {settings?.secondPrize || '₹18,888/- + ಟ್ರೋಫಿ'}
            </div>
          </div>
        </div>

        {/* Poster Showcase and Rules in 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Poster image */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border-2 border-[#fbbf24] shadow-2xl bg-[#0a192f]">
              <Image
                src="/images/poster.jpg"
                alt="ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್ ಪೋಸ್ಟರ್"
                width={720}
                height={1035}
                className="w-full h-auto object-cover"
              />
              <div className="p-3 bg-[#0e2444] text-center border-t border-[#fbbf24]/30">
                <span className="text-xs text-[#d4af37] font-bold">
                  ಮೂಲ ಆಹ್ವಾನ ಪತ್ರಿಕೆ (Official Poster)
                </span>
              </div>
            </div>
          </div>

          {/* Rules Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#0a192f] rounded-2xl border-2 border-[#d4af37]/40 p-6 sm:p-8 shadow-xl">
              <h2 className="text-xl sm:text-2xl font-black text-white mb-6 flex items-center gap-2 border-b border-gray-700 pb-3">
                <ShieldCheck className="w-6 h-6 text-[#fbbf24]" />
                <span>ಪಂದ್ಯಾವಳಿಯ ಪ್ರಮುಖ ನಿಬಂಧನೆಗಳು (Rules)</span>
              </h2>

              <div className="space-y-4">
                {rules.map((rule: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-[#0e2444] p-3.5 rounded-xl border border-gray-700/60"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#b91c1c] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-[#fbbf24]">
                      {i + 1}
                    </div>
                    <div className="text-sm font-semibold text-gray-200">{rule}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Food and Facilities note */}
            <div className="bg-gradient-to-r from-[#14532d] to-[#0e2444] rounded-2xl border border-emerald-500/40 p-6 text-white shadow-md">
              <h3 className="text-lg font-bold text-[#fef08a] mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>ವಿಶೇಷ ಸೌಲಭ್ಯಗಳು:</span>
              </h3>
              <p className="text-sm text-gray-200 leading-relaxed">
                ಪಂದ್ಯಾವಳಿಯ ಎಲ್ಲ ದಿನಗಳಲ್ಲೂ ಆಟಗಾರರಿಗೆ ಮತ್ತು ತಂಡಗಳಿಗೆ ರುಚಿಕರವಾದ ಊಟದ ವ್ಯವಸ್ಥೆ ಮಾಡಲಾಗಿರುತ್ತದೆ. ಪಂದ್ಯಾವಳಿಯು ಶಿಸ್ತುಬದ್ಧವಾಗಿ ನಡೆಯಲಿದ್ದು, ಎಲ್ಲ ಪಂದ್ಯಗಳಿಗೆ ಅಧಿಕೃತ ಅಂಪೈರ್‌ಗಳು ನಿರ್ಣಯ ನೀಡಲಿದ್ದಾರೆ.
              </p>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center py-4 px-6 rounded-xl text-base font-extrabold bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d4af37] text-gray-950 hover:brightness-110 shadow-gold transition-all"
              >
                <span>ಈಗಲೇ ಆಟಗಾರರಾಗಿ ನೋಂದಾಯಿಸಿ (Register Now)</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
