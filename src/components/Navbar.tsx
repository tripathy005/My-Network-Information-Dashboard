import React, { useState, useEffect } from 'react';
import {
  Network,
  RefreshCw,
  Copy,
  Search,
  FileJson,
  Check,
  Activity,
  Globe,
  Radio,
  Clock,
  Compass,
  Cpu,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { CategoryFilter } from '../types';

interface NavbarProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  publicIp?: string;
  onCopyIp: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: CategoryFilter;
  setSelectedCategory: (cat: CategoryFilter) => void;
  isOnline: boolean;
  onOpenReportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefresh,
  isRefreshing,
  publicIp,
  onCopyIp,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  isOnline,
  onOpenReportModal,
}) => {
  const [copiedIp, setCopiedIp] = useState(false);
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDate(
        now.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyIpClick = () => {
    onCopyIp();
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const categories: { id: CategoryFilter; label: string; icon: React.ElementType }[] = [
    { id: 'ALL', label: 'All Telemetry', icon: Activity },
    { id: 'NETWORK', label: 'Network & IP', icon: Radio },
    { id: 'LOCATION', label: 'Geo Location', icon: Globe },
    { id: 'SYSTEM', label: 'OS & Device', icon: Smartphone },
    { id: 'BROWSER', label: 'Browser Engine', icon: Compass },
    { id: 'SCREEN', label: 'Screen & Display', icon: Monitor },
    { id: 'TIME', label: 'Time & Locale', icon: Clock },
    { id: 'HARDWARE', label: 'Hardware Specs', icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0f121d]/95 backdrop-blur-md border-b-4 border-black px-4 py-3 shadow-[0_4px_0_0_#000000]">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#facc15] text-black border-3 border-black shadow-[3px_3px_0px_0px_#000000]">
              <Network className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white uppercase font-mono">
                  My Network Info
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-black uppercase border-2 border-black ${
                    isOnline ? 'bg-emerald-400 text-black' : 'bg-rose-500 text-white'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOnline ? 'bg-emerald-950 animate-ping' : 'bg-white'
                    }`}
                  />
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">
                Real-Time Public Network, System & Client Diagnostic Telemetry
              </p>
            </div>
          </div>

          {/* Clock & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 ml-auto">
            {/* Live Time Display */}
            <div className="hidden md:flex flex-col items-end px-3 py-1 bg-[#181c2b] border-2 border-black font-mono shadow-[2px_2px_0px_0px_#000000]">
              <span className="text-xs text-amber-400 font-bold">{time || '--:--:--'}</span>
              <span className="text-[10px] text-slate-400">{date}</span>
            </div>

            {/* Quick Copy IP Button */}
            {publicIp && (
              <button
                onClick={handleCopyIpClick}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#1e2336] hover:bg-[#282f48] text-amber-300 font-mono text-xs font-bold border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000] transition-all"
                title="Copy Public IP Address"
              >
                {copiedIp ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{publicIp}</span>
              </button>
            )}

            {/* Export JSON Button */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#06b6d4] hover:bg-[#22d3ee] text-black font-extrabold text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000] transition-all"
              title="View & Export Full Telemetry Report JSON"
            >
              <FileJson className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Export Report</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-3.5 py-2 bg-[#facc15] hover:bg-[#fde047] disabled:bg-slate-700 text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000] transition-all ${
                isRefreshing ? 'cursor-not-allowed opacity-80' : ''
              }`}
            >
              <RefreshCw className={`w-4 h-4 stroke-[2.5] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Category Filter Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 pt-1">
          {/* Search Bar */}
          <div className="relative min-w-[240px] max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search telemetry (e.g. Location, ISP, OS)..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#141724] text-white placeholder-slate-500 font-mono text-xs border-2 border-black focus:outline-none focus:border-[#facc15] shadow-[2px_2px_0px_0px_#000000]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase whitespace-nowrap transition-all border-2 border-black ${
                    isSelected
                      ? 'bg-[#ec4899] text-white shadow-[2px_2px_0px_0px_#000000] translate-x-[-1px] translate-y-[-1px]'
                      : 'bg-[#181c2b] text-slate-300 hover:bg-[#23293e] hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
