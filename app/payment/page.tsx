'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  CreditCard,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Phone,
  User,
  ArrowLeft,
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const playerId = searchParams.get('playerId');

  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [gatewayNotConfigured, setGatewayNotConfigured] = useState(false);

  useEffect(() => {
    if (!playerId) {
      setErrorMessage('ಆಟಗಾರರ ID ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ನೋಂದಣಿ ನಮೂನೆಯನ್ನು ಮರುಸಲ್ಲಿಸಿ.');
      setLoading(false);
      return;
    }

    fetch(`/api/player-details?playerId=${playerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.player) {
          const found = data.player;
          setPlayer(found);

          if (found.paymentStatus === 'paid' && found.registrationCode) {
            router.push(`/success?code=${found.registrationCode}&name=${encodeURIComponent(found.fullName)}`);
          }
        } else {
          setErrorMessage(data.message || 'ಆಟಗಾರರ ಮಾಹಿತಿ ಲಭ್ಯವಾಗಿಲ್ಲ.');
        }
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage('ಮಾಹಿತಿ ಪಡೆಯುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.');
      })
      .finally(() => setLoading(false));
  }, [playerId, router]);

  const handlePayNow = async () => {
    if (!player) return;
    setProcessingPayment(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id }),
      });

      const data = await res.json();

      if (data.alreadyPaid && data.registrationCode) {
        router.push(`/success?code=${data.registrationCode}&name=${encodeURIComponent(player.fullName)}`);
        return;
      }

      if (!data.isPaymentGatewayConfigured) {
        setGatewayNotConfigured(true);
        setProcessingPayment(false);
        return;
      }

      if (!data.orderId) {
        setErrorMessage(data.message || 'ಪಾವತಿ ಆದೇಶ ರಚಿಸುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.');
        setProcessingPayment(false);
        return;
      }

      if (typeof window.Razorpay === 'undefined') {
        setErrorMessage('Razorpay SDK ಲೋಡ್ ಆಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಪುಟವನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ.');
        setProcessingPayment(false);
        return;
      }

      const options = {
        key: data.razorpayKeyId,
        amount: data.amount * 100,
        currency: data.currency || 'INR',
        name: 'ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್ 2026',
        description: `ಆಟಗಾರರ ನೋಂದಣಿ ಶುಲ್ಕ - ${player.fullName}`,
        image: '/images/poster.jpg',
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                playerId: player.id,
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              router.push(
                `/success?code=${verifyData.registrationCode}&name=${encodeURIComponent(
                  verifyData.fullName || player.fullName
                )}`
              );
            } else {
              setErrorMessage(verifyData.message || 'ಪಾವತಿ ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ.');
              setProcessingPayment(false);
            }
          } catch (verifyErr) {
            console.error('Verify error:', verifyErr);
            setErrorMessage('ಪಾವತಿ ಪರಿಶೀಲನೆಯಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಸಹಾಯವಾಣಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.');
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: player.fullName,
          contact: player.mobileNumber,
        },
        theme: {
          color: '#b91c1c',
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setErrorMessage(`ಪಾವತಿ ವಿಫಲವಾಗಿದೆ: ${resp.error.description || 'ಅಪರಿಚಿತ ದೋಷ'}`);
        setProcessingPayment(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMessage('ಪಾವತಿ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.');
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06101e] flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-[#fbbf24]">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-base font-semibold">ಪಾವತಿ ವಿವರಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...</span>
        </div>
      </div>
    );
  }

  const categoryKannada: Record<string, string> = {
    batsman: 'ಬ್ಯಾಟ್ಸ್ಮನ್',
    bowler: 'ಬೌಲರ್',
    all_rounder: 'ಆಲ್ರೌಂಡರ್',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1b33] via-[#081526] to-[#06101e] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-tr from-[#b91c1c] via-[#d4af37] to-[#fbbf24] p-0.5 shadow-gold">
            <div className="w-full h-full bg-[#0a1b33] rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-[#fbbf24]" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            ನೋಂದಣಿ ಶುಲ್ಕ ಪಾವತಿ (Online Payment)
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್ ಕ್ರಿಕೆಟ್ ಪಂದ್ಯಾವಳಿ - 2026
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex items-start gap-3 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {gatewayNotConfigured && (
          <div className="mb-6 p-5 rounded-2xl bg-amber-950/80 border-2 border-amber-500 flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-base font-bold text-amber-200">
                ಪಾವತಿ ಗೇಟ್‌ವೇ ಕಾನ್ಫಿಗರೇಶನ್ ಅಗತ್ಯವಿದೆ (Setup Required)
              </div>
              <p className="text-sm text-amber-300 mt-1 leading-relaxed">
                ಆನ್‌ಲೈನ್ ಪಾವತಿ ಗೇಟ್‌ವೇ (Razorpay API Keys) ಇನ್ನೂ ಸರ್ವರ್‌ನಲ್ಲಿ ಸಂಯೋಜನೆಗೊಂಡಿಲ್ಲ. ನೈಜ ಪಾವತಿ ಪ್ರಕ್ರಿಯೆಗಾಗಿ ದಯವಿಟ್ಟು ಸರ್ವರ್‌ನ `.env` ಫೈಲ್‌ನಲ್ಲಿ Razorpay Key ID ಮತ್ತು Secret ಕೀಗಳನ್ನು ನಮೂದಿಸಿ.
              </p>
              <div className="mt-3 text-xs text-amber-200/90 font-mono bg-black/40 p-2.5 rounded-lg border border-amber-500/30">
                RAZORPAY_KEY_ID="rzp_test_..."<br />
                RAZORPAY_KEY_SECRET="..."<br />
                NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
              </div>
            </div>
          </div>
        )}

        {player ? (
          <div className="bg-[#0a192f] rounded-2xl border-2 border-[#d4af37]/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="border-b border-gray-700/80 pb-5 mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-[#d4af37] font-semibold">ಆಟಗಾರರ ವಿವರ</div>
                <div className="text-xl font-black text-white">{player.fullName}</div>
              </div>
              {player.photoUrl && (
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#fbbf24] shadow-md relative">
                  <img
                    src={player.photoUrl}
                    alt={player.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex items-center justify-between py-2 border-b border-gray-800 text-gray-300">
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#fbbf24]" />
                  <span>ಮೊಬೈಲ್ ಸಂಖ್ಯೆ:</span>
                </span>
                <span className="font-bold text-white">{player.mobileNumber}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-800 text-gray-300">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#fbbf24]" />
                  <span>ಆಟಗಾರರ ವಿಭಾಗ:</span>
                </span>
                <span className="font-bold text-[#fbbf24]">
                  {categoryKannada[player.playerCategory] || player.playerCategory}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-800 text-gray-300">
                <span>ವಿಳಾಸ:</span>
                <span className="font-medium text-gray-200 text-right max-w-[200px] truncate">
                  {player.address}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-700 text-gray-200 text-base">
                <span className="font-bold text-white">ಒಟ್ಟು ಪಾವತಿಸಬೇಕಾದ ಶುಲ್ಕ:</span>
                <span className="text-2xl font-black text-[#fbbf24]">
                  ₹250.00
                </span>
              </div>
            </div>

            <button
              onClick={handlePayNow}
              disabled={processingPayment}
              className={`w-full py-4 px-6 rounded-xl text-base font-black flex items-center justify-center gap-2 shadow-gold transition-all transform hover:-translate-y-0.5 ${
                processingPayment
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d4af37] text-gray-950 hover:brightness-110'
              }`}
            >
              {processingPayment ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-gray-950" />
                  <span>ಪಾವತಿ ವಿಂಡೋ ತೆರೆಯಲಾಗುತ್ತಿದೆ...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 text-gray-950" />
                  <span>ಈಗಲೇ ಪಾವತಿಸಿ (Pay ₹250 Securely)</span>
                </>
              )}
            </button>

            <div className="mt-5 text-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ನೋಂದಣಿ ಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-[#0a192f] rounded-2xl border border-gray-800 p-8">
            <p className="text-sm text-gray-300 mb-4">
              ಯಾವುದೇ ಆಟಗಾರರ ದಾಖಲೆ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ನೋಂದಣಿ ನಮೂನೆಯನ್ನು ಭರ್ತಿ ಮಾಡಿ.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-bold bg-[#b91c1c] text-white hover:bg-[#991b1b]"
            >
              ನೋಂದಣಿ ಪುಟಕ್ಕೆ ಹೋಗಿ
            </Link>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-bit SSL ಸುರಕ್ಷಿತ ಪಾವತಿ</span>
          </div>
          <div>UPI, Cards, NetBanking</div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#06101e] flex items-center justify-center py-20 text-[#fbbf24]">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
