import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to determine if an IP is loopback or private
function isPrivateOrLocalIp(ip: string | undefined): boolean {
  if (!ip) return true;
  const cleaned = ip.replace(/^::ffff:/, '').trim();
  if (cleaned === '127.0.0.1' || cleaned === '::1' || cleaned === 'localhost') return true;
  if (cleaned.startsWith('10.') || cleaned.startsWith('192.168.')) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(cleaned)) return true;
  return false;
}

// Extract client IP from headers
function getClientIp(req: express.Request): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const rawIp = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    const cleaned = rawIp.replace(/^::ffff:/, '').trim();
    if (!isPrivateOrLocalIp(cleaned)) {
      return cleaned;
    }
  }

  const realIp = req.headers['x-real-ip'] || req.headers['cf-connecting-ip'];
  if (realIp && typeof realIp === 'string') {
    const cleaned = realIp.replace(/^::ffff:/, '').trim();
    if (!isPrivateOrLocalIp(cleaned)) {
      return cleaned;
    }
  }

  const socketIp = req.socket.remoteAddress ? req.socket.remoteAddress.replace(/^::ffff:/, '').trim() : null;
  if (socketIp && !isPrivateOrLocalIp(socketIp)) {
    return socketIp;
  }

  return null;
}

// Ping endpoint for latency measurement
app.get('/api/ping', (req, res) => {
  res.json({
    pong: true,
    serverTimestamp: Date.now(),
  });
});

// Primary network information API with failover providers
app.get('/api/network-info', async (req, res) => {
  const clientIp = getClientIp(req);

  // Attempt 1: ipwho.is
  try {
    const targetUrl = clientIp ? `http://ipwho.is/${clientIp}` : 'http://ipwho.is/';
    const response = await fetch(targetUrl, { signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const data = await response.json();
      if (data.success !== false && data.ip) {
        return res.json({
          success: true,
          ip: data.ip,
          ipType: data.type || (data.ip.includes(':') ? 'IPv6' : 'IPv4'),
          isp: data.connection?.isp || data.isp || 'Unknown ISP',
          org: data.connection?.org || data.org || data.connection?.isp || 'Unknown Org',
          asn: data.connection?.asn ? `ASN${data.connection.asn}` : 'N/A',
          country: data.country || 'Unknown Country',
          countryCode: data.country_code || '',
          region: data.region || data.region_code || 'Unknown Region',
          city: data.city || 'Unknown City',
          postal: data.postal || 'N/A',
          latitude: data.latitude ?? 0,
          longitude: data.longitude ?? 0,
          timezone: data.timezone?.id || 'UTC',
          utcOffset: data.timezone?.utc || '+00:00',
          currency: data.currency || '',
          flag: data.flag?.emoji || '🌐',
          serverTime: new Date().toISOString(),
          providerUsed: 'ipwho.is',
          detectedClientHeaderIp: clientIp || 'Auto-Detected',
        });
      }
    }
  } catch (err) {
    console.warn('ipwho.is failed, trying ipapi.co fallback:', err);
  }

  // Attempt 2: ipapi.co
  try {
    const targetUrl = clientIp ? `https://ipapi.co/${clientIp}/json/` : 'https://ipapi.co/json/';
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.ip && !data.error) {
        return res.json({
          success: true,
          ip: data.ip,
          ipType: data.ip.includes(':') ? 'IPv6' : 'IPv4',
          isp: data.org || data.asn || 'Unknown ISP',
          org: data.org || 'Unknown Org',
          asn: data.asn || 'N/A',
          country: data.country_name || 'Unknown Country',
          countryCode: data.country_code || '',
          region: data.region || 'Unknown Region',
          city: data.city || 'Unknown City',
          postal: data.postal || 'N/A',
          latitude: data.latitude ?? 0,
          longitude: data.longitude ?? 0,
          timezone: data.timezone || 'UTC',
          utcOffset: data.utc_offset || '+00:00',
          currency: data.currency || '',
          flag: '🌐',
          serverTime: new Date().toISOString(),
          providerUsed: 'ipapi.co',
          detectedClientHeaderIp: clientIp || 'Auto-Detected',
        });
      }
    }
  } catch (err) {
    console.warn('ipapi.co failed, trying ipinfo.io fallback:', err);
  }

  // Attempt 3: ipinfo.io
  try {
    const targetUrl = clientIp ? `https://ipinfo.io/${clientIp}/json` : 'https://ipinfo.io/json';
    const response = await fetch(targetUrl, { signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const data = await response.json();
      if (data.ip) {
        const [lat, lng] = (data.loc || '0,0').split(',').map(Number);
        return res.json({
          success: true,
          ip: data.ip,
          ipType: data.ip.includes(':') ? 'IPv6' : 'IPv4',
          isp: data.org || 'Unknown ISP',
          org: data.org || 'Unknown Org',
          asn: data.org ? data.org.split(' ')[0] : 'N/A',
          country: data.country || 'Unknown Country',
          countryCode: data.country || '',
          region: data.region || 'Unknown Region',
          city: data.city || 'Unknown City',
          postal: data.postal || 'N/A',
          latitude: lat || 0,
          longitude: lng || 0,
          timezone: data.timezone || 'UTC',
          utcOffset: '+00:00',
          currency: '',
          flag: '🌐',
          serverTime: new Date().toISOString(),
          providerUsed: 'ipinfo.io',
          detectedClientHeaderIp: clientIp || 'Auto-Detected',
        });
      }
    }
  } catch (err) {
    console.warn('ipinfo.io failed, returning IP-only fallback:', err);
  }

  // Final Fallback: ipify.org for IP only
  try {
    const response = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(4000) });
    if (response.ok) {
      const data = await response.json();
      return res.json({
        success: true,
        ip: data.ip,
        ipType: data.ip.includes(':') ? 'IPv6' : 'IPv4',
        isp: 'IP Telemetry Service',
        org: 'Network Provider',
        asn: 'N/A',
        country: 'Global',
        countryCode: '',
        region: 'Global Network',
        city: 'Online',
        postal: 'N/A',
        latitude: 0,
        longitude: 0,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        utcOffset: '+00:00',
        currency: '',
        flag: '🌐',
        serverTime: new Date().toISOString(),
        providerUsed: 'ipify.org',
        detectedClientHeaderIp: clientIp || 'Auto-Detected',
      });
    }
  } catch (err) {
    console.error('All IP geolocation fallbacks failed:', err);
  }

  // Default fallback if all offline or failed
  return res.status(500).json({
    success: false,
    error: 'Unable to retrieve IP network details from external providers at this time.',
    fallbackTime: new Date().toISOString(),
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`My Network Information Dashboard Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
