'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  User,
  Phone,
  MapPin,
  Camera,
  Upload,
  AlertCircle,
  CheckCircle,
  Coins,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  // Form states
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [playerCategory, setPlayerCategory] = useState('batsman');

  // Photo upload states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoStorageKey, setPhotoStorageKey] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Tournament settings
  const [fee, setFee] = useState<number>(250);
  const [canRegister, setCanRegister] = useState<boolean>(true);
  const [remainingSlots, setRemainingSlots] = useState<number>(100);
  const [closureReason, setClosureReason] = useState<string>('');
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Form submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.tournament) {
          setFee(data.tournament.registrationFee);
          setCanRegister(data.tournament.canRegister);
          setRemainingSlots(data.tournament.remainingSlots);
          setClosureReason(data.tournament.reasonKannada || '');
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingSettings(false));
  }, []);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = document.createElement('img');
        img.onload = () => {
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        };
        img.onerror = () => {
          resolve((readerEvent.target?.result as string) || '');
        };
        img.src = (readerEvent.target?.result as string) || '';
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('ಭಾವಚಿತ್ರದ ಗಾತ್ರವು 5 MB ಗಿಂತ ಕಡಿಮೆಯಿರಬೇಕು.');
      return;
    }

    // Check format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('ದಯವಿಟ್ಟು JPG, PNG ಅಥವಾ WEBP ಫಾರ್ಮ್ಯಾಟ್ ಭಾವಚಿತ್ರವನ್ನು ಮಾತ್ರ ಅಪ್ಲೋಡ್ ಮಾಡಿ.');
      return;
    }

    setErrorMessage('');
    setPhotoFile(file);

    // Compress client-side and set preview & photoStorageKey immediately
    setUploadingPhoto(true);
    try {
      const compressedUrl = await compressImage(file);
      setPhotoPreview(compressedUrl);
      setPhotoStorageKey(compressedUrl); // Valid immediately, so user is never blocked!

      // Also attempt server upload in background if available
      const formData = new FormData();
      formData.append('photo', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.photoStorageKey) {
          setPhotoStorageKey(data.photoStorageKey);
        }
      }
    } catch (err) {
      console.warn('Background upload note:', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!canRegister) {
      setErrorMessage(closureReason || 'ಪ್ರಸ್ತುತ ನೋಂದಣಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validations
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (ಕನಿಷ್ಠ 2 ಅಕ್ಷರಗಳು).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const cleanMobile = mobileNumber.trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setErrorMessage('ದಯವಿಟ್ಟು ಸರಿಯಾದ 10 ಅಂಕಿಗಳ ಭಾರತೀಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ (ಉದಾ: 9876543210).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!address.trim() || address.trim().length < 5) {
      setErrorMessage('ದಯವಿಟ್ಟು ಪೂರ್ಣ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ (ಕನಿಷ್ಠ 5 ಅಕ್ಷರಗಳು).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!photoStorageKey) {
      setErrorMessage('ದಯವಿಟ್ಟು ನಿಮ್ಮ ಭಾವಚಿತ್ರವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobileNumber: cleanMobile,
          address: address.trim(),
          playerCategory,
          photoStorageKey,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setErrorMessage(result.message || 'ನೋಂದಣಿ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.');
        setSubmitting(false);
        return;
      }

      // If registered successfully, navigate to payment page
      router.push(`/payment?playerId=${result.playerId}`);
    } catch (err) {
      setErrorMessage('ಸರ್ವರ್ ಸಂಪರ್ಕದಲ್ಲಿ ದೋಷ. ದಯವಿಟ್ಟು ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ.');
      setSubmitting(false);
    }
  };

  if (loadingSettings) {
    return (
      <div className="min-h-screen bg-[#06101e] flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-[#fbbf24]">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-base font-semibold">ಮಾಹಿತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1b33] via-[#081526] to-[#06101e] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#b91c1c]/40 border border-[#fbbf24]/40 text-[#fbbf24] text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ಅಧಿಕೃತ ಆಟಗಾರರ ನೋಂದಣಿ ನಮೂನೆ</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            ಆಟಗಾರರ ನೋಂದಣಿ — <span className="text-[#fbbf24]">2026</span>
          </h1>
          <p className="text-sm text-gray-300 mt-2">
            ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್ ಕ್ರಿಕೆಟ್ ಪಂದ್ಯಾವಳಿ - ಸೀಸನ್ 01
          </p>
        </div>

        {/* Capacity Alert if closed */}
        {!canRegister && (
          <div className="mb-6 p-5 rounded-2xl bg-red-950/80 border-2 border-red-500 flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-base font-bold text-red-200">
                ನೋಂದಣಿ ಪ್ರಸ್ತುತ ಲಭ್ಯವಿಲ್ಲ
              </div>
              <p className="text-sm text-red-300 mt-1">
                {closureReason || 'ಗರಿಷ್ಠ ನೋಂದಣಿ ಮಿತಿ ತಲುಪಿರುವುದರಿಂದ ಹೊಸ ನೋಂದಣಿಗಳನ್ನು ಸ್ವೀಕರಿಸಲಾಗುವುದಿಲ್ಲ.'}
              </p>
            </div>
          </div>
        )}

        {/* Registration Card */}
        <div className="bg-[#0a192f] rounded-2xl border-2 border-[#d4af37]/40 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Gold banner strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#b91c1c] via-[#fbbf24] to-[#15803d]" />

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex items-start gap-3 text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field 1: Full Name */}
            <div>
              <label className="block text-sm font-bold text-gray-200 mb-2">
                ೧. ಆಟಗಾರರ ಪೂರ್ಣ ಹೆಸರು (Full Name) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-5 h-5 text-[#fbbf24]" />
                </div>
                <input
                  type="text"
                  required
                  disabled={!canRegister || submitting}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ"
                  className="w-full pl-11 pr-4 py-3 bg-[#0e2444] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition-colors"
                />
              </div>
            </div>

            {/* Field 2: Mobile Number */}
            <div>
              <label className="block text-sm font-bold text-gray-200 mb-2">
                ೨. ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Mobile Number) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-5 h-5 text-[#fbbf24]" />
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  disabled={!canRegister || submitting}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ"
                  className="w-full pl-11 pr-4 py-3 bg-[#0e2444] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition-colors"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                * ಪಂದ್ಯಾವಳಿ ಸಂದೇಶಗಳು ಮತ್ತು ಆಯ್ಕೆ ಮಾಹಿತಿಯನ್ನು ಇದೇ ಸಂಖ್ಯೆಗೆ ಕಳುಹಿಸಲಾಗುತ್ತದೆ.
              </p>
            </div>

            {/* Field 3: Full Address */}
            <div>
              <label className="block text-sm font-bold text-gray-200 mb-2">
                ೩. ಪೂರ್ಣ ವಿಳಾಸ (Full Address) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-3.5 left-3.5 pointer-events-none text-gray-400">
                  <MapPin className="w-5 h-5 text-[#fbbf24]" />
                </div>
                <textarea
                  required
                  rows={2}
                  disabled={!canRegister || submitting}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ನಿಮ್ಮ ಊರು / ಗ್ರಾಮ, ತಾಲೂಕು ಮತ್ತು ಪಿನ್‌ಕೋಡ್"
                  className="w-full pl-11 pr-4 py-3 bg-[#0e2444] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition-colors"
                />
              </div>
            </div>

            {/* Field 4: Player Category */}
            <div>
              <label className="block text-sm font-bold text-gray-200 mb-2">
                ೪. ಆಟಗಾರರ ವಿಭಾಗ (Player Category) <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'batsman', label: 'ಬ್ಯಾಟ್ಸ್ಮನ್', desc: 'Batsman' },
                  { id: 'bowler', label: 'ಬೌಲರ್', desc: 'Bowler' },
                  { id: 'all_rounder', label: 'ಆಲ್ರೌಂಡರ್', desc: 'All-Rounder' },
                ].map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    disabled={!canRegister || submitting}
                    onClick={() => setPlayerCategory(cat.id)}
                    className={`py-3 px-2 rounded-xl border text-center transition-all ${
                      playerCategory === cat.id
                        ? 'bg-gradient-to-r from-[#b91c1c] to-[#991b1b] border-[#fbbf24] text-white font-bold shadow-md'
                        : 'bg-[#0e2444] border-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-sm font-bold">{cat.label}</div>
                    <div className="text-xs opacity-75">{cat.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Field 5: Player Photograph Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-200 mb-2">
                ೫. ಆಟಗಾರರ ಭಾವಚಿತ್ರ (Player Photograph) <span className="text-red-400">*</span>
              </label>

              <div className="border-2 border-dashed border-gray-700 hover:border-[#fbbf24] rounded-2xl p-4 sm:p-6 bg-[#0e2444]/60 text-center transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoSelect}
                  disabled={!canRegister || submitting || uploadingPhoto}
                  className="hidden"
                />

                {photoPreview ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden border-2 border-[#fbbf24] shadow-md mb-3">
                      <Image
                        src={photoPreview}
                        alt="ಆಟಗಾರರ ಭಾವಚಿತ್ರ ಮುನ್ನೋಟ"
                        fill
                        className="object-cover"
                      />
                    </div>
                    {uploadingPhoto ? (
                      <div className="flex items-center gap-2 text-sm text-[#fbbf24]">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>ಭಾವಚಿತ್ರ ಅಪ್ಲೋಡ್ ಆಗುತ್ತಿದೆ...</span>
                      </div>
                    ) : photoStorageKey ? (
                      <div className="flex items-center gap-2 text-sm text-emerald-400 font-semibold mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>ಭಾವಚಿತ್ರ ಯಶಸ್ವಿಯಾಗಿ ಅಪ್ಲೋಡ್ ಆಗಿದೆ</span>
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto || submitting}
                      className="px-4 py-1.5 text-xs font-semibold bg-[#132d54] hover:bg-[#1a3a6b] text-gray-200 rounded-lg border border-gray-600 transition-colors"
                    >
                      ಭಾವಚಿತ್ರ ಬದಲಾಯಿಸಿ (Change Photo)
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer py-4 flex flex-col items-center justify-center space-y-2"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#132d54] flex items-center justify-center text-[#fbbf24] shadow-inner">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div className="text-sm font-semibold text-gray-200">
                      ಭಾವಚಿತ್ರ ಆಯ್ಕೆ ಮಾಡಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ
                    </div>
                    <div className="text-xs text-gray-400">
                      ಫೋನ್ ಗ್ಯಾಲರಿ ಅಥವಾ ಕ್ಯಾಮರಾ ಮೂಲಕ JPG, PNG, WEBP (ಗರಿಷ್ಠ 5 MB)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Field 6: Registration Fee Summary (Fixed, client cannot alter) */}
            <div className="bg-[#0b1c36] p-4 rounded-xl border border-[#d4af37]/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/40 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-[#fbbf24]" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">೬. ನೋಂದಣಿ ಶುಲ್ಕ (Registration Fee)</div>
                  <div className="text-lg font-black text-white">₹{fee}/- ಮಾತ್ರ</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
                  ಆನ್‌ಲೈನ್ ಪಾವತಿ
                </span>
              </div>
            </div>

            {/* Inline Error Banner above Submit */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-950/90 border-2 border-red-500 flex items-start gap-3 text-red-200 text-sm shadow-lg">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-red-300 mb-0.5">ಸೂಚನೆ (ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ):</div>
                  <div className="text-white font-medium">{errorMessage}</div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!canRegister || submitting || uploadingPhoto}
              className={`w-full py-4 px-6 rounded-xl text-base font-extrabold flex items-center justify-center gap-2 shadow-gold transition-all transform hover:-translate-y-0.5 ${
                canRegister && !submitting && !uploadingPhoto
                  ? 'bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d4af37] text-gray-950 hover:brightness-110'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-gray-950" />
                  <span>ನೋಂದಣಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...</span>
                </>
              ) : (
                <>
                  <span>ಮುಂದಿನ ಹಂತ — ಶುಲ್ಕ ಪಾವತಿ (Proceed to Payment)</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 pt-4 border-t border-gray-800 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#fbbf24]" />
            <span>ನಿಮ್ಮ ವಿವರಗಳು ಮತ್ತು ಪಾವತಿ ಸಂಪೂರ್ಣವಾಗಿ ಸುರಕ್ಷಿತವಾಗಿರುತ್ತದೆ.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
