'use client';

import React from 'react';
import Link from 'next/link';
import {
  Phone,
  MapPin,
  Calendar,
  MessageCircle,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';

export default function ContactPage() {
  const organizers = [
    {
      name: 'ತೀರ್ಥೇಶ್‌',
      phone: '9632520611',
      role: 'ಮುಖ್ಯ ಆಯೋಜಕರು (Chief Organizer)',
    },
    {
      name: 'ಪ್ರಜ್ವಲ್ PK',
      phone: '9606467726',
      role: 'ಆಯೋಜನಾ ಸಮಿತಿ (Organizing Committee)',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1b33] via-[#081526] to-[#06101e] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-tr from-[#15803d] to-[#22c55e] flex items-center justify-center text-white shadow-lg">
            <Phone className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            ಸಂಪರ್ಕಿಸಿ (Contact Us)
          </h1>
          <p className="text-sm text-gray-300 mt-2">
            ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್ ಕ್ರಿಕೆಟ್ ಪಂದ್ಯಾವಳಿ - 2026, ಗೆಣಸಿನಕುಣಿ
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {organizers.map((org, idx) => (
            <div
              key={idx}
              className="bg-[#0a192f] rounded-2xl border-2 border-[#d4af37]/40 p-6 shadow-xl text-center flex flex-col justify-between hover:border-[#fbbf24] transition-colors"
            >
              <div>
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#132d54] border border-[#d4af37]/50 flex items-center justify-center text-[#fbbf24]">
                  <Phone className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-white">{org.name}</h2>
                <div className="text-xs text-[#d4af37] font-semibold mt-0.5">{org.role}</div>
                <div className="text-2xl font-black text-[#fbbf24] my-4 font-mono">
                  {org.phone}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href={`tel:${org.phone}`}
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-[#15803d] to-[#16a34a] text-white hover:brightness-110 shadow-md transition-all"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  <span>ಕರೆ ಮಾಡಿ (Direct Call)</span>
                </a>

                <a
                  href={`https://wa.me/91${org.phone}?text=${encodeURIComponent(
                    'ನಮಸ್ಕಾರ, ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್ 2026 ಕ್ರಿಕೆಟ್ ಪಂದ್ಯಾವಳಿಯ ನೋಂದಣಿ ಬಗ್ಗೆ ಮಾಹಿತಿ ಬೇಕಾಗಿತ್ತು.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center py-2 px-4 rounded-xl text-xs font-semibold bg-[#132d54] text-gray-200 hover:text-white border border-gray-700 hover:border-emerald-500 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-1.5 text-emerald-400" />
                  <span>WhatsApp ನಲ್ಲಿ ಸಂದೇಶ ಕಳುಹಿಸಿ</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Venue and Event Info Card */}
        <div className="bg-[#0a192f] rounded-2xl border border-gray-700/80 p-6 sm:p-8 shadow-lg">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-800 pb-3">
            <MapPin className="w-5 h-5 text-[#ef4444]" />
            <span>ಪಂದ್ಯಾವಳಿಯ ಸ್ಥಳ ಮತ್ತು ದಿನಾಂಕದ ವಿವರ</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-[#0e2444] p-4 rounded-xl border border-gray-700">
              <div className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#ef4444]" />
                <span>ಕ್ರೀಡಾಂಗಣದ ಸ್ಥಳ (Venue)</span>
              </div>
              <div className="text-lg font-bold text-white">ಗೆಣಸಿನಕುಣಿ ಕ್ರೀಡಾಂಗಣ</div>
              <div className="text-xs text-gray-300 mt-1">
                ಅವಿನಹಳ್ಳಿ ಹೋಬಳಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ, ಕರ್ನಾಟಕ
              </div>
            </div>

            <div className="bg-[#0e2444] p-4 rounded-xl border border-gray-700">
              <div className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#fbbf24]" />
                <span>ಪಂದ್ಯಾವಳಿ ದಿನಾಂಕಗಳು</span>
              </div>
              <div className="text-lg font-bold text-white">20, 21 ಮತ್ತು 22 ನವೆಂಬರ್ 2026</div>
              <div className="text-xs text-amber-300 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>ನೋಂದಣಿಗೆ ಕೊನೆಯ ದಿನ: 01 ನವೆಂಬರ್ 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Help Note */}
        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs sm:text-sm text-blue-200 text-center">
          ನೋಂದಣಿ ಶುಲ್ಕ ಪಾವತಿ, ಆಟಗಾರರ ಆಯ್ಕೆ ಅಥವಾ ಪಂದ್ಯಾವಳಿ ನಿಬಂಧನೆಗಳ ಬಗ್ಗೆ ಯಾವುದೇ ಸಂದೇಹಗಳಿದ್ದಲ್ಲಿ ದಯವಿಟ್ಟು ಮೇಲಿನ ಆಯೋಜಕರ ಸಂಖ್ಯೆಗಳಿಗೆ ನೇರವಾಗಿ ಕರೆ ಮಾಡಿ.
        </div>
      </div>
    </div>
  );
}
