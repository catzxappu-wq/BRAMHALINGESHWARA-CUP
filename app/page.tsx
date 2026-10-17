'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trophy,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Phone,
  Flame,
  Award,
  ArrowRight,
  ShieldAlert,
  Users,
  Coins,
  Sparkles,
} from 'lucide-react';

interface TournamentData {
  name: string;
  edition: string;
  season: string;
  dates: string;
  venue: string;
  firstPrize: string;
  secondPrize: string;
  contactName1: string;
  contactNumber1: string;
  contactName2: string;
  contactNumber2: string;
  rules: string[];
  registrationFee: number;
  registrationOpen: boolean;
  registrationCapacity: number;
  registrationDeadline: string | null;
  canRegister: boolean;
  remainingSlots: number;
  totalRegistered: number;
  reasonKannada?: string;
  isPaymentGatewayConfigured: boolean;
}

export default function HomePage() {
  const [data, setData] = useState<TournamentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.tournament);
        }
      })
      .catch((err) => console.error('Failed to load tournament data:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#06101e] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a1b33] via-[#081528] to-[#06101e] pt-8 pb-16 lg:pt-12 lg:pb-24 border-b border-[#d4af37]/20">
        {/* Stadium Floodlights Glow Effect */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Heading, Details & Action CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Season Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#b91c1c] to-[#7f1d1d] border border-[#fbbf24]/50 shadow-md">
                <Flame className="w-4 h-4 text-[#fbbf24] animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  ಪ್ರಥಮ ವರ್ಷದ ಲೀಗ್ ಮಾದರಿಯ ಕ್ರಿಕೆಟ್ ಪಂದ್ಯಾವಳಿ • {data?.season || 'ಸೀಸನ್ - 01'}
                </span>
              </div>

              {/* Tournament Title */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d4af37] drop-shadow-sm">
                    {data?.name || 'ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್'}
                  </span>
                  <span className="text-2xl sm:text-4xl text-gray-100 font-extrabold block mt-1">
                    {data?.edition || 'ಕ್ರಿಕೆಟ್ ಪಂದ್ಯಾವಳಿ 2026'}
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-gray-300 font-medium max-w-2xl mx-auto lg:mx-0">
                  ಅವಿನಹಳ್ಳಿ ಹೋಬಳಿ ಹಾಗೂ ಗೆಣಸಿನಕುಣಿ ಪರಿಸರದ ಪ್ರತಿಭಾನ್ವಿತ ಆಟಗಾರರ ನಡುವಿನ ರೋಚಕ ಕ್ರಿಕೆಟ್ ಮಹಾಸಂಗ್ರಾಮ!
                </p>
              </div>

              {/* Key Highlights: Dates, Venue, Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-[#0e2444]/80 p-3.5 rounded-xl border border-[#d4af37]/30 flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-[#fbbf24] shrink-0" />
                  <div className="text-left">
                    <div className="text-xs text-gray-400">ಪಂದ್ಯಾವಳಿ ದಿನಾಂಕ</div>
                    <div className="text-sm font-bold text-white">{data?.dates || '20, 21, 22 ನವೆಂಬರ್ 2026'}</div>
                  </div>
                </div>

                <div className="bg-[#0e2444]/80 p-3.5 rounded-xl border border-[#d4af37]/30 flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-[#ef4444] shrink-0" />
                  <div className="text-left">
                    <div className="text-xs text-gray-400">ಸ್ಥಳ (Venue)</div>
                    <div className="text-sm font-bold text-white">{data?.venue || 'ಗೆಣಸಿನಕುಣಿ'}</div>
                  </div>
                </div>

                <div className="bg-[#0e2444]/80 p-3.5 rounded-xl border border-[#d4af37]/30 flex items-center gap-3">
                  <Coins className="w-6 h-6 text-[#22c55e] shrink-0" />
                  <div className="text-left">
                    <div className="text-xs text-gray-400">ನೋಂದಣಿ ಶುಲ್ಕ</div>
                    <div className="text-sm font-bold text-white">
                      ₹{data?.registrationFee ?? 250}/- ಮಾತ್ರ
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Status Indicator & Capacity */}
              <div className="bg-[#0b1b30] p-4 rounded-xl border border-gray-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3.5 w-3.5">
                    {data?.canRegister ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                    )}
                  </span>
                  <div>
                    <div className="text-sm font-bold">
                      {data?.canRegister ? (
                        <span className="text-emerald-400">ಆಟಗಾರರ ನೋಂದಣಿ ತೆರೆದಿದೆ (Open)</span>
                      ) : (
                        <span className="text-red-400">ನೋಂದಣಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ (Closed)</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {data?.canRegister
                        ? `ಉಳಿದಿರುವ ಸ್ಥಾನಗಳು: ${data.remainingSlots} / ${data.registrationCapacity}`
                        : data?.reasonKannada || 'ಹೊಸ ನೋಂದಣಿಗಳನ್ನು ಸ್ವೀಕರಿಸಲಾಗುವುದಿಲ್ಲ'}
                    </div>
                  </div>
                </div>

                {data?.registrationDeadline && (
                  <div className="text-xs text-amber-300 font-medium flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>ಅಂತಿಮ ದಿನಾಂಕ: ನವೆಂಬರ್ 01</span>
                  </div>
                )}
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start">
                <Link
                  href="/register"
                  className={`inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-extrabold shadow-lg transition-all transform hover:-translate-y-0.5 ${
                    data?.canRegister
                      ? 'bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d4af37] text-gray-950 hover:brightness-110 shadow-gold'
                      : 'bg-gray-700 text-gray-300 cursor-not-allowed opacity-80'
                  }`}
                >
                  <Trophy className="w-5 h-5 mr-2 text-gray-950" />
                  <span>ಆಟಗಾರರ ನೋಂದಣಿ ಮಾಡಿ</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>

                <Link
                  href="/status"
                  className="inline-flex items-center justify-center px-7 py-4 rounded-xl text-base font-bold text-white bg-[#0e2444] border-2 border-[#d4af37]/60 hover:bg-[#132d54] hover:border-[#fbbf24] transition-all shadow-md"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2 text-[#fbbf24]" />
                  <span>ನೋಂದಣಿ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Poster Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group w-full max-w-sm sm:max-w-md">
                {/* Glow border ring */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#b91c1c] via-[#fbbf24] to-[#15803d] rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

                <div className="relative rounded-xl overflow-hidden bg-[#0a192f] border-2 border-[#fbbf24]/60 shadow-2xl">
                  <Image
                    src="/images/poster.jpg"
                    alt="ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್ 2026 ಕ್ರಿಕೆಟ್ ಪಂದ್ಯಾವಳಿ ಪೋಸ್ಟರ್"
                    width={720}
                    height={1035}
                    priority
                    className="w-full h-auto object-cover transform hover:scale-[1.02] transition-transform duration-500"
                  />
                  
                  {/* Poster Bottom Bar Badge */}
                  <div className="bg-gradient-to-r from-[#b91c1c] to-[#0a1b33] p-3 text-center border-t border-[#fbbf24]/40">
                    <div className="text-xs text-[#fbbf24] font-bold tracking-wider">
                      ★ ಅಧಿಕೃತ ಪಂದ್ಯಾವಳಿ ಪೋಸ್ಟರ್ ★
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Prize Showcase Section */}
      <section className="py-14 bg-[#081526] border-b border-[#d4af37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#fbbf24]">
              ಪಂದ್ಯಾವಳಿಯ ಗೌರವ ಬಹುಮಾನಗಳು
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              ಆಕರ್ಷಕ ನಗದು ಬಹುಮಾನ ಹಾಗೂ ಪಾರಿತೋಷಕ
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#b91c1c] via-[#fbbf24] to-[#b91c1c] mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* 1st Prize Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a130b] via-[#0e213d] to-[#1a0a0a] border-2 border-[#fbbf24] p-6 sm:p-8 shadow-gold text-center group hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-[#fbbf24] to-[#d4af37] text-gray-950 font-black text-xs px-4 py-1 rounded-bl-lg uppercase tracking-wider">
                1st Prize
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-[#b91c1c] to-[#fbbf24] p-1 flex items-center justify-center shadow-lg">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-[#fef08a]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-200">ಪ್ರಥಮ ಬಹುಮಾನ</h3>
              <div className="text-3xl sm:text-5xl font-black text-[#fbbf24] my-2 drop-shadow-md">
                {data?.firstPrize || '₹28,888/-'}
              </div>
              <p className="text-sm font-semibold text-gray-300">
                ಹಾಗೂ ಆಕರ್ಷಕ ಶಾಶ್ವತ ಪಾರಿತೋಷಕ 🏆
              </p>
            </div>

            {/* 2nd Prize Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e213d] via-[#101f35] to-[#151a24] border-2 border-[#d4af37]/80 p-6 sm:p-8 shadow-lg text-center group hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute top-0 right-0 bg-[#d4af37] text-gray-950 font-black text-xs px-4 py-1 rounded-bl-lg uppercase tracking-wider">
                2nd Prize
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-[#1e3a8a] to-[#d4af37] p-1 flex items-center justify-center shadow-lg">
                <Award className="w-10 h-10 sm:w-12 sm:h-12 text-[#fef08a]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-200">ದ್ವಿತೀಯ ಬಹುಮಾನ</h3>
              <div className="text-3xl sm:text-5xl font-black text-[#fef08a] my-2 drop-shadow-md">
                {data?.secondPrize || '₹18,888/-'}
              </div>
              <p className="text-sm font-semibold text-gray-300">
                ಹಾಗೂ ಆಕರ್ಷಕ ಶಾಶ್ವತ ಪಾರಿತೋಷಕ 🏆
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rules & Important Notices Section */}
      <section className="py-14 bg-[#06101e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-[#0a1b33] rounded-2xl border-2 border-[#d4af37]/40 p-6 sm:p-10 shadow-xl">
            <div className="flex items-center gap-3 mb-6 border-b border-[#d4af37]/30 pb-4">
              <div className="w-10 h-10 rounded-lg bg-[#b91c1c] flex items-center justify-center text-white">
                <ShieldAlert className="w-6 h-6 text-[#fbbf24]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  ಪಂದ್ಯಾವಳಿಯ ಪ್ರಮುಖ ಸೂಚನೆಗಳು ಮತ್ತು ನಿಯಮಗಳು
                </h2>
                <p className="text-xs sm:text-sm text-[#d4af37]">
                  (ಪೋಸ್ಟರ್‌ನಲ್ಲಿ ತಿಳಿಸಲಾದಂತೆ ಕಡ್ಡಾಯವಾಗಿ ಪಾಲಿಸಬೇಕಾದ ನಿಯಮಗಳು)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data?.rules && data.rules.length > 0 ? data.rules : [
                "ಅವಿನಹಳ್ಳಿ ಹೋಬಳಿ ಮಟ್ಟದ 9 ಹರಾಜಿನ ತಂಡಗಳು",
                "ಒಂದೇ ಊರಿನ 9 ಐ ಡಿ ಗ್ರಾಮಾಂತರ ತಂಡಗಳಿಗೆ ಮಾತ್ರ ಅವಕಾಶ",
                "ಚೆಕ್ ಬೌಲರ್ ಗಳಿಗೆ ಅವಕಾಶ ಇರುವುದಿಲ್ಲ",
                "ಊಟದ ವ್ಯವಸ್ಥೆ ಇರುತ್ತದೆ",
                "ಐ ಡಿ ತಂಡಗಳಿಗೆ ಹೆಸರು ನೋಂದಾಯಿಸಲು ಕೊನೆಯ ದಿನಾಂಕ : ನವೆಂಬರ್ 01",
                "ಐ ಡಿ ಕಾರ್ಡ್ ಅಂಡ್ ಆಧಾರ್ ಕಾರ್ಡ್ ಕಡ್ಡಾಯ"
              ]).map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 bg-[#0e2444]/60 p-4 rounded-xl border border-gray-700 hover:border-[#fbbf24]/50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#b91c1c] to-[#991b1b] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-[#fbbf24]/40">
                    {idx + 1}
                  </div>
                  <span className="text-sm font-semibold text-gray-200 leading-snug">
                    {rule}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-amber-200">
              <span className="font-bold">ಗಮನಿಸಿ:</span> ಆಟಗಾರರು ನೋಂದಣಿ ಸಮಯದಲ್ಲಿ ನೀಡುವ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮತ್ತು ವಿವರಗಳನ್ನು ಅಂತಿಮ ಆಯ್ಕೆ ಮತ್ತು ಹರಾಜು ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ ಬಳಸಲಾಗುತ್ತದೆ. ಪಂದ್ಯಾವಳಿಯ ದಿನದಂದು ಅಸಲಿ ಆಧಾರ್ ಕಾರ್ಡ್ ಅಥವಾ ಐ ಡಿ ಕಾರ್ಡ್ ಹಾಜರುಪಡಿಸುವುದು ಕಡ್ಡಾಯ.
            </div>
          </div>
        </div>
      </section>

      {/* Organizers & Contact Section */}
      <section className="py-12 bg-gradient-to-b from-[#06101e] to-[#040913] border-t border-[#d4af37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-3xl font-extrabold text-white mb-2">
            ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ಆಯೋಜಕರನ್ನು ಸಂಪರ್ಕಿಸಿ
          </h2>
          <p className="text-sm text-gray-400 mb-8">
            ಯಾವುದೇ ಸಂದೇಹ ಅಥವಾ ನೋಂದಣಿ ಸಂಬಂಧಿತ ಮಾಹಿತಿಗಾಗಿ ಕೆಳಗಿನ ಸಂಖ್ಯೆಗಳಿಗೆ ಕರೆ ಮಾಡಿ
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Contact 1 */}
            <a
              href={`tel:${data?.contactNumber1 || '9632520611'}`}
              className="group bg-[#0a1b33] p-6 rounded-2xl border border-[#d4af37]/40 hover:border-[#fbbf24] shadow-md hover:shadow-gold transition-all duration-300 flex items-center justify-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#15803d] to-[#22c55e] flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-400">ಆಯೋಜಕರು</div>
                <div className="text-lg font-black text-white">{data?.contactName1 || 'ತೀರ್ಥೇಶ್‌'}</div>
                <div className="text-base font-bold text-[#fbbf24]">
                  {data?.contactNumber1 || '9632520611'}
                </div>
              </div>
            </a>

            {/* Contact 2 */}
            <a
              href={`tel:${data?.contactNumber2 || '9606467726'}`}
              className="group bg-[#0a1b33] p-6 rounded-2xl border border-[#d4af37]/40 hover:border-[#fbbf24] shadow-md hover:shadow-gold transition-all duration-300 flex items-center justify-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#15803d] to-[#22c55e] flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-400">ಆಯೋಜಕರು</div>
                <div className="text-lg font-black text-white">{data?.contactName2 || 'ಪ್ರಜ್ವಲ್ PK'}</div>
                <div className="text-base font-bold text-[#fbbf24]">
                  {data?.contactNumber2 || '9606467726'}
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
