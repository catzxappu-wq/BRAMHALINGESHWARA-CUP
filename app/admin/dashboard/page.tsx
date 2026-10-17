'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Trophy,
  Users,
  CreditCard,
  Settings,
  Shield,
  FileText,
  Download,
  LogOut,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  KeyRound,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Lock,
  ChevronLeft,
  ChevronRight,
  Sliders,
  DollarSign,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();

  // Session & User
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Active Tab: 'overview' | 'players' | 'payments' | 'settings' | 'admins' | 'logs'
  const [activeTab, setActiveTab] = useState('overview');

  // Dashboard Stats
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Players Management
  const [players, setPlayers] = useState<any[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [selectionFilter, setSelectionFilter] = useState('');
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  // Photo Preview Modal
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [previewPlayerName, setPreviewPlayerName] = useState<string>('');

  // Payments Ledger
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Settings State (Supervisor)
  const [settingsForm, setSettingsForm] = useState<any>({
    tournamentName: '',
    season: '',
    registrationFee: 250,
    registrationCapacity: 100,
    registrationOpen: true,
    capacityCountingRule: 'paid',
    registrationDeadline: '',
    tournamentDates: '',
    tournamentVenue: '',
    firstPrize: '',
    secondPrize: '',
    contactName1: '',
    contactNumber1: '',
    contactName2: '',
    contactNumber2: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Admins Management (Supervisor)
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminPermissions, setNewAdminPermissions] = useState<string[]>([
    'view_players',
    'view_payments',
  ]);
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // Activity Logs (Supervisor)
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Global messages
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  // 1. Check Session
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthenticated');
        return res.json();
      })
      .then((data) => {
        setSession(data.user);
        if (data.user.mustChangePassword) {
          router.push('/admin/change-password');
        }
      })
      .catch(() => {
        router.push('/admin/login');
      })
      .finally(() => setLoadingSession(false));
  }, [router]);

  // 2. Fetch Stats
  const loadStats = () => {
    setLoadingStats(true);
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .finally(() => setLoadingStats(false));
  };

  // 3. Fetch Players
  const loadPlayers = () => {
    setLoadingPlayers(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: '15',
      search,
      category: categoryFilter,
      paymentStatus: paymentFilter,
      selectionStatus: selectionFilter,
    });

    fetch(`/api/admin/players?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPlayers(data.players);
          setTotalPlayers(data.total);
        }
      })
      .finally(() => setLoadingPlayers(false));
  };

  // 4. Fetch Payments
  const loadPayments = () => {
    setLoadingPayments(true);
    fetch('/api/admin/payments')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPayments(data.payments);
        }
      })
      .finally(() => setLoadingPayments(false));
  };

  // 5. Fetch Settings
  const loadSettings = () => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          const s = data.settings;
          setSettingsForm({
            tournamentName: s.tournamentName,
            season: s.season,
            registrationFee: s.registrationFee,
            registrationCapacity: s.registrationCapacity,
            registrationOpen: s.registrationOpen,
            capacityCountingRule: s.capacityCountingRule || 'paid',
            registrationDeadline: s.registrationDeadline ? s.registrationDeadline.slice(0, 10) : '',
            tournamentDates: s.tournamentDates,
            tournamentVenue: s.tournamentVenue,
            firstPrize: s.firstPrize,
            secondPrize: s.secondPrize,
            contactName1: s.contactName1,
            contactNumber1: s.contactNumber1,
            contactName2: s.contactName2,
            contactNumber2: s.contactNumber2,
          });
        }
      });
  };

  // 6. Fetch Admins
  const loadAdmins = () => {
    if (session?.role !== 'supervisor') return;
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAdminsList(data.admins);
        }
      });
  };

  // 7. Fetch Logs
  const loadLogs = () => {
    if (session?.role !== 'supervisor') return;
    setLoadingLogs(true);
    fetch('/api/admin/logs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLogs(data.logs);
        }
      })
      .finally(() => setLoadingLogs(false));
  };

  useEffect(() => {
    if (!session) return;
    loadStats();
    if (activeTab === 'players') loadPlayers();
    if (activeTab === 'payments') loadPayments();
    if (activeTab === 'settings') loadSettings();
    if (activeTab === 'admins') loadAdmins();
    if (activeTab === 'logs') loadLogs();
  }, [session, activeTab, page, categoryFilter, paymentFilter, selectionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadPlayers();
  };

  const handleUpdateSelection = async (playerId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/players', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, selectionStatus: status }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback('success', 'ಆಟಗಾರರ ಆಯ್ಕೆ ಸ್ಥಿತಿಯನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ.');
        loadPlayers();
        loadStats();
      } else {
        showFeedback('error', data.message || 'ನವೀಕರಣ ವಿಫಲವಾಗಿದೆ.');
      }
    } catch {
      showFeedback('error', 'ಸರ್ವರ್ ದೋಷ.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback('success', 'ಸೆಟ್ಟಿಂಗ್ಸ್ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!');
        loadStats();
      } else {
        showFeedback('error', data.message || 'ಉಳಿಸುವಲ್ಲಿ ದೋಷ.');
      }
    } catch {
      showFeedback('error', 'ಸರ್ವರ್ ದೋಷ.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAdmin(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newAdminUsername,
          password: newAdminPassword,
          permissions: newAdminPermissions,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback('success', 'ಹೊಸ ನಿರ್ವಾಹಕ ಖಾತೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ.');
        setNewAdminUsername('');
        setNewAdminPassword('');
        loadAdmins();
      } else {
        showFeedback('error', data.message || 'ಖಾತೆ ರಚನೆ ವಿಫಲವಾಗಿದೆ.');
      }
    } catch {
      showFeedback('error', 'ಸರ್ವರ್ ದೋಷ.');
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleToggleAdminStatus = async (adminId: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, isActive: !currentActive }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback('success', 'ನಿರ್ವಾಹಕರ ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ.');
        loadAdmins();
      } else {
        showFeedback('error', data.message || 'ನವೀಕರಣ ವಿಫಲವಾಗಿದೆ.');
      }
    } catch {
      showFeedback('error', 'ಸರ್ವರ್ ದೋಷ.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#06101e] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#fbbf24]">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-base font-semibold">ನಿರ್ವಾಹಕ ಅಧಿವೇಶನ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...</span>
        </div>
      </div>
    );
  }

  const isSupervisor = session?.role === 'supervisor';

  const categoryKannada: Record<string, string> = {
    batsman: 'ಬ್ಯಾಟ್ಸ್ಮನ್',
    bowler: 'ಬೌಲರ್',
    all_rounder: 'ಆಲ್ರೌಂಡರ್',
  };

  return (
    <div className="min-h-screen bg-[#06101e] text-gray-100 flex flex-col">
      {/* Admin Top Navigation Bar */}
      <header className="bg-[#0a192f] border-b border-[#d4af37]/30 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#b91c1c] via-[#d4af37] to-[#fbbf24] p-0.5 shadow-gold">
            <div className="w-full h-full bg-[#0a1b33] rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[#fbbf24]" />
            </div>
          </div>
          <div>
            <div className="text-base font-black text-white flex items-center gap-2">
              <span>ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್ 2026</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#b91c1c] text-white font-bold">
                {isSupervisor ? 'ಮುಖ್ಯ ನಿರ್ವಾಹಕ ಫಲಕ' : 'ಸಾಮಾನ್ಯ ನಿರ್ವಾಹಕ ಫಲಕ'}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              ಲಾಗಿನ್ ಆದವರು: <span className="text-[#fbbf24] font-semibold">{session?.username}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#132d54] hover:bg-[#1a3a6b] text-gray-200 border border-gray-600 transition-colors"
          >
            ಸಾರ್ವಜನಿಕ ಸೈಟ್ ವೀಕ್ಷಿಸಿ ↗
          </Link>

          <a
            href="/api/admin/export"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#15803d] hover:bg-[#16a34a] text-white flex items-center gap-1.5 shadow transition-all"
            download
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV ಡೌನ್‌ಲೋಡ್</span>
          </a>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/50 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ಲಾಗೌಟ್</span>
          </button>
        </div>
      </header>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`px-4 py-2 text-center text-sm font-bold ${
            feedback.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 bg-[#0a192f] border-r border-gray-800 p-4 space-y-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#b91c1c] to-[#991b1b] text-white shadow-md border border-[#fbbf24]/50'
                : 'text-gray-300 hover:bg-[#0e2444] hover:text-[#fbbf24]'
            }`}
          >
            <Trophy className="w-4 h-4 text-[#fbbf24]" />
            <span>ಅವಲೋಕನ (Overview)</span>
          </button>

          <button
            onClick={() => setActiveTab('players')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'players'
                ? 'bg-gradient-to-r from-[#b91c1c] to-[#991b1b] text-white shadow-md border border-[#fbbf24]/50'
                : 'text-gray-300 hover:bg-[#0e2444] hover:text-[#fbbf24]'
            }`}
          >
            <Users className="w-4 h-4 text-[#fbbf24]" />
            <span>ಆಟಗಾರರ ನಿರ್ವಹಣೆ (Players)</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'payments'
                ? 'bg-gradient-to-r from-[#b91c1c] to-[#991b1b] text-white shadow-md border border-[#fbbf24]/50'
                : 'text-gray-300 hover:bg-[#0e2444] hover:text-[#fbbf24]'
            }`}
          >
            <CreditCard className="w-4 h-4 text-[#fbbf24]" />
            <span>ಪಾವತಿ ದಾಖಲೆಗಳು (Payments)</span>
          </button>

          {isSupervisor && (
            <>
              <div className="pt-4 pb-1 px-3 text-xs uppercase font-extrabold text-[#d4af37] tracking-wider">
                ಮುಖ್ಯ ನಿರ್ವಾಹಕರ ನಿಯಂತ್ರಣ
              </div>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-[#b91c1c] to-[#991b1b] text-white shadow-md border border-[#fbbf24]/50'
                    : 'text-gray-300 hover:bg-[#0e2444] hover:text-[#fbbf24]'
                }`}
              >
                <Settings className="w-4 h-4 text-[#fbbf24]" />
                <span>ಪಂದ್ಯಾವಳಿ ಸೆಟ್ಟಿಂಗ್ಸ್ (Settings)</span>
              </button>

              <button
                onClick={() => setActiveTab('admins')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'admins'
                    ? 'bg-gradient-to-r from-[#b91c1c] to-[#991b1b] text-white shadow-md border border-[#fbbf24]/50'
                    : 'text-gray-300 hover:bg-[#0e2444] hover:text-[#fbbf24]'
                }`}
              >
                <Shield className="w-4 h-4 text-[#fbbf24]" />
                <span>ನಿರ್ವಾಹಕರ ಖಾತೆಗಳು (Admins)</span>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'logs'
                    ? 'bg-gradient-to-r from-[#b91c1c] to-[#991b1b] text-white shadow-md border border-[#fbbf24]/50'
                    : 'text-gray-300 hover:bg-[#0e2444] hover:text-[#fbbf24]'
                }`}
              >
                <FileText className="w-4 h-4 text-[#fbbf24]" />
                <span>ಚಟುವಟಿಕೆ ಲಾಗ್‌ಗಳು (Logs)</span>
              </button>
            </>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8 bg-[#06101e] overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white">
                  ಪಂದ್ಯಾವಳಿ ಸಾರಾಂಶ (Dashboard Summary)
                </h2>
                <button
                  onClick={loadStats}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#132d54] text-gray-200 hover:text-white flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
                  <span>ರಿಫ್ರೆಶ್</span>
                </button>
              </div>

              {/* 8 Required Dashboard Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. ಒಟ್ಟು ನೋಂದಣಿಗಳು */}
                <div className="bg-[#0a192f] p-5 rounded-2xl border border-gray-700/80 shadow-md">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-xs font-bold">ಒಟ್ಟು ನೋಂದಣಿಗಳು</span>
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-3xl font-black text-white">
                    {stats?.totalRegistrations ?? 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">ದಾಖಲಾದ ಒಟ್ಟು ಆಟಗಾರರು</div>
                </div>

                {/* 2. ಪಾವತಿ ಪೂರ್ಣಗೊಂಡವರು */}
                <div className="bg-[#0a192f] p-5 rounded-2xl border border-emerald-500/40 shadow-md">
                  <div className="flex items-center justify-between text-emerald-400 mb-2">
                    <span className="text-xs font-bold">ಪಾವತಿ ಪೂರ್ಣಗೊಂಡವರು</span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-black text-emerald-400">
                    {stats?.paidPlayers ?? 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    ಒಟ್ಟು ಮೊತ್ತ: ₹{(stats?.totalCollectedAmount ?? 0).toLocaleString()}
                  </div>
                </div>

                {/* 3. ಪಾವತಿ ಬಾಕಿಯಿರುವವರು */}
                <div className="bg-[#0a192f] p-5 rounded-2xl border border-amber-500/40 shadow-md">
                  <div className="flex items-center justify-between text-amber-400 mb-2">
                    <span className="text-xs font-bold">ಪಾವತಿ ಬಾಕಿಯಿರುವವರು</span>
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-3xl font-black text-amber-400">
                    {stats?.pendingPayment ?? 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">ಶುಲ್ಕ ಪಾವತಿಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ</div>
                </div>

                {/* 4. ಆಯ್ಕೆ ಬಾಕಿಯಿರುವವರು */}
                <div className="bg-[#0a192f] p-5 rounded-2xl border border-blue-500/40 shadow-md">
                  <div className="flex items-center justify-between text-blue-400 mb-2">
                    <span className="text-xs font-bold">ಆಯ್ಕೆ ಬಾಕಿಯಿರುವವರು</span>
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-3xl font-black text-blue-300">
                    {stats?.selectionPending ?? 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">ಪರಿಶೀಲನೆಯಲ್ಲಿರುವ ಆಟಗಾರರು</div>
                </div>

                {/* 5. ಆಯ್ಕೆಯಾದ ಆಟಗಾರರು */}
                <div className="bg-[#0a192f] p-5 rounded-2xl border border-[#fbbf24]/50 shadow-gold">
                  <div className="flex items-center justify-between text-[#fbbf24] mb-2">
                    <span className="text-xs font-bold">ಆಯ್ಕೆಯಾದ ಆಟಗಾರರು</span>
                    <Trophy className="w-5 h-5 text-[#fbbf24]" />
                  </div>
                  <div className="text-3xl font-black text-[#fbbf24]">
                    {stats?.approvedPlayers ?? 0}
                  </div>
                  <div className="text-xs text-emerald-400 mt-1">ತಂಡಕ್ಕೆ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ</div>
                </div>

                {/* 6. ಆಯ್ಕೆಯಾಗದ ಆಟಗಾರರು */}
                <div className="bg-[#0a192f] p-5 rounded-2xl border border-red-500/40 shadow-md">
                  <div className="flex items-center justify-between text-red-400 mb-2">
                    <span className="text-xs font-bold">ಆಯ್ಕೆಯಾಗದ ಆಟಗಾರರು</span>
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="text-3xl font-black text-red-400">
                    {stats?.notSelectedPlayers ?? 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">ಆಯ್ಕೆ ಮಾಡದ ಆಟಗಾರರು</div>
                </div>

                {/* 7. ಲಭ್ಯವಿರುವ ನೋಂದಣಿ ಸ್ಥಾನಗಳು */}
                <div className="bg-[#0a192f] p-5 rounded-2xl border border-gray-700/80 shadow-md">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-xs font-bold">ಲಭ್ಯವಿರುವ ನೋಂದಣಿ ಸ್ಥಾನಗಳು</span>
                    <Sliders className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-3xl font-black text-purple-300">
                    {stats?.availableSlots ?? 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    ಗರಿಷ್ಠ ಮಿತಿ: {stats?.registrationCapacity ?? 100}
                  </div>
                </div>

                {/* 8. ನೋಂದಣಿ ಸ್ಥಿತಿ */}
                <div className="bg-[#0a192f] p-5 rounded-2xl border border-gray-700/80 shadow-md">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-xs font-bold">ನೋಂದಣಿ ಸ್ಥಿತಿ</span>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        stats?.registrationOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                      }`}
                    />
                  </div>
                  <div
                    className={`text-2xl font-black ${
                      stats?.registrationOpen ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {stats?.registrationOpen ? 'ತೆರೆದಿದೆ (Open)' : 'ಮುಕ್ತಾಯ (Closed)'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    ಶುಲ್ಕ: ₹{stats?.registrationFee ?? 250}/-
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PLAYERS MANAGEMENT */}
          {activeTab === 'players' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-white">
                  ಆಟಗಾರರ ನಿರ್ವಹಣೆ (Players Management)
                </h2>
                <span className="text-sm text-gray-400">
                  ಒಟ್ಟು ಫಲಿತಾಂಶಗಳು: <span className="font-bold text-white">{totalPlayers}</span>
                </span>
              </div>

              {/* Filters and Search Bar */}
              <div className="bg-[#0a192f] p-4 rounded-2xl border border-gray-800 space-y-4">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="ಹೆಸರು, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ, ನೋಂದಣಿ ಕೋಡ್ ಮೂಲಕ ಹುಡುಕಿ..."
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0e2444] border border-gray-700 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#fbbf24]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#b91c1c] hover:bg-[#991b1b] text-white rounded-xl text-sm font-bold shadow"
                  >
                    ಹುಡುಕಿ
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-400 mb-1">ಆಟಗಾರರ ವಿಭಾಗ:</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full bg-[#0e2444] border border-gray-700 rounded-lg p-2 text-white"
                    >
                      <option value="">ಎಲ್ಲ ವಿಭಾಗಗಳು</option>
                      <option value="batsman">ಬ್ಯಾಟ್ಸ್ಮನ್ (Batsman)</option>
                      <option value="bowler">ಬೌಲರ್ (Bowler)</option>
                      <option value="all_rounder">ಆಲ್ರೌಂಡರ್ (All-Rounder)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">ಪಾವತಿ ಸ್ಥಿತಿ:</label>
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="w-full bg-[#0e2444] border border-gray-700 rounded-lg p-2 text-white"
                    >
                      <option value="">ಎಲ್ಲ ಪಾವತಿ ಸ್ಥಿತಿಗಳು</option>
                      <option value="paid">ಪಾವತಿಸಲಾಗಿದೆ (Paid)</option>
                      <option value="pending">ಪಾವತಿ ಬಾಕಿ (Pending)</option>
                      <option value="failed">ವಿಫಲ (Failed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">ಆಯ್ಕೆ ಸ್ಥಿತಿ:</label>
                    <select
                      value={selectionFilter}
                      onChange={(e) => setSelectionFilter(e.target.value)}
                      className="w-full bg-[#0e2444] border border-gray-700 rounded-lg p-2 text-white"
                    >
                      <option value="">ಎಲ್ಲ ಆಯ್ಕೆ ಸ್ಥಿತಿಗಳು</option>
                      <option value="pending">ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (Pending)</option>
                      <option value="approved">ಆಯ್ಕೆಯಾಗಿದ್ದಾರೆ (Approved)</option>
                      <option value="not_selected">ಆಯ್ಕೆಯಾಗಿಲ್ಲ (Not Selected)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Players Table */}
              <div className="bg-[#0a192f] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#0e2444] text-[#fbbf24] uppercase text-xs font-bold border-b border-gray-700">
                      <tr>
                        <th className="p-3.5">ಭಾವಚಿತ್ರ</th>
                        <th className="p-3.5">ನೋಂದಣಿ ಕೋಡ್</th>
                        <th className="p-3.5">ಆಟಗಾರರ ಹೆಸರು</th>
                        <th className="p-3.5">ಮೊಬೈಲ್</th>
                        <th className="p-3.5">ವಿಭಾಗ</th>
                        <th className="p-3.5">ಪಾವತಿ</th>
                        <th className="p-3.5">ಆಯ್ಕೆ ಸ್ಥಿತಿ</th>
                        <th className="p-3.5 text-center">ಕ್ರಮಗಳು (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-gray-200">
                      {loadingPlayers ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-gray-400">
                            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#fbbf24]" />
                            <span>ಆಟಗಾರರ ಮಾಹಿತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...</span>
                          </td>
                        </tr>
                      ) : players.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-gray-400">
                            ಯಾವುದೇ ಆಟಗಾರರ ದಾಖಲೆ ಕಂಡುಬಂದಿಲ್ಲ.
                          </td>
                        </tr>
                      ) : (
                        players.map((p) => (
                          <tr key={p.id} className="hover:bg-[#0e2444]/50 transition-colors">
                            {/* Photo thumbnail */}
                            <td className="p-3">
                              <button
                                onClick={() => {
                                  setPreviewPhotoUrl(p.photoUrl);
                                  setPreviewPlayerName(p.fullName);
                                }}
                                className="relative w-11 h-11 rounded-lg overflow-hidden border border-[#d4af37]/60 block group"
                              >
                                <Image
                                  src={p.photoUrl}
                                  alt={p.fullName}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform"
                                />
                              </button>
                            </td>

                            {/* Registration Code */}
                            <td className="p-3 font-mono font-bold text-[#fbbf24]">
                              {p.registrationCode || (
                                <span className="text-gray-500 italic">ಬಾಕಿ</span>
                              )}
                            </td>

                            {/* Player Name */}
                            <td className="p-3 font-bold text-white">
                              <div>{p.fullName}</div>
                              <div className="text-xs text-gray-400 font-normal truncate max-w-[150px]">
                                {p.address}
                              </div>
                            </td>

                            {/* Mobile */}
                            <td className="p-3 font-mono">{p.mobileNumber}</td>

                            {/* Category */}
                            <td className="p-3">
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#132d54] text-[#fbbf24] border border-[#d4af37]/30">
                                {categoryKannada[p.playerCategory] || p.playerCategory}
                              </span>
                            </td>

                            {/* Payment Status */}
                            <td className="p-3">
                              {p.paymentStatus === 'paid' ? (
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                                  ಪಾವತಿಸಲಾಗಿದೆ
                                </span>
                              ) : p.paymentStatus === 'failed' ? (
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-950 text-red-400 border border-red-500/40">
                                  ವಿಫಲವಾಗಿದೆ
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-950 text-amber-400 border border-amber-500/40">
                                  ಬಾಕಿ
                                </span>
                              )}
                            </td>

                            {/* Selection Status */}
                            <td className="p-3">
                              {p.selectionStatus === 'approved' ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>ಆಯ್ಕೆಯಾಗಿದ್ದಾರೆ</span>
                                </span>
                              ) : p.selectionStatus === 'not_selected' ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/40">
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>ಆಯ್ಕೆಯಾಗಿಲ್ಲ</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/40">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ</span>
                                </span>
                              )}
                            </td>

                            {/* Actions: Approve / Reject / Reset */}
                            <td className="p-3 text-center">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => handleUpdateSelection(p.id, 'approved')}
                                  title="ಆಯ್ಕೆ ಅನುಮೋದಿಸಿ (Approve)"
                                  className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-600 transition-colors"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleUpdateSelection(p.id, 'not_selected')}
                                  title="ಆಯ್ಕೆ ತಿರಸ್ಕರಿಸಿ (Not Selected)"
                                  className="p-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-300 border border-red-600 transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleUpdateSelection(p.id, 'pending')}
                                  title="ಬಾಕಿ ಇರಿಸಿ (Pending)"
                                  className="p-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-300 border border-blue-600 transition-colors"
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-4 bg-[#0e2444] border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
                  <div>ಪುಟ {page}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-3 py-1.5 rounded bg-[#132d54] text-white disabled:opacity-50 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" /> ಹಿಂದಿನ ಪುಟ
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page * 15 >= totalPlayers}
                      className="px-3 py-1.5 rounded bg-[#132d54] text-white disabled:opacity-50 flex items-center gap-1"
                    >
                      ಮುಂದಿನ ಪುಟ <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS LEDGER */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-white">
                ಪಾವತಿ ದಾಖಲೆಗಳು (Payments Ledger)
              </h2>

              <div className="bg-[#0a192f] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#0e2444] text-[#fbbf24] uppercase text-xs font-bold border-b border-gray-700">
                      <tr>
                        <th className="p-3.5">ದಿನಾಂಕ</th>
                        <th className="p-3.5">ಆಟಗಾರರ ಹೆಸರು</th>
                        <th className="p-3.5">ನೋಂದಣಿ ಕೋಡ್</th>
                        <th className="p-3.5">ಮೊತ್ತ</th>
                        <th className="p-3.5">Gateway Order ID</th>
                        <th className="p-3.5">Payment ID</th>
                        <th className="p-3.5">ಸ್ಥಿತಿ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-gray-200">
                      {loadingPayments ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-400">
                            ಲೋಡ್ ಆಗುತ್ತಿದೆ...
                          </td>
                        </tr>
                      ) : payments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-400">
                            ಯಾವುದೇ ಪಾವತಿ ದಾಖಲೆಗಳು ಇಲ್ಲ.
                          </td>
                        </tr>
                      ) : (
                        payments.map((pmt) => (
                          <tr key={pmt.id} className="hover:bg-[#0e2444]/50">
                            <td className="p-3 text-xs text-gray-400">
                              {new Date(pmt.createdAt).toLocaleString('kn-IN')}
                            </td>
                            <td className="p-3 font-bold text-white">
                              {pmt.player?.fullName || '-'}
                            </td>
                            <td className="p-3 font-mono text-[#fbbf24]">
                              {pmt.player?.registrationCode || '-'}
                            </td>
                            <td className="p-3 font-bold text-emerald-400">
                              ₹{pmt.amount}/-
                            </td>
                            <td className="p-3 font-mono text-xs text-gray-300">
                              {pmt.gatewayOrderId || '-'}
                            </td>
                            <td className="p-3 font-mono text-xs text-gray-300">
                              {pmt.gatewayPaymentId || '-'}
                            </td>
                            <td className="p-3">
                              {pmt.paymentStatus === 'captured' ? (
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                                  Captured
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-950 text-amber-400 border border-amber-500/40">
                                  {pmt.paymentStatus}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS (SUPERVISOR ONLY) */}
          {activeTab === 'settings' && isSupervisor && (
            <div className="max-w-3xl space-y-6">
              <h2 className="text-2xl font-black text-white">
                ಪಂದ್ಯಾವಳಿ ಸೆಟ್ಟಿಂಗ್ಸ್ (Tournament Configuration)
              </h2>

              <form onSubmit={handleSaveSettings} className="bg-[#0a192f] p-6 sm:p-8 rounded-2xl border-2 border-[#d4af37]/40 shadow-xl space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Fee */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      ನೋಂದಣಿ ಶುಲ್ಕ (₹):
                    </label>
                    <input
                      type="number"
                      required
                      value={settingsForm.registrationFee}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, registrationFee: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white font-bold"
                    />
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      ಗರಿಷ್ಠ ನೋಂದಣಿ ಮಿತಿ (Capacity):
                    </label>
                    <input
                      type="number"
                      required
                      value={settingsForm.registrationCapacity}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, registrationCapacity: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white font-bold"
                    />
                  </div>
                </div>

                {/* Open / Close Toggle */}
                <div className="bg-[#0e2444] p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">
                      ಆಟಗಾರರ ನೋಂದಣಿ ತೆರೆಯಿರಿ / ಮುಕ್ತಾಯಗೊಳಿಸಿ
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {settingsForm.registrationOpen
                        ? 'ಪ್ರಸ್ತುತ ಸಾರ್ವಜನಿಕರಿಗೆ ಹೊಸ ನೋಂದಣಿಗಳು ಮುಕ್ತವಾಗಿವೆ'
                        : 'ಪ್ರಸ್ತುತ ಹೊಸ ನೋಂದಣಿಗಳನ್ನು ತಾತ್ಕಾಲಿಕವಾಗಿ ಮುಚ್ಚಲಾಗಿದೆ'}
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.registrationOpen}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, registrationOpen: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Dates & Venue */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      ಪಂದ್ಯಾವಳಿ ದಿನಾಂಕಗಳು:
                    </label>
                    <input
                      type="text"
                      value={settingsForm.tournamentDates}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, tournamentDates: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      ಪಂದ್ಯಾವಳಿ ಸ್ಥಳ (Venue):
                    </label>
                    <input
                      type="text"
                      value={settingsForm.tournamentVenue}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, tournamentVenue: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>

                {/* Prizes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      ಪ್ರಥಮ ಬಹುಮಾನ:
                    </label>
                    <input
                      type="text"
                      value={settingsForm.firstPrize}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, firstPrize: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      ದ್ವಿತೀಯ ಬಹುಮಾನ:
                    </label>
                    <input
                      type="text"
                      value={settingsForm.secondPrize}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, secondPrize: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>

                {/* Contacts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      ಸಂಪರ್ಕ ೧ (ತೀರ್ಥೇಶ್‌):
                    </label>
                    <input
                      type="text"
                      value={settingsForm.contactNumber1}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, contactNumber1: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      ಸಂಪರ್ಕ ೨ (ಪ್ರಜ್ವಲ್ PK):
                    </label>
                    <input
                      type="text"
                      value={settingsForm.contactNumber2}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, contactNumber2: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d4af37] text-gray-950 hover:brightness-110 shadow-gold"
                >
                  {savingSettings ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ಸೆಟ್ಟಿಂಗ್ಸ್ ಉಳಿಸಿ (Save Tournament Settings)'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: ADMINS (SUPERVISOR ONLY) */}
          {activeTab === 'admins' && isSupervisor && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-white">
                ನಿರ್ವಾಹಕರ ಖಾತೆಗಳ ನಿರ್ವಹಣೆ (Admins Management)
              </h2>

              {/* Create Normal Admin Form */}
              <div className="bg-[#0a192f] p-6 rounded-2xl border border-gray-800 shadow-xl max-w-xl">
                <h3 className="text-base font-bold text-[#fbbf24] mb-4 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5" />
                  <span>ಹೊಸ ಸಾಮಾನ್ಯ ನಿರ್ವಾಹಕ ಖಾತೆ ರಚಿಸಿ</span>
                </h3>

                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      ಬಳಕೆದಾರ ಹೆಸರು (Username):
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdminUsername}
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      placeholder="ಉದಾ: staff_prajwal"
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      ತಾತ್ಕಾಲಿಕ ಪಾಸ್‌ವರ್ಡ್ (Temporary Password):
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳು"
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-2">
                      ಅನುಮತಿಗಳು (Permissions):
                    </label>
                    <div className="space-y-2 text-xs">
                      {[
                        { key: 'view_players', label: 'ಆಟಗಾರರ ಪಟ್ಟಿ ವೀಕ್ಷಣೆ' },
                        { key: 'update_selection', label: 'ಆಯ್ಕೆ ಸ್ಥಿತಿ ಬದಲಾವಣೆ' },
                        { key: 'view_payments', label: 'ಪಾವತಿ ವಿವರ ವೀಕ್ಷಣೆ' },
                        { key: 'export_csv', label: 'CSV ಡೌನ್‌ಲೋಡ್ ಅನುಮತಿ' },
                      ].map((perm) => (
                        <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newAdminPermissions.includes(perm.key)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewAdminPermissions([...newAdminPermissions, perm.key]);
                              } else {
                                setNewAdminPermissions(newAdminPermissions.filter((k) => k !== perm.key));
                              }
                            }}
                            className="rounded border-gray-700 text-[#b91c1c]"
                          />
                          <span>{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingAdmin}
                    className="w-full py-2.5 rounded-lg text-xs font-bold bg-[#15803d] hover:bg-[#16a34a] text-white"
                  >
                    {creatingAdmin ? 'ರಚಿಸಲಾಗುತ್ತಿದೆ...' : 'ನಿರ್ವಾಹಕ ಖಾತೆ ರಚಿಸಿ'}
                  </button>
                </form>
              </div>

              {/* Existing Admins Table */}
              <div className="bg-[#0a192f] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#0e2444] text-[#fbbf24] font-bold border-b border-gray-700">
                    <tr>
                      <th className="p-3.5">ಬಳಕೆದಾರ ಹೆಸರು</th>
                      <th className="p-3.5">ಪಾತ್ರ (Role)</th>
                      <th className="p-3.5">ಸ್ಥಿತಿ</th>
                      <th className="p-3.5">ಅನುಮತಿಗಳು</th>
                      <th className="p-3.5">ಕ್ರಮಗಳು</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-gray-200">
                    {adminsList.map((adm) => (
                      <tr key={adm.id} className="hover:bg-[#0e2444]/50">
                        <td className="p-3 font-bold text-white">{adm.username}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              adm.role === 'supervisor'
                                ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                                : 'bg-blue-950 text-blue-400 border border-blue-500/40'
                            }`}
                          >
                            {adm.role === 'supervisor' ? 'ಮುಖ್ಯ ನಿರ್ವಾಹಕರು' : 'ಸಾಮಾನ್ಯ ನಿರ್ವಾಹಕರು'}
                          </span>
                        </td>
                        <td className="p-3">
                          {adm.isActive ? (
                            <span className="text-emerald-400 font-bold">ಸಕ್ರಿಯ (Active)</span>
                          ) : (
                            <span className="text-red-400 font-bold">ಅಮಾನತು (Inactive)</span>
                          )}
                        </td>
                        <td className="p-3 text-xs text-gray-300">
                          {adm.role === 'supervisor'
                            ? 'ಎಲ್ಲ ಅಧಿಕಾರಗಳು'
                            : adm.permissions?.join(', ') || 'ಯಾವುದೂ ಇಲ್ಲ'}
                        </td>
                        <td className="p-3">
                          {adm.role !== 'supervisor' && (
                            <button
                              onClick={() => handleToggleAdminStatus(adm.id, adm.isActive)}
                              className={`px-2.5 py-1 rounded text-xs font-bold ${
                                adm.isActive
                                  ? 'bg-red-950 text-red-300 border border-red-500/50 hover:bg-red-900'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900'
                              }`}
                            >
                              {adm.isActive ? 'ಅಮಾನತುಗೊಳಿಸಿ' : 'ಸಕ್ರಿಯಗೊಳಿಸಿ'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: ACTIVITY LOGS (SUPERVISOR ONLY) */}
          {activeTab === 'logs' && isSupervisor && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white">
                  ಆಡಳಿತ ಚಟುವಟಿಕೆ ಲಾಗ್‌ಗಳು (Admin Activity Logs)
                </h2>
                <button
                  onClick={loadLogs}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#132d54] text-gray-200"
                >
                  ರಿಫ್ರೆಶ್
                </button>
              </div>

              <div className="bg-[#0a192f] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#0e2444] text-[#fbbf24] font-bold border-b border-gray-700">
                      <tr>
                        <th className="p-3">ಸಮಯ (Timestamp)</th>
                        <th className="p-3">ನಿರ್ವಾಹಕರು</th>
                        <th className="p-3">ಚಟುವಟಿಕೆ (Action)</th>
                        <th className="p-3">ವಿವರಗಳು (Metadata)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-gray-300">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#0e2444]/40">
                          <td className="p-3 text-gray-400">
                            {new Date(log.timestamp).toLocaleString('kn-IN')}
                          </td>
                          <td className="p-3 text-white font-bold">{log.adminUsername || 'system'}</td>
                          <td className="p-3 text-[#fbbf24]">{log.action}</td>
                          <td className="p-3 text-xs text-gray-400 max-w-xs truncate">
                            {log.safeMetadata || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Full Photo Preview Modal */}
      {previewPhotoUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a192f] rounded-2xl border-2 border-[#fbbf24] p-4 max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute top-3 right-3 p-1 rounded-full bg-gray-800 text-gray-300 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center mb-3">
              <h3 className="text-base font-bold text-white">{previewPlayerName}</h3>
              <p className="text-xs text-[#d4af37]">ಆಟಗಾರರ ಅಧಿಕೃತ ಭಾವಚಿತ್ರ</p>
            </div>
            <div className="relative w-full h-80 rounded-xl overflow-hidden border border-gray-700">
              <Image
                src={previewPhotoUrl}
                alt={previewPlayerName}
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
