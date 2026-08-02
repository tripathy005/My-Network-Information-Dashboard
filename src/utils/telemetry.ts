import {
  BrowserTelemetry,
  OperatingSystemTelemetry,
  ScreenTelemetry,
  SystemHardwareTelemetry,
  TimeTelemetry,
} from '../types';

export function getBrowserTelemetry(): BrowserTelemetry {
  const ua = navigator.userAgent || '';
  let name = 'Unknown Browser';
  let version = 'Unknown';
  let engine = 'Unknown Engine';

  // Detecting Engine
  if (ua.includes('AppleWebKit')) {
    engine = ua.includes('Chrome') || ua.includes('Chromium') ? 'Blink' : 'WebKit';
  } else if (ua.includes('Gecko') && !ua.includes('like Gecko')) {
    engine = 'Gecko';
  } else if (ua.includes('Trident')) {
    engine = 'Trident';
  }

  // Detecting Browser
  if (ua.includes('Edg/')) {
    name = 'Microsoft Edge';
    const match = ua.match(/Edg\/([\d.]+)/);
    if (match) version = match[1];
  } else if (ua.includes('OPR/') || ua.includes('Opera/')) {
    name = 'Opera';
    const match = ua.match(/(?:OPR|Opera)\/([\d.]+)/);
    if (match) version = match[1];
  } else if (ua.includes('SamsungBrowser/')) {
    name = 'Samsung Internet';
    const match = ua.match(/SamsungBrowser\/([\d.]+)/);
    if (match) version = match[1];
  } else if (ua.includes('Vivaldi/')) {
    name = 'Vivaldi';
    const match = ua.match(/Vivaldi\/([\d.]+)/);
    if (match) version = match[1];
  } else if (ua.includes('Chrome/')) {
    name = 'Google Chrome';
    const match = ua.match(/Chrome\/([\d.]+)/);
    if (match) version = match[1];
  } else if (ua.includes('Firefox/')) {
    name = 'Mozilla Firefox';
    const match = ua.match(/Firefox\/([\d.]+)/);
    if (match) version = match[1];
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    name = 'Apple Safari';
    const match = ua.match(/Version\/([\d.]+)/);
    if (match) version = match[1];
  } else if (ua.includes('MSIE') || ua.includes('Trident/')) {
    name = 'Internet Explorer';
    const match = ua.match(/(?:MSIE |rv:)([\d.]+)/);
    if (match) version = match[1];
  }

  // Brave detection check
  if ((navigator as unknown as { brave?: { isBrave: () => Promise<boolean> } }).brave) {
    name = 'Brave Browser';
  }

  return {
    name,
    version,
    engine,
    userAgent: ua,
    language: navigator.language || 'en-US',
    languages: Array.from(navigator.languages || [navigator.language || 'en-US']),
    cookiesEnabled: navigator.cookieEnabled,
    javaScriptEnabled: true,
    doNotTrack: navigator.doNotTrack === '1' || (window as unknown as { doNotTrack?: string }).doNotTrack === '1',
    online: navigator.onLine,
    referrer: document.referrer || 'Direct Access / None',
    currentUrl: window.location.href,
  };
}

export function getOperatingSystemTelemetry(): OperatingSystemTelemetry {
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || 'Unknown Platform';
  let name = 'Unknown OS';
  let version = 'Unknown Version';
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';

  // Device type detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua);

  if (isTablet) {
    deviceType = 'Tablet';
  } else if (isMobile) {
    deviceType = 'Mobile';
  } else {
    deviceType = 'Desktop';
  }

  // OS Detection
  if (ua.includes('Win')) {
    name = 'Windows';
    if (ua.includes('Windows NT 10.0')) version = '10 / 11';
    else if (ua.includes('Windows NT 6.3')) version = '8.1';
    else if (ua.includes('Windows NT 6.2')) version = '8';
    else if (ua.includes('Windows NT 6.1')) version = '7';
  } else if (ua.includes('Mac OS X') || ua.includes('Macintosh')) {
    name = 'macOS';
    const match = ua.match(/Mac OS X ([\d_]+)/);
    if (match) version = match[1].replace(/_/g, '.');
  } else if (ua.includes('Android')) {
    name = 'Android';
    const match = ua.match(/Android ([\d.]+)/);
    if (match) version = match[1];
  } else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) {
    name = 'iOS';
    const match = ua.match(/OS ([\d_]+) like Mac OS X/);
    if (match) version = match[1].replace(/_/g, '.');
  } else if (ua.includes('CrOS')) {
    name = 'ChromeOS';
  } else if (ua.includes('Linux')) {
    name = 'Linux';
  }

  return {
    name,
    version,
    platform,
    deviceType,
    architecture: ua.includes('x86_64') || ua.includes('Win64') || ua.includes('x64') ? '64-bit' : '32-bit/ARM',
  };
}

export function getScreenTelemetry(): ScreenTelemetry {
  const width = window.screen.width;
  const height = window.screen.height;
  const availWidth = window.screen.availWidth;
  const availHeight = window.screen.availHeight;
  const innerWidth = window.innerWidth;
  const innerHeight = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  const colorDepth = window.screen.colorDepth || 24;

  const isLandscape = window.matchMedia('(orientation: landscape)').matches;

  return {
    resolution: `${width} x ${height} px`,
    availSize: `${availWidth} x ${availHeight} px`,
    windowSize: `${innerWidth} x ${innerHeight} px`,
    pixelRatio: dpr,
    colorDepth: colorDepth,
    orientation: isLandscape ? 'Landscape ↔️' : 'Portrait ↕️',
  };
}

export function getSystemHardwareTelemetry(): SystemHardwareTelemetry {
  const nav = navigator as unknown as {
    hardwareConcurrency?: number;
    deviceMemory?: number;
    maxTouchPoints?: number;
    connection?: {
      type?: string;
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
  };

  const cores = nav.hardwareConcurrency || 4;
  const memory = nav.deviceMemory ? `${nav.deviceMemory} GB` : 'Not exposed by browser';
  const touchPoints = nav.maxTouchPoints || 0;
  const touchSupport = touchPoints > 0 || 'ontouchstart' in window;

  const conn = nav.connection;

  return {
    cpuCores: cores,
    deviceMemoryGB: memory,
    touchSupport,
    maxTouchPoints: touchPoints,
    hardwareConcurrency: cores,
    connectionType: conn?.type || 'Standard Network',
    effectiveType: conn?.effectiveType ? conn.effectiveType.toUpperCase() : 'Broadband / High Speed',
    downlinkSpeedMbps: conn?.downlink,
    roundTripTimeMs: conn?.rtt,
    saveDataMode: conn?.saveData || false,
  };
}

export function getTimeTelemetry(serverTimeIso?: string): TimeTelemetry {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const now = new Date();

  // UTC offset calculation
  const offsetMinutes = -now.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
  const mins = Math.abs(offsetMinutes) % 60;
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const utcOffset = `UTC ${sign}${String(offsetHours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

  const localTimeString = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const localIsoDate = now.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // DST check
  const jan = new Date(now.getFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(now.getFullYear(), 6, 1).getTimezoneOffset();
  const isDst = now.getTimezoneOffset() < Math.max(jan, jul);

  return {
    timeZone,
    utcOffset,
    localTimeString,
    localIsoDate,
    isDst,
    serverTime: serverTimeIso ? new Date(serverTimeIso).toLocaleTimeString() : undefined,
  };
}
