'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Trophy,
  Users,
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
  RefreshCw,
  PlusCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Lock,
  ChevronLeft,
  ChevronRight,
  Sliders,
  UserCheck,
  UserX,
  X,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();

  // Session & User
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Active Tab: 'overview' | 'players' | 'settings' | 'admins' | 'logs'
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
  const [selectionFilter, setSelectionFilter] = useState('');
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  // Photo Preview Modal
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [previewPlayerName, setPreviewPlayerName] = useState<string>('');

  // Settings State (Supervisor)
  const [settingsForm, setSettingsForm] = useState<any>({
    tournamentName: '',
    season: '',
    registrationCapacity: 100,
    registrationOpen: true,
    registrationDeadline: '',
    tournamentDates: '',
    tournamentVenue: '',
    firstPrize: '',
    secondPrize: '',
    contactName1: '',
    contactNumber1: '',
    contactName2: '',
    contactNumber2: '',
    rules: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Admins Management (Supervisor)
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminPermissions, setNewAdminPermissions] = useState<string[]>([
    'view_players',
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
      .catch((err) => console.error(err))
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
      .catch((err) => console.error(err))
      .finally(() => setLoadingPlayers(false));
  };

  // 4. Fetch Settings
  const loadSettings = () => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettingsForm({
            tournamentName: data.settings.tournamentName || '',
            season: data.settings.season || '',
            registrationCapacity: data.settings.registrationCapacity || 100,
            registrationOpen: data.settings.registrationOpen ?? true,
            registrationDeadline: data.settings.registrationDeadline
              ? new Date(data.settings.registrationDeadline).toISOString().slice(0, 16)
              : '',
            tournamentDates: data.settings.tournamentDates || '',
            tournamentVenue: data.settings.tournamentVenue || '',
            firstPrize: data.settings.firstPrize || '',
            secondPrize: data.settings.secondPrize || '',
            contactName1: data.settings.contactName1 || '',
            contactNumber1: data.settings.contactNumber1 || '',
            contactName2: data.settings.contactName2 || '',
            contactNumber2: data.settings.contactNumber2 || '',
            rules: data.settings.rules || '',
          });
        }
      })
      .catch((err) => console.error(err));
  };

  // 5. Fetch Admins
  const loadAdmins = () => {
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAdminsList(data.admins);
        }
      })
      .catch((err) => console.error(err));
  };

  // 6. Fetch Logs
  const loadLogs = () => {
    setLoadingLogs(true);
    fetch('/api/admin/logs?limit=50')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLogs(data.logs);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingLogs(false));
  };

  // Trigger loads on tab change
  useEffect(() => {
    if (!session) return;
    loadStats();
    if (activeTab === 'players') loadPlayers();
    if (activeTab === 'settings') loadSettings();
    if (activeTab === 'admins') loadAdmins();
    if (activeTab === 'logs') loadLogs();
  }, [session, activeTab, page, categoryFilter, selectionFilter]);

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
        loadSettings();
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

  const handleToggleAdminStatus = async (adminId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback('success', 'ನಿರ್ವಾಹಕರ ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ.');
        loadAdmins();
      }
    } catch {
      showFeedback('error', 'ದೋಷ ಸಂಭವಿಸಿದೆ.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#06101e] flex items-center justify-center text-[#fbbf24]">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const isSupervisor = session?.role === 'supervisor';

  const categoryKannada: Record<string, string> = {
    batsman: 'ಬ್ಯಾಟ್ಸ್ಮನ್',
    bowler: 'ಬೌಲರ್',
    all_rounder: 'ಆಲ್ರೌಂಡರ್',
  };

  const selectionBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
            ಆಯ್ಕೆಯಾಗಿದ್ದಾರೆ
          </span>
        );
      case 'not_selected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-950 text-red-400 border border-red-500/40">
            ಆಯ್ಕೆಯಾಗಿಲ್ಲ
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-500/40">
            ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#06101e] text-gray-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-[#0a192f] border-b-2 border-[#d4af37]/40 sticky top-0 z-40 px-4 sm:px-8 py-3.5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#b91c1c] via-[#fbbf24] to-[#15803d] p-0.5 shadow-gold">
              <div className="w-full h-full bg-[#0a192f] rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#fbbf24]" />
              </div>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>ಶ್ರೀ ಬ್ರಹ್ಮಲಿಂಗೇಶ್ವರ ಕಪ್ - 2026</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  {isSupervisor ? 'ಮುಖ್ಯ ನಿರ್ವಾಹಕ (Supervisor)' : 'ಸಿಬ್ಬಂದಿ ನಿರ್ವಾಹಕ'}
                </span>
              </h1>
              <p className="text-[11px] text-gray-400">ಅಧಿಕೃತ ಆಡಳಿತ ಮಂಡಳಿ ಫಲಕ</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-white">{session?.username}</div>
              <div className="text-[10px] text-[#fbbf24] font-mono">{session?.role}</div>
            </div>

            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#132d54] hover:bg-[#1a3a6b] text-gray-200 border border-gray-700 flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#fbbf24]" />
              <span className="hidden sm:inline">ವೆಬ್‌ಸೈಟ್ ನೋಡಿ</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-950 hover:bg-red-900 text-red-300 border border-red-800/60 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ನಿರ್ಗಮಿಸಿ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Feedback Alert */}
      {feedback && (
        <div
          className={`fixed top-18 right-6 z-50 p-4 rounded-xl shadow-2xl border-2 flex items-center gap-3 animate-slide-in text-sm font-bold ${
            feedback.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-500'
              : 'bg-red-950 text-red-200 border-red-500'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Layout Body: Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-[#0a192f]/90 border-r border-gray-800 p-4 space-y-1.5">
          <div className="text-xs uppercase font-extrabold text-[#d4af37] px-3 py-2 tracking-wider">
            ಆಡಳಿತ ಮೆನು
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#b91c1c] to-[#991b1b] text-white shadow-md border border-[#fbbf24]/50'
                : 'text-gray-300 hover:bg-[#0e2444] hover:text-[#fbbf24]'
            }`}
          >
            <Trophy className="w-4 h-4 text-[#fbbf24]" />
            <span>ಸಾರಾಂಶ (Overview)</span>
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

              {/* 8 Dashboard Summary Cards */}
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

                {/* 2. ಬ್ಯಾಟ್ಸ್‌ಮನ್‌ಗಳು */}
                <div className="bg-[#0a192f] p-5 rounded-2xl border border-amber-500/40 shadow-md">
                  <div className="flex items-center justify-between text-amber-400 mb-2">
                    <span className="text-xs font-bold">ಬ್ಯಾಟ್ಸ್‌ಮನ್‌ಗಳು</span>
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-3xl font-black text-amber-300">
                    {stats?.batsmen ?? 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">ನೋಂದಾಯಿತ ಬ್ಯಾಟ್ಸ್‌ಮನ್‌ಗಳು</div>
                </div>

                {/* 3. ಬೌಲರ್‌ಗಳು */}
                <div className="bg-[#0a192f] p-5 rounded-2xl border border-red-500/40 shadow-md">
                  <div className="flex items-center justify-between text-red-400 mb-2">
                    <span className="text-xs font-bold">ಬೌಲರ್‌ಗಳು</span>
                    <Sparkles className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="text-3xl font-black text-red-300">
                    {stats?.bowlers ?? 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">ನೋಂದಾಯಿತ ಬೌಲರ್‌ಗಳು</div>
                </div>

                {/* 4. ಆಲ್‌ರೌಂಡರ್‌ಗಳು */}
                <div className="bg-[#0a192f] p-5 rounded-2xl border border-purple-500/40 shadow-md">
                  <div className="flex items-center justify-between text-purple-400 mb-2">
                    <span className="text-xs font-bold">ಆಲ್‌ರೌಂಡರ್‌ಗಳು</span>
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-3xl font-black text-purple-300">
                    {stats?.allRounders ?? 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">ನೋಂದಾಯಿತ ಆಲ್‌ರೌಂಡರ್‌ಗಳು</div>
                </div>

                {/* 5. ಆಯ್ಕೆಯಾದ ಆಟಗಾರರು */}
                <div className="bg-[#0a192f] p-5 rounded-2xl border border-[#fbbf24]/50 shadow-gold">
                  <div className="flex items-center justify-between text-[#fbbf24] mb-2">
                    <span className="text-xs font-bold">ಆಯ್ಕೆಯಾದ ಆಟಗಾರರು</span>
                    <UserCheck className="w-5 h-5 text-[#fbbf24]" />
                  </div>
                  <div className="text-3xl font-black text-[#fbbf24]">
                    {stats?.approvedPlayers ?? 0}
                  </div>
                  <div className="text-xs text-emerald-400 mt-1">ತಂಡಕ್ಕೆ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ</div>
                </div>

                {/* 6. ಆಯ್ಕೆ ಬಾಕಿಯಿರುವವರು */}
                <div className="bg-[#0a192f] p-5 rounded-2xl border border-blue-500/40 shadow-md">
                  <div className="flex items-center justify-between text-blue-400 mb-2">
                    <span className="text-xs font-bold">ಆಯ್ಕೆ ಬಾಕಿಯಿರುವವರು</span>
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-3xl font-black text-blue-300">
                    {stats?.selectionPending ?? 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">ಪರಿಶೀಲನೆಯಲ್ಲಿರುವ ಆಟಗಾರರು</div>
                </div>

                {/* 7. ಲಭ್ಯವಿರುವ ಸ್ಥಾನಗಳು */}
                <div className="bg-[#0a192f] p-5 rounded-2xl border border-gray-700/80 shadow-md">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-xs font-bold">ಲಭ್ಯವಿರುವ ಸ್ಥಾನಗಳು</span>
                    <Sliders className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-3xl font-black text-cyan-300">
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
                    {stats?.registrationOpen ? 'ತೆರೆಯಲಾಗಿದೆ (Open)' : 'ಮುಕ್ತಾಯ (Closed)'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">ಸಾರ್ವಜನಿಕ ಪ್ರವೇಶ</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => setActiveTab('players')}
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-gray-950 shadow-gold hover:brightness-110 flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-gray-950" />
                  <span>ಆಟಗಾರರ ಪಟ್ಟಿ ಪರಿಶೀಲಿಸಿ</span>
                </button>

                <a
                  href="/api/admin/export"
                  download
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-[#132d54] text-white border border-[#d4af37]/40 hover:bg-[#1a3a6b] flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#fbbf24]" />
                  <span>ಆಟಗಾರರ CSV ಡೌನ್‌ಲೋಡ್</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: PLAYERS MANAGEMENT */}
          {activeTab === 'players' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    ಆಟಗಾರರ ನಿರ್ವಹಣೆ (Player Management)
                  </h2>
                  <p className="text-xs text-gray-400">ಒಟ್ಟು ನೋಂದಣಿಗಳು: {totalPlayers}</p>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="/api/admin/export"
                    download
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#132d54] text-white border border-gray-700 hover:bg-[#1a3a6b] flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4 text-[#fbbf24]" />
                    <span>CSV ರಫ್ತು</span>
                  </a>

                  <button
                    onClick={loadPlayers}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#132d54] text-gray-200 hover:text-white flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingPlayers ? 'animate-spin' : ''}`} />
                    <span>ರಿಫ್ರೆಶ್</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="bg-[#0a192f] p-4 rounded-2xl border border-gray-800 space-y-3">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="ಹೆಸರು, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಥವಾ ನೋಂದಣಿ ಕೋಡ್ ಮೂಲಕ ಹುಡುಕಿ..."
                      className="w-full pl-9 pr-4 py-2 bg-[#0e2444] border border-gray-700 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#fbbf24]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#fbbf24] text-gray-950 rounded-xl font-bold text-xs hover:brightness-110"
                  >
                    ಹುಡುಕಿ
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-gray-400 mb-1 font-semibold">ವಿಭಾಗದ ಪ್ರಕಾರ:</label>
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

                  {/* Selection Filter */}
                  <div>
                    <label className="block text-gray-400 mb-1 font-semibold">ಆಯ್ಕೆ ಸ್ಥಿತಿ:</label>
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
                        <th className="p-3">ಭಾವಚಿತ್ರ</th>
                        <th className="p-3">ನೋಂದಣಿ ಕೋಡ್</th>
                        <th className="p-3">ಆಟಗಾರರ ಹೆಸರು</th>
                        <th className="p-3">ಮೊಬೈಲ್</th>
                        <th className="p-3">ವಿಭಾಗ</th>
                        <th className="p-3">ಯಾರ ಮಾರ್ಗದರ್ಶನ</th>
                        <th className="p-3">ವಿಳಾಸ</th>
                        <th className="p-3">ದಿನಾಂಕ</th>
                        <th className="p-3">ಆಯ್ಕೆ ಸ್ಥಿತಿ</th>
                        <th className="p-3 text-center">ಕ್ರಮಗಳು</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-gray-200">
                      {loadingPlayers ? (
                        <tr>
                          <td colSpan={10} className="p-8 text-center text-gray-400">
                            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#fbbf24]" />
                            <span>ಆಟಗಾರರ ಮಾಹಿತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...</span>
                          </td>
                        </tr>
                      ) : players.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="p-8 text-center text-gray-400">
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
                                <img
                                  src={p.photoUrl}
                                  alt={p.fullName}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
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
                              {p.fullName}
                            </td>

                            {/* Mobile */}
                            <td className="p-3 font-mono">{p.mobileNumber}</td>

                            {/* Category */}
                            <td className="p-3">
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#132d54] text-[#fbbf24] border border-[#d4af37]/30">
                                {categoryKannada[p.playerCategory] || p.playerCategory}
                              </span>
                            </td>

                            {/* Guidance By */}
                            <td className="p-3">
                              <span className="text-xs font-medium text-amber-200 bg-[#061224] px-2 py-1 rounded border border-gray-700/80">
                                {p.guidanceBy || '-'}
                              </span>
                            </td>

                            {/* Address */}
                            <td className="p-3 text-xs text-gray-400 max-w-[160px] truncate">
                              {p.address}
                            </td>

                            {/* Date */}
                            <td className="p-3 text-xs text-gray-400">
                              {new Date(p.createdAt).toLocaleDateString('kn-IN')}
                            </td>

                            {/* Selection status */}
                            <td className="p-3">
                              {selectionBadge(p.selectionStatus)}
                            </td>

                            {/* Actions: Approve / Not Selected */}
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleUpdateSelection(p.id, 'approved')}
                                  title="ಆಯ್ಕೆ ಮಾಡಿ (Approve)"
                                  className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
                                    p.selectionStatus === 'approved'
                                      ? 'bg-emerald-600 text-white border-emerald-400'
                                      : 'bg-[#132d54] text-emerald-400 border-emerald-600/40 hover:bg-emerald-950'
                                  }`}
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleUpdateSelection(p.id, 'not_selected')}
                                  title="ತಿರಸ್ಕರಿಸಿ (Not Selected)"
                                  className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
                                    p.selectionStatus === 'not_selected'
                                      ? 'bg-red-600 text-white border-red-400'
                                      : 'bg-[#132d54] text-red-400 border-red-600/40 hover:bg-red-950'
                                  }`}
                                >
                                  <UserX className="w-4 h-4" />
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
                <div className="p-4 bg-[#0e2444] border-t border-gray-800 flex items-center justify-between text-xs text-gray-300">
                  <div>ಒಟ್ಟು: {totalPlayers} ಆಟಗಾರರು</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 rounded bg-[#132d54] text-white disabled:opacity-50"
                    >
                      ಹಿಂದಿನ ಪುಟ
                    </button>
                    <span>ಪುಟ {page}</span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page * 15 >= totalPlayers}
                      className="px-3 py-1.5 rounded bg-[#132d54] text-white disabled:opacity-50"
                    >
                      ಮುಂದಿನ ಪುಟ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS (SUPERVISOR ONLY) */}
          {activeTab === 'settings' && isSupervisor && (
            <div className="max-w-3xl space-y-6">
              <h2 className="text-2xl font-black text-white">
                ಪಂದ್ಯಾವಳಿ ಸೆಟ್ಟಿಂಗ್ಸ್ (Tournament Configuration)
              </h2>

              <form onSubmit={handleSaveSettings} className="bg-[#0a192f] p-6 sm:p-8 rounded-2xl border-2 border-[#d4af37]/40 shadow-xl space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        setSettingsForm({
                          ...settingsForm,
                          registrationCapacity: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white"
                    />
                  </div>

                  {/* Open/Close Switch */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      ನೋಂದಣಿ ಸ್ಥಿತಿ:
                    </label>
                    <select
                      value={settingsForm.registrationOpen ? 'true' : 'false'}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          registrationOpen: e.target.value === 'true',
                        })
                      }
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white font-bold"
                    >
                      <option value="true">ತೆರೆಯಲಾಗಿದೆ (Registration Open)</option>
                      <option value="false">ಮುಚ್ಚಲಾಗಿದೆ (Registration Closed)</option>
                    </select>
                  </div>

                  {/* Tournament Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      ಪಂದ್ಯಾವಳಿ ಹೆಸರು:
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.tournamentName}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, tournamentName: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white font-bold"
                    />
                  </div>

                  {/* Season */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">ಸೀಸನ್:</label>
                    <input
                      type="text"
                      value={settingsForm.season}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, season: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white"
                    />
                  </div>

                  {/* Dates */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">ದಿನಾಂಕಗಳು:</label>
                    <input
                      type="text"
                      value={settingsForm.tournamentDates}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, tournamentDates: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white"
                    />
                  </div>

                  {/* Venue */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-300 mb-1">ಸ್ಥಳ (Venue):</label>
                    <input
                      type="text"
                      value={settingsForm.tournamentVenue}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, tournamentVenue: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white"
                    />
                  </div>

                  {/* 1st Prize */}
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
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white font-bold text-emerald-400"
                    />
                  </div>

                  {/* 2nd Prize */}
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
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white font-bold text-emerald-400"
                    />
                  </div>

                  {/* Contacts */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      ಸಂಪರ್ಕ ೧ (ಹೆಸರು & ಸಂಖ್ಯೆ):
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="ಹೆಸರು"
                        value={settingsForm.contactName1}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, contactName1: e.target.value })
                        }
                        className="px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white"
                      />
                      <input
                        type="text"
                        placeholder="ಸಂಖ್ಯೆ"
                        value={settingsForm.contactNumber1}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, contactNumber1: e.target.value })
                        }
                        className="px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      ಸಂಪರ್ಕ ೨ (ಹೆಸರು & ಸಂಖ್ಯೆ):
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="ಹೆಸರು"
                        value={settingsForm.contactName2}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, contactName2: e.target.value })
                        }
                        className="px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white"
                      />
                      <input
                        type="text"
                        placeholder="ಸಂಖ್ಯೆ"
                        value={settingsForm.contactNumber2}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, contactNumber2: e.target.value })
                        }
                        className="px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-gray-950 font-extrabold text-sm shadow-gold hover:brightness-110 flex items-center gap-2"
                  >
                    {savingSettings ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-gray-950" />
                        <span>ಉಳಿಸಲಾಗುತ್ತಿದೆ...</span>
                      </>
                    ) : (
                      <span>ಸೆಟ್ಟಿಂಗ್ಸ್ ಉಳಿಸಿ (Save Settings)</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: ADMIN USERS (SUPERVISOR ONLY) */}
          {activeTab === 'admins' && isSupervisor && (
            <div className="max-w-4xl space-y-8">
              <h2 className="text-2xl font-black text-white">
                ನಿರ್ವಾಹಕರ ಖಾತೆ ನಿರ್ವಹಣೆ (Admin Accounts)
              </h2>

              {/* Create Admin Form */}
              <div className="bg-[#0a192f] p-6 rounded-2xl border border-gray-800">
                <h3 className="text-sm font-bold text-[#fbbf24] uppercase mb-4 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  <span>ಹೊಸ ಸಿಬ್ಬಂದಿ ನಿರ್ವಾಹಕರನ್ನು ರಚಿಸಿ</span>
                </h3>

                <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      ಬಳಕೆದಾರ ಹೆಸರು:
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdminUsername}
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      placeholder="ಉದಾ: scorer_01"
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      ಆರಂಭಿಕ ಪಾಸ್‌ವರ್ಡ್:
                    </label>
                    <input
                      type="password"
                      required
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳು"
                      className="w-full px-3 py-2 bg-[#0e2444] border border-gray-700 rounded-lg text-white text-xs"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={creatingAdmin}
                      className="w-full py-2 bg-[#fbbf24] text-gray-950 font-bold rounded-lg text-xs hover:brightness-110"
                    >
                      {creatingAdmin ? 'ರಚಿಸಲಾಗುತ್ತಿದೆ...' : 'ಖಾತೆ ರಚಿಸಿ'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Admins List Table */}
              <div className="bg-[#0a192f] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#0e2444] text-[#fbbf24] uppercase text-xs font-bold border-b border-gray-700">
                    <tr>
                      <th className="p-3">ಬಳಕೆದಾರ ಹೆಸರು</th>
                      <th className="p-3">ಪಾತ್ರ</th>
                      <th className="p-3">ಸ್ಥಿತಿ</th>
                      <th className="p-3">ಕ್ರಮಗಳು</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-gray-200">
                    {adminsList.map((adm) => (
                      <tr key={adm.id} className="hover:bg-[#0e2444]/50">
                        <td className="p-3 font-bold font-mono text-white">{adm.username}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              adm.role === 'supervisor'
                                ? 'bg-[#b91c1c] text-white'
                                : 'bg-gray-800 text-gray-300'
                            }`}
                          >
                            {adm.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              adm.isActive
                                ? 'bg-emerald-950 text-emerald-400'
                                : 'bg-red-950 text-red-400'
                            }`}
                          >
                            {adm.isActive ? 'ಸಕ್ರಿಯ' : 'ಅಮಾನತು'}
                          </span>
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

          {/* TAB 5: ACTIVITY LOGS (SUPERVISOR ONLY) */}
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
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0e2444] text-[#fbbf24] uppercase text-xs font-bold border-b border-gray-700">
                    <tr>
                      <th className="p-3">ಸಮಯ</th>
                      <th className="p-3">ನಿರ್ವಾಹಕರು</th>
                      <th className="p-3">ಕ್ರಮ (Action)</th>
                      <th className="p-3">ವಿವರ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-gray-300 font-mono">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#0e2444]/50">
                        <td className="p-3 text-gray-400">
                          {new Date(log.timestamp).toLocaleString('kn-IN')}
                        </td>
                        <td className="p-3 font-bold text-white">{log.adminUsername || '-'}</td>
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
