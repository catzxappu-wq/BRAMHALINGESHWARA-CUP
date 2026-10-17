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
  FileCheck2,
  Users2,
  QrCode,
  Copy,
  Check,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  // Form states
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [playerCategory, setPlayerCategory] = useState('batsman');
  const [guidanceBy, setGuidanceBy] = useState('');

  // Player photo upload states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoStorageKey, setPhotoStorageKey] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Payment receipt upload states
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptStorageKey, setReceiptStorageKey] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [transactionReference, setTransactionReference] = useState('');

  // Tournament settings
  const [fee, setFee] = useState<number>(250);
  const [canRegister, setCanRegister] = useState<boolean>(true);
  const [remainingSlots, setRemainingSlots] = useState<number>(100);
  const [closureReason, setClosureReason] = useState<string>('');
  const [loadingSettings, setLoadingSettings] = useState(true);

  // UI helpers
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

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
          const maxDim = 1000;
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

  // 1. Handle Player Photo Select
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('ಭಾವಚಿತ್ರದ ಗಾತ್ರವು 5 MB ಗಿಂತ ಕಡಿಮೆಯಿರಬೇಕು.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('ದಯವಿಟ್ಟು JPG, PNG ಅಥವಾ WEBP ಫಾರ್ಮ್ಯಾಟ್ ಭಾವಚಿತ್ರವನ್ನು ಮಾತ್ರ ಅಪ್ಲೋಡ್ ಮಾಡಿ.');
      return;
    }

    setErrorMessage('');
    setPhotoFile(file);
    setUploadingPhoto(true);

    try {
      const compressedUrl = await compressImage(file);
      setPhotoPreview(compressedUrl);
      setPhotoStorageKey(compressedUrl);

      // Background server upload attempt
      const formData = new FormData();
      formData.append('photo', file);
      fetch('/api/upload', { method: 'POST', body: formData })
        .then((r) => r.json())
        .then((data) => {
          if (data?.success && data?.photoStorageKey) {
            setPhotoStorageKey(data.photoStorageKey);
          }
        })
        .catch(() => {});
    } catch (err) {
      console.warn('Photo processing:', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // 2. Handle Payment Receipt Select
  const handleReceiptSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('ರಶೀದಿಯ ಗಾತ್ರವು 8 MB ಗಿಂತ ಕಡಿಮೆಯಿರಬೇಕು.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('ದಯವಿಟ್ಟು JPG, PNG ಅಥವಾ WEBP ಫಾರ್ಮ್ಯಾಟ್ ರಶೀದಿಯನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ.');
      return;
    }

    setErrorMessage('');
    setReceiptFile(file);
    setUploadingReceipt(true);

    try {
      const compressedUrl = await compressImage(file);
      setReceiptPreview(compressedUrl);
      setReceiptStorageKey(compressedUrl);

      // Background server upload attempt
      const formData = new FormData();
      formData.append('photo', file);
      fetch('/api/upload', { method: 'POST', body: formData })
        .then((r) => r.json())
        .then((data) => {
          if (data?.success && data?.photoStorageKey) {
            setReceiptStorageKey(data.photoStorageKey);
          }
        })
        .catch(() => {});
    } catch (err) {
      console.warn('Receipt processing:', err);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleCopyUpi = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // 3. Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!canRegister) {
      setErrorMessage(closureReason || 'ಪ್ರಸ್ತುತ ನೋಂದಣಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!guidanceBy.trim() || guidanceBy.trim().length < 2) {
      setErrorMessage('ದಯವಿಟ್ಟು ಯಾರ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಈ ಫಾರ್ಮ್ ತುಂಬುತ್ತಿದ್ದೀರಿ ಎಂದು ನಮೂದಿಸಿ.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!receiptStorageKey) {
      setErrorMessage('ದಯವಿಟ್ಟು ಶುಲ್ಕ ಪಾವತಿಯ ರಶೀದಿ / ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ.');
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
          guidanceBy: guidanceBy.trim(),
          paymentReceiptStorageKey: receiptStorageKey,
          transactionReference: transactionReference.trim(),
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setErrorMessage(result.message || 'ನೋಂದಣಿ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.');
        setSubmitting(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Registration is complete! Redirect immediately to success page with unique code
      router.push(`/success?code=${result.registrationCode}&name=${encodeURIComponent(result.fullName)}`);
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#132d54] border border-[#d4af37]/40 text-[#fbbf24] text-xs font-bold mb-3 shadow-md">
            <span>ಸೀಸನ್ - 01</span>
            <span>•</span>
            <span>ಗೆಣಸಿನಕುಣಿ</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-wide">
            ಆಟಗಾರರ ನೋಂದಣಿ (Player Registration)
          </h1>
          <p className="text-sm text-[#d4af37] font-semibold mt-2">
            ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್ ಕ್ರಿಕೆಟ್ ಪಂದ್ಯಾವಳಿ - 2026
          </p>
        </div>

        {/* Capacity Closed Alert */}
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
                  { key: 'batsman', labelKannada: 'ಬ್ಯಾಟ್ಸ್‌ಮನ್', labelEnglish: 'Batsman' },
                  { key: 'bowler', labelKannada: 'ಬೌಲರ್', labelEnglish: 'Bowler' },
                  { key: 'all_rounder', labelKannada: 'ಆಲ್‌ರೌಂಡರ್', labelEnglish: 'All-Rounder' },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    disabled={!canRegister || submitting}
                    onClick={() => setPlayerCategory(cat.key)}
                    className={`py-3 px-2 rounded-xl border text-center transition-all ${
                      playerCategory === cat.key
                        ? 'bg-[#b91c1c] border-[#fbbf24] text-white shadow-md font-bold'
                        : 'bg-[#0e2444] border-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-sm font-bold">{cat.labelKannada}</div>
                    <div className="text-[11px] opacity-75">{cat.labelEnglish}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Field 5: Player Photo Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-200 mb-2">
                ೫. ಆಟಗಾರರ ಭಾವಚಿತ್ರ (Player Photograph) <span className="text-red-400">*</span>
              </label>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={!canRegister || submitting}
                onChange={handlePhotoSelect}
                className="hidden"
              />

              <div
                onClick={() => !photoPreview && photoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  photoPreview
                    ? 'border-[#fbbf24] bg-[#0c2242]'
                    : 'border-gray-700 hover:border-[#fbbf24] bg-[#0e2444]/60 cursor-pointer'
                }`}
              >
                {photoPreview ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-[#fbbf24] shadow-md mb-3">
                      <img
                        src={photoPreview}
                        alt="Player preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {uploadingPhoto ? (
                      <div className="flex items-center gap-2 text-sm text-[#fbbf24]">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>ಭಾವಚಿತ್ರ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-emerald-400 font-semibold mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>ಭಾವಚಿತ್ರ ಸಿದ್ಧವಾಗಿದೆ</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploadingPhoto || submitting}
                      className="px-4 py-1.5 text-xs font-semibold bg-[#132d54] hover:bg-[#1a3a6b] text-gray-200 rounded-lg border border-gray-600 transition-colors"
                    >
                      ಭಾವಚಿತ್ರ ಬದಲಾಯಿಸಿ (Change Photo)
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#132d54] border border-[#d4af37]/40 flex items-center justify-center text-[#fbbf24]">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-gray-200 mb-1">
                      ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ ಭಾವಚಿತ್ರ ಅಪ್ಲೋಡ್ ಮಾಡಿ
                    </div>
                    <div className="text-xs text-gray-400">
                      ಫೋನ್ ಗ್ಯಾಲರಿ ಅಥವಾ ಕ್ಯಾಮರಾ ಮೂಲಕ JPG, PNG, WEBP (ಗರಿಷ್ಠ 5 MB)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Field 6: Guidance Section (NEW REQUEST) */}
            <div>
              <label className="block text-sm font-bold text-gray-200 mb-1">
                ೬. ಯಾರ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಈ ಫಾರ್ಮ್ ತುಂಬುತ್ತಿದ್ದೀರಿ? (Under whose guidance are you filling this form?) <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-[#d4af37] mb-2 font-medium">
                * ಸ್ಥಳೀಯ ತಂಡದ ನಾಯಕ, ಸಮಿತಿ ಆಯೋಜಕರು ಅಥವಾ ಸ್ನೇಹಿತರ ಹೆಸರು / ವಿವರವನ್ನು ನಮೂದಿಸಿ (Team Captain, Organizer, or Friend)
              </p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Users2 className="w-5 h-5 text-[#fbbf24]" />
                </div>
                <input
                  type="text"
                  required
                  disabled={!canRegister || submitting}
                  value={guidanceBy}
                  onChange={(e) => setGuidanceBy(e.target.value)}
                  placeholder="ಉದಾ: ತೀರ್ಥೇಶ್‌ / ಪ್ರಜ್ವಲ್ / ನಾಯಕನ ಹೆಸರು"
                  className="w-full pl-11 pr-4 py-3 bg-[#0e2444] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition-colors"
                />
              </div>
            </div>

            {/* Field 7: Registration Fee & UPI Payment Instructions (NEW REQUEST) */}
            <div className="bg-[#0b1c36] p-5 rounded-2xl border-2 border-[#d4af37]/60 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-700/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/40 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-[#fbbf24]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-semibold">೭. ನೋಂದಣಿ ಶುಲ್ಕ (Registration Fee)</div>
                    <div className="text-xl font-black text-[#fbbf24]">₹{fee}/- ಮಾತ್ರ</div>
                  </div>
                </div>
                <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full font-bold">
                  UPI / QR ಪಾವತಿ
                </span>
              </div>

              {/* Organizers UPI numbers */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[#fbbf24]" />
                  <span>ಶುಲ್ಕ ಪಾವತಿಸಲು PhonePe / Google Pay / Paytm ಸಂಖ್ಯೆಗಳು:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="bg-[#061224] p-3 rounded-xl border border-gray-700/80 flex items-center justify-between">
                    <div>
                      <div className="text-gray-400 font-medium">ತೀರ್ಥೇಶ್‌</div>
                      <div className="font-mono font-bold text-white text-sm">9632520611</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyUpi('9632520611')}
                      className="px-2.5 py-1 rounded-lg bg-[#132d54] hover:bg-[#1a3a6b] text-[#fbbf24] text-[11px] font-bold border border-gray-600"
                    >
                      {copiedUpi ? 'ಕಾಪಿಯಾಗಿದೆ' : 'ಕಾಪಿ'}
                    </button>
                  </div>

                  <div className="bg-[#061224] p-3 rounded-xl border border-gray-700/80 flex items-center justify-between">
                    <div>
                      <div className="text-gray-400 font-medium">ಪ್ರಜ್ವಲ್ PK</div>
                      <div className="font-mono font-bold text-white text-sm">9606467726</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyUpi('9606467726')}
                      className="px-2.5 py-1 rounded-lg bg-[#132d54] hover:bg-[#1a3a6b] text-[#fbbf24] text-[11px] font-bold border border-gray-600"
                    >
                      {copiedUpi ? 'ಕಾಪಿಯಾಗಿದೆ' : 'ಕಾಪಿ'}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-amber-200/90 pt-1">
                  * ಮೇಲಿನ ಯಾವುದಾದರೂ ಸಂಖ್ಯೆಗೆ Google Pay, PhonePe ಅಥವಾ Paytm ಮೂಲಕ ₹{fee}/- ಪಾವತಿಸಿ, ಯಶಸ್ವಿ ಪಾವತಿಯ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅನ್ನು ಕೆಳಗೆ ಅಪ್ಲೋಡ್ ಮಾಡಿ.
                </p>
              </div>
            </div>

            {/* Field 8: Payment Receipt Upload (NEW REQUEST) */}
            <div>
              <label className="block text-sm font-bold text-gray-200 mb-2">
                ೮. ಶುಲ್ಕ ಪಾವತಿಯ ರಸೀದಿ / ಸ್ಕ್ರೀನ್‌ಶಾಟ್ (Payment Receipt / Screenshot) <span className="text-red-400">*</span>
              </label>

              <input
                ref={receiptInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={!canRegister || submitting}
                onChange={handleReceiptSelect}
                className="hidden"
              />

              <div
                onClick={() => !receiptPreview && receiptInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  receiptPreview
                    ? 'border-[#22c55e] bg-[#0c281a]/50'
                    : 'border-[#fbbf24]/60 hover:border-[#fbbf24] bg-[#0e2444]/60 cursor-pointer'
                }`}
              >
                {receiptPreview ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-36 h-48 rounded-xl overflow-hidden border-2 border-emerald-400 shadow-md mb-3">
                      <img
                        src={receiptPreview}
                        alt="Payment receipt preview"
                        className="w-full h-full object-contain bg-black/60"
                      />
                    </div>
                    {uploadingReceipt ? (
                      <div className="flex items-center gap-2 text-sm text-[#fbbf24]">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>ರಶೀದಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-emerald-400 font-semibold mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>ಪಾವತಿ ರಶೀದಿ ಯಶಸ್ವಿಯಾಗಿ ಲಗತ್ತಿಸಲಾಗಿದೆ</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => receiptInputRef.current?.click()}
                      disabled={uploadingReceipt || submitting}
                      className="px-4 py-1.5 text-xs font-semibold bg-[#132d54] hover:bg-[#1a3a6b] text-gray-200 rounded-lg border border-gray-600 transition-colors"
                    >
                      ರಶೀದಿ ಬದಲಾಯಿಸಿ (Change Receipt)
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                      <FileCheck2 className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-white mb-1">
                      ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ ಪಾವತಿಯ ರಸೀದಿ / ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್ಲೋಡ್ ಮಾಡಿ
                    </div>
                    <div className="text-xs text-gray-400">
                      PhonePe / GPay / Paytm ಯಶಸ್ವಿ ಪಾವತಿಯ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ (JPG, PNG, WEBP)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Field 9: Optional Transaction / UTR Number */}
            <div>
              <label className="block text-sm font-bold text-gray-200 mb-1.5">
                ೯. UPI / UTR ವಹಿವಾಟು ಸಂಖ್ಯೆ (Transaction ID / UTR No. - ಐಚ್ಛಿಕ)
              </label>
              <input
                type="text"
                disabled={!canRegister || submitting}
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                placeholder="ಉದಾ: 12 ಅಂಕಿಗಳ UTR ಸಂಖ್ಯೆ (ಲಭ್ಯವಿದ್ದರೆ)"
                className="w-full px-4 py-3 bg-[#0e2444] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition-colors text-sm font-mono"
              />
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
              disabled={!canRegister || submitting || uploadingPhoto || uploadingReceipt}
              className={`w-full py-4 px-6 rounded-xl text-base font-extrabold flex items-center justify-center gap-2 shadow-gold transition-all transform hover:-translate-y-0.5 ${
                canRegister && !submitting && !uploadingPhoto && !uploadingReceipt
                  ? 'bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d4af37] text-gray-950 hover:brightness-110 cursor-pointer'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-gray-950" />
                  <span>ನೋಂದಣಿ ದಾಖಲಿಸಲಾಗುತ್ತಿದೆ...</span>
                </>
              ) : (
                <>
                  <span>ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ (Submit Registration)</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 pt-4 border-t border-gray-800 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#fbbf24]" />
            <span>ನಿಮ್ಮ ವಿವರಗಳು ಮತ್ತು ರಸೀದಿ ಸಮಿತಿಯ ಪರಿಶೀಲನೆಗೆ ಸುರಕ್ಷಿತವಾಗಿ ದಾಖಲಾಗುತ್ತದೆ.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
