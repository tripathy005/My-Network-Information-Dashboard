export interface NetworkApiResponse {
  success: boolean;
  ip: string;
  ipType: 'IPv4' | 'IPv6';
  isp: string;
  org: string;
  asn: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utcOffset: string;
  currency: string;
  flag: string;
  serverTime: string;
  providerUsed: string;
  detectedClientHeaderIp?: string;
  error?: string;
}

export interface BrowserTelemetry {
  name: string;
  version: string;
  engine: string;
  userAgent: string;
  language: string;
  languages: string[];
  cookiesEnabled: boolean;
  javaScriptEnabled: boolean;
  doNotTrack: boolean;
  online: boolean;
  referrer: string;
  currentUrl: string;
}

export interface OperatingSystemTelemetry {
  name: string;
  version: string;
  platform: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  architecture?: string;
}

export interface ScreenTelemetry {
  resolution: string;
  availSize: string;
  windowSize: string;
  pixelRatio: number;
  colorDepth: number;
  orientation: string;
}

export interface SystemHardwareTelemetry {
  cpuCores: number;
  deviceMemoryGB: number | string;
  touchSupport: boolean;
  maxTouchPoints: number;
  hardwareConcurrency: number;
  connectionType?: string;
  effectiveType?: string;
  downlinkSpeedMbps?: number;
  roundTripTimeMs?: number;
  saveDataMode?: boolean;
}

export interface TimeTelemetry {
  timeZone: string;
  utcOffset: string;
  localTimeString: string;
  localIsoDate: string;
  isDst: boolean;
  serverTime?: string;
}

export interface PingTelemetry {
  latencyMs: number | null;
  status: 'idle' | 'testing' | 'success' | 'failed';
  lastTestedAt?: string;
}

export interface ToastNotification {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

export type CategoryFilter =
  | 'ALL'
  | 'NETWORK'
  | 'LOCATION'
  | 'SYSTEM'
  | 'BROWSER'
  | 'SCREEN'
  | 'TIME'
  | 'HARDWARE';
