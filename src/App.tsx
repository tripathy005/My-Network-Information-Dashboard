import React, { useState, useEffect, useCallback, useMemo, ElementType } from 'react';
import {
  Radio,
  Globe,
  Compass,
  Smartphone,
  Clock,
  Monitor,
  Cpu,
  Layers,
  Activity,
  Zap,
  MapPin,
  Wifi,
  Sliders,
  Sparkles,
} from 'lucide-react';

import {
  NetworkApiResponse,
  BrowserTelemetry,
  OperatingSystemTelemetry,
  ScreenTelemetry,
  SystemHardwareTelemetry,
  TimeTelemetry,
  ToastNotification,
  CategoryFilter,
  PingTelemetry,
} from './types';

import {
  getBrowserTelemetry,
  getOperatingSystemTelemetry,
  getScreenTelemetry,
  getSystemHardwareTelemetry,
  getTimeTelemetry,
} from './utils/telemetry';

import { Navbar } from './components/Navbar';
import { InfoCard, InfoItem } from './components/InfoCard';
import { Toast } from './components/Toast';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { BackgroundEffect } from './components/BackgroundEffect';
import { ExportReportModal } from './components/ExportReportModal';

export default function App() {
  // State variables
  const [networkData, setNetworkData] = useState<NetworkApiResponse | null>(null);
  const [browserData, setBrowserData] = useState<BrowserTelemetry | null>(null);
  const [osData, setOsData] = useState<OperatingSystemTelemetry | null>(null);
  const [screenData, setScreenData] = useState<ScreenTelemetry | null>(null);
  const [hardwareData, setHardwareData] = useState<SystemHardwareTelemetry | null>(null);
  const [timeData, setTimeData] = useState<TimeTelemetry | null>(null);

  const [isLoadingNetwork, setIsLoadingNetwork] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Latency / Ping diagnostic state
  const [pingData, setPingData] = useState<PingTelemetry>({
    latencyMs: null,
    status: 'idle',
  });

  // Helper to trigger toast notification
  const addToast = useCallback(
    (title: string, message?: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Ping Latency Measurement
  const runPingTest = useCallback(async () => {
    setPingData((prev) => ({ ...prev, status: 'testing' }));
    const startTime = performance.now();
    try {
      const res = await fetch('/api/ping?t=' + Date.now());
      if (res.ok) {
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);
        setPingData({
          latencyMs: latency,
          status: 'success',
          lastTestedAt: new Date().toLocaleTimeString(),
        });
      } else {
        setPingData({ latencyMs: null, status: 'failed' });
      }
    } catch {
      setPingData({ latencyMs: null, status: 'failed' });
    }
  }, []);

  // Fetch API Network Telemetry
  const fetchNetworkInfo = useCallback(
    async (showSuccessToast = false) => {
      setIsLoadingNetwork(true);
      try {
        const res = await fetch('/api/network-info');
        const data: NetworkApiResponse = await res.json();
        if (data.success) {
          setNetworkData(data);
          if (showSuccessToast) {
            addToast(
              'Network Telemetry Updated',
              `Retrieved location & ISP details via ${data.providerUsed}`,
              'success'
            );
          }
        } else {
          addToast('Network API Warning', data.error || 'Partial telemetry retrieved', 'warning');
        }
      } catch (err) {
        console.error('Failed to fetch network information:', err);
        addToast('Network Request Error', 'Unable to reach backend network proxy', 'error');
      } finally {
        setIsLoadingNetwork(false);
      }
    },
    [addToast]
  );

  // Refresh client-side telemetry
  const refreshClientTelemetry = useCallback(() => {
    setBrowserData(getBrowserTelemetry());
    setOsData(getOperatingSystemTelemetry());
    setScreenData(getScreenTelemetry());
    setHardwareData(getSystemHardwareTelemetry());
    setTimeData(getTimeTelemetry(networkData?.serverTime));
  }, [networkData?.serverTime]);

  // Initial load
  useEffect(() => {
    fetchNetworkInfo();
    refreshClientTelemetry();
    runPingTest();
  }, [fetchNetworkInfo, refreshClientTelemetry, runPingTest]);

  // Window resize & orientation event listeners
  useEffect(() => {
    const handleResize = () => {
      setScreenData(getScreenTelemetry());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Online / Offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast('Network Reconnected', 'You are back online! 🟢', 'success');
      fetchNetworkInfo(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast('Network Disconnected', 'Connection lost! 🔴 Running in offline mode.', 'error');
      setBrowserData((prev) => (prev ? { ...prev, online: false } : null));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addToast, fetchNetworkInfo]);

  // Handle manual refresh
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    refreshClientTelemetry();
    await Promise.all([fetchNetworkInfo(true), runPingTest()]);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // Copy IP handler
  const handleCopyPublicIp = useCallback(() => {
    if (networkData?.ip) {
      navigator.clipboard.writeText(networkData.ip);
      addToast('IP Address Copied Successfully', networkData.ip, 'success');
    } else {
      addToast('Copy Failed', 'Public IP address not yet available', 'warning');
    }
  }, [networkData?.ip, addToast]);

  // Build Telemetry Card Data
  const cardsConfig = useMemo(() => {
    const list: {
      id: string;
      title: string;
      category: CategoryFilter;
      categoryBadge: string;
      icon: ElementType;
      accentColor: 'yellow' | 'cyan' | 'magenta' | 'lime' | 'violet' | 'orange' | 'blue' | 'emerald';
      items: InfoItem[];
      footerNote?: string;
    }[] = [];

    // 1. Public IP Card
    if (networkData) {
      list.push({
        id: 'public-ip-card',
        title: 'Public IP Address',
        category: 'NETWORK',
        categoryBadge: 'Primary Net',
        icon: Radio,
        accentColor: 'yellow',
        items: [
          {
            label: 'IPv4 / Public IP',
            value: networkData.ip || 'Detecting...',
            copyable: true,
            copyText: networkData.ip,
            highlight: true,
          },
          {
            label: 'Protocol Type',
            value: networkData.ipType || 'IPv4',
            badge: 'Verified',
          },
          {
            label: 'Data Provider',
            value: networkData.providerUsed || 'External Proxy',
            badge: 'API Engine',
          },
          {
            label: 'Server Latency',
            value:
              pingData.status === 'testing'
                ? 'Testing Ping...'
                : pingData.latencyMs !== null
                ? `${pingData.latencyMs} ms`
                : 'Failed',
            badge: pingData.latencyMs && pingData.latencyMs < 100 ? 'Fast⚡' : 'Normal',
            highlight: pingData.status === 'success',
          },
        ],
        footerNote: 'Your public IP is visible to web servers and network endpoints.',
      });

      // 2. ISP & Organization Card
      list.push({
        id: 'isp-card',
        title: 'ISP & Autonomous System',
        category: 'NETWORK',
        categoryBadge: 'Carrier Info',
        icon: Wifi,
        accentColor: 'cyan',
        items: [
          {
            label: 'ISP Name',
            value: networkData.isp || 'N/A',
            copyable: true,
            highlight: true,
          },
          {
            label: 'Organization',
            value: networkData.org || 'N/A',
            copyable: true,
          },
          {
            label: 'ASN Number',
            value: networkData.asn || 'N/A',
            copyable: true,
          },
          {
            label: 'Client Header IP',
            value: networkData.detectedClientHeaderIp || 'Proxy Verified',
          },
        ],
        footerNote: 'Autonomous System Numbers (ASN) identify network routing domains.',
      });

      // 3. Geolocation Card
      list.push({
        id: 'location-card',
        title: 'Geographic Location',
        category: 'LOCATION',
        categoryBadge: 'Geo IP',
        icon: MapPin,
        accentColor: 'magenta',
        items: [
          {
            label: 'Country',
            value: `${networkData.flag || ''} ${networkData.country || 'N/A'}`,
            copyable: true,
            copyText: networkData.country,
            highlight: true,
          },
          {
            label: 'State / Region',
            value: networkData.region || 'N/A',
            copyable: true,
          },
          {
            label: 'City',
            value: networkData.city || 'N/A',
            copyable: true,
          },
          {
            label: 'Postal Code',
            value: networkData.postal || 'N/A',
            copyable: true,
          },
        ],
        footerNote: 'Geolocation estimated based on ISP route registries.',
      });

      // 4. Coordinates & Map Card
      list.push({
        id: 'coordinates-card',
        title: 'Geographic Coordinates',
        category: 'LOCATION',
        categoryBadge: 'GPS Target',
        icon: Globe,
        accentColor: 'lime',
        items: [
          {
            label: 'Latitude',
            value: networkData.latitude ?? 'N/A',
            copyable: true,
          },
          {
            label: 'Longitude',
            value: networkData.longitude ?? 'N/A',
            copyable: true,
          },
          {
            label: 'Map Explorer',
            value: `${networkData.latitude}, ${networkData.longitude}`,
            actionUrl: `https://www.google.com/maps?q=${networkData.latitude},${networkData.longitude}`,
            actionLabel: 'View on Google Maps',
            copyable: false,
          },
          {
            label: 'Local Currency',
            value: networkData.currency || 'N/A',
          },
        ],
        footerNote: 'Click "View on Google Maps" to open map coordinates in new tab.',
      });
    }

    // 5. Browser Telemetry Card
    if (browserData) {
      list.push({
        id: 'browser-card',
        title: 'Browser & Engine',
        category: 'BROWSER',
        categoryBadge: 'Client Runtime',
        icon: Compass,
        accentColor: 'orange',
        items: [
          {
            label: 'Browser Name',
            value: browserData.name,
            highlight: true,
            copyable: true,
          },
          {
            label: 'Browser Version',
            value: browserData.version,
            copyable: true,
          },
          {
            label: 'Rendering Engine',
            value: browserData.engine,
            badge: 'Layout Engine',
          },
          {
            label: 'User Agent',
            value: browserData.userAgent,
            copyable: true,
          },
        ],
        footerNote: 'Browser capabilities determined via modern Navigator Web APIs.',
      });
    }

    // 6. Operating System & Device Card
    if (osData) {
      list.push({
        id: 'os-card',
        title: 'Operating System & Device',
        category: 'SYSTEM',
        categoryBadge: 'OS Platform',
        icon: Smartphone,
        accentColor: 'violet',
        items: [
          {
            label: 'OS Name',
            value: osData.name,
            highlight: true,
            copyable: true,
          },
          {
            label: 'OS Version',
            value: osData.version,
            copyable: true,
          },
          {
            label: 'Device Form Factor',
            value: osData.deviceType,
            badge: osData.deviceType === 'Desktop' ? '💻 Workstation' : '📱 Mobile/Tablet',
          },
          {
            label: 'System Architecture',
            value: osData.architecture || osData.platform,
          },
        ],
        footerNote: 'Identified from system platform flags and user agent profile.',
      });
    }

    // 7. Time & Zone Card
    if (timeData) {
      list.push({
        id: 'time-card',
        title: 'Time & Locale Specs',
        category: 'TIME',
        categoryBadge: 'Clock & UTC',
        icon: Clock,
        accentColor: 'blue',
        items: [
          {
            label: 'Time Zone',
            value: timeData.timeZone,
            highlight: true,
            copyable: true,
          },
          {
            label: 'UTC Offset',
            value: timeData.utcOffset,
            badge: 'Time Offset',
          },
          {
            label: 'Local Time',
            value: `${timeData.localTimeString} (${timeData.localIsoDate})`,
          },
          {
            label: 'Daylight Saving Time',
            value: timeData.isDst ? 'Active (DST)' : 'Standard Time',
          },
        ],
        footerNote: 'Resolved using Intl.DateTimeFormat system locale APIs.',
      });
    }

    // 8. Screen & Display Telemetry Card
    if (screenData) {
      list.push({
        id: 'screen-card',
        title: 'Screen & Display Telemetry',
        category: 'SCREEN',
        categoryBadge: 'Graphics Specs',
        icon: Monitor,
        accentColor: 'emerald',
        items: [
          {
            label: 'Screen Resolution',
            value: screenData.resolution,
            highlight: true,
            copyable: true,
          },
          {
            label: 'Viewport Window Size',
            value: screenData.windowSize,
            badge: 'Live Resizing',
          },
          {
            label: 'Pixel Density (DPR)',
            value: `${screenData.pixelRatio}x (${screenData.pixelRatio >= 2 ? 'Retina/HiDPI' : 'Standard'})`,
          },
          {
            label: 'Color Depth & Orientation',
            value: `${screenData.colorDepth}-bit | ${screenData.orientation}`,
          },
        ],
        footerNote: 'Updates dynamically when browser window is resized.',
      });
    }

    // 9. Hardware & System Performance Card
    if (hardwareData) {
      list.push({
        id: 'hardware-card',
        title: 'System Hardware & Cores',
        category: 'HARDWARE',
        categoryBadge: 'CPU & Memory',
        icon: Cpu,
        accentColor: 'yellow',
        items: [
          {
            label: 'Logical CPU Cores',
            value: `${hardwareData.cpuCores} Threads`,
            highlight: true,
            badge: 'Concurrency',
          },
          {
            label: 'Device RAM Estimate',
            value: hardwareData.deviceMemoryGB,
            copyable: true,
          },
          {
            label: 'Touch Support',
            value: hardwareData.touchSupport
              ? `Yes (${hardwareData.maxTouchPoints} Touch Points)`
              : 'No Touch (Pointer/Mouse)',
          },
          {
            label: 'Network Downlink / Speed',
            value: hardwareData.downlinkSpeedMbps
              ? `${hardwareData.downlinkSpeedMbps} Mbps (${hardwareData.effectiveType})`
              : hardwareData.effectiveType,
          },
        ],
        footerNote: 'Hardware concurrency reflects logical CPU core execution threads.',
      });
    }

    // 10. Security & Browser Settings Card
    if (browserData) {
      list.push({
        id: 'security-card',
        title: 'Browser Preferences & Privacy',
        category: 'BROWSER',
        categoryBadge: 'Preferences',
        icon: Sliders,
        accentColor: 'cyan',
        items: [
          {
            label: 'Preferred Language',
            value: browserData.language,
            copyable: true,
          },
          {
            label: 'Cookies Enabled',
            value: browserData.cookiesEnabled ? 'Yes 🟢' : 'Disabled 🔴',
            badge: 'Storage',
          },
          {
            label: 'JavaScript Execution',
            value: 'Active 🟢 (ECMAScript ES2022+)',
          },
          {
            label: 'Do Not Track (DNT)',
            value: browserData.doNotTrack ? 'Enabled (1)' : 'Not Set / Disabled (0)',
          },
          {
            label: 'HTTP Referrer',
            value: browserData.referrer,
          },
        ],
        footerNote: 'Reflects browser client security & storage capabilities.',
      });
    }

    return list;
  }, [networkData, browserData, osData, timeData, screenData, hardwareData, pingData]);

  // Filter cards based on Category and Search Query
  const filteredCards = useMemo(() => {
    return cardsConfig.filter((card) => {
      // Category filter
      if (selectedCategory !== 'ALL' && card.category !== selectedCategory) {
        return false;
      }
      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = card.title.toLowerCase().includes(q);
        const matchesBadge = card.categoryBadge.toLowerCase().includes(q);
        const matchesItem = card.items.some(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            String(item.value).toLowerCase().includes(q)
        );
        return matchesTitle || matchesBadge || matchesItem;
      }
      return true;
    });
  }, [cardsConfig, selectedCategory, searchQuery]);

  // Diagnostic Report Data Object
  const exportReportData = useMemo(() => {
    return {
      timestamp: new Date().toISOString(),
      network: networkData,
      browser: browserData,
      system: osData,
      screen: screenData,
      hardware: hardwareData,
      time: timeData,
      latency: pingData,
    };
  }, [networkData, browserData, osData, screenData, hardwareData, timeData, pingData]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d14] text-slate-100 relative selection:bg-[#facc15] selection:text-black">
      {/* Background Effect Grid */}
      <BackgroundEffect />

      {/* Header / Navbar */}
      <Navbar
        onRefresh={handleRefreshAll}
        isRefreshing={isRefreshing}
        publicIp={networkData?.ip}
        onCopyIp={handleCopyPublicIp}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isOnline={isOnline}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 z-10 space-y-8">
        {/* Top Feature Hero Banner */}
        <div className="relative p-6 bg-[#141724] border-4 border-black shadow-[8px_8px_0px_0px_#000000] overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#facc15] text-black font-extrabold text-xs uppercase border-2 border-black font-mono">
              <Zap className="w-4 h-4 stroke-[2.5]" />
              <span>Real-Time Network Telemetry Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase font-mono tracking-tight text-white leading-none">
              Detecting Public IP & System Diagnostics
            </h2>
            <p className="text-sm text-slate-300 font-mono leading-relaxed">
              Automatic IP geolocation, autonomous system lookup, browser rendering engine profiling, and display telemetry in an interactive Neo-Brutalist dashboard.
            </p>
          </div>

          {/* Highlights Quick Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto font-mono text-xs">
            <div className="p-3 bg-[#0e101a] border-2 border-black shadow-[3px_3px_0px_0px_#facc15]">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Your Public IP</div>
              <div className="font-extrabold text-amber-300 text-sm truncate mt-0.5">
                {networkData?.ip || 'Detecting...'}
              </div>
            </div>

            <div className="p-3 bg-[#0e101a] border-2 border-black shadow-[3px_3px_0px_0px_#06b6d4]">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Location</div>
              <div className="font-extrabold text-cyan-300 text-sm truncate mt-0.5">
                {networkData?.city ? `${networkData.city}, ${networkData.countryCode}` : 'Locating...'}
              </div>
            </div>

            <div className="p-3 bg-[#0e101a] border-2 border-black shadow-[3px_3px_0px_0px_#ec4899] col-span-2 sm:col-span-1">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Latency / Ping</div>
              <div className="font-extrabold text-pink-300 text-sm truncate mt-0.5">
                {pingData.latencyMs !== null ? `${pingData.latencyMs} ms` : 'Testing...'}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Filter Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-300 uppercase">
              Showing {filteredCards.length} Telemetry Modules
            </span>
            {selectedCategory !== 'ALL' && (
              <span className="px-2 py-0.5 bg-[#ec4899] text-white font-extrabold uppercase border border-black">
                Category: {selectedCategory}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 bg-[#06b6d4] text-black font-extrabold uppercase border border-black">
                Query: "{searchQuery}"
              </span>
            )}
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-amber-400 hover:underline font-bold"
            >
              Clear Search Filter
            </button>
          )}
        </div>

        {/* Loading Skeleton vs Card Grid */}
        {isLoadingNetwork && !networkData ? (
          <LoadingSkeleton />
        ) : filteredCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => (
              <InfoCard
                key={card.id}
                id={card.id}
                title={card.title}
                categoryBadge={card.categoryBadge}
                icon={card.icon}
                accentColor={card.accentColor}
                items={card.items}
                onCopySuccess={(label, text) =>
                  addToast('Copied to Clipboard', `${label}: ${text}`, 'success')
                }
                footerNote={card.footerNote}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-[#141724] border-4 border-black shadow-[8px_8px_0px_0px_#000000] space-y-4">
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-xl font-extrabold uppercase font-mono text-white">
              No Telemetry Cards Match Your Search
            </h3>
            <p className="text-slate-400 font-mono text-xs max-w-md mx-auto">
              Try adjusting your query or category filter to view all available system, network, location, and hardware metrics.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="px-4 py-2 bg-[#facc15] text-black font-extrabold uppercase text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000000]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t-4 border-black bg-[#0f121d] py-6 px-4 z-10 font-mono text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-200 uppercase">
              My Network Information Dashboard
            </span>
            <span>— Neo-Brutalist Telemetry Suite</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Provider: {networkData?.providerUsed || 'IP Engine'}</span>
            <span>•</span>
            <span>Status: {isOnline ? '🟢 Connected' : '🔴 Disconnected'}</span>
          </div>
        </div>
      </footer>

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportData={exportReportData}
        onShowToast={addToast}
      />
    </div>
  );
}
