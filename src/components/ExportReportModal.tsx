import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Download, FileText, Code2 } from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: Record<string, unknown>;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info') => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  reportData,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'json' | 'summary'>('json');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(reportData, null, 2);

  const generateSummaryText = () => {
    const net = (reportData.network as Record<string, unknown>) || {};
    const sys = (reportData.system as Record<string, unknown>) || {};
    const browser = (reportData.browser as Record<string, unknown>) || {};
    const time = (reportData.time as Record<string, unknown>) || {};

    return `=== MY NETWORK INFORMATION DIAGNOSTIC REPORT ===
Generated: ${new Date().toISOString()}

[PUBLIC NETWORK TELEMETRY]
Public IP: ${net.ip || 'N/A'} (${net.ipType || 'IPv4'})
ISP Name: ${net.isp || 'N/A'}
Organization: ${net.org || 'N/A'}
ASN: ${net.asn || 'N/A'}
Location: ${net.city || 'N/A'}, ${net.region || 'N/A'}, ${net.country || 'N/A'} (${net.countryCode || ''})
Coordinates: ${net.latitude || 0}, ${net.longitude || 0}
Data Provider: ${net.providerUsed || 'Unknown'}

[CLIENT SYSTEM & DEVICE]
OS: ${sys.name || 'N/A'} ${sys.version || ''} (${sys.architecture || ''})
Device Type: ${sys.deviceType || 'Desktop'}
Browser: ${browser.name || 'N/A'} v${browser.version || ''} (${browser.engine || ''})
Time Zone: ${time.timeZone || 'UTC'} (${time.utcOffset || ''})
Online Status: ${browser.online ? 'ONLINE' : 'OFFLINE'}
User Agent: ${browser.userAgent || 'N/A'}
===================================================`;
  };

  const currentContent = activeTab === 'json' ? jsonString : generateSummaryText();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    onShowToast('Report Copied to Clipboard', 'Full diagnostic log ready for pasting', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `network-diagnostic-${Date.now()}.${activeTab === 'json' ? 'json' : 'txt'}`;
    const blob = new Blob([currentContent], {
      type: activeTab === 'json' ? 'application/json' : 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Report Downloaded', `Saved as ${filename}`, 'success');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-3xl bg-[#121522] border-4 border-black shadow-[8px_8px_0px_0px_#facc15] flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-[#facc15] text-black border-b-4 border-black">
            <div className="flex items-center gap-2.5">
              <Code2 className="w-6 h-6 stroke-[2.5]" />
              <h2 className="text-lg font-black uppercase tracking-tight font-mono">
                Telemetry Report & Diagnostics
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 bg-black text-white hover:bg-rose-600 transition-colors border-2 border-black"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Subheader Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#191d2d] border-b-2 border-slate-800 font-mono">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('json')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase border-2 border-black ${
                  activeTab === 'json'
                    ? 'bg-[#ec4899] text-white shadow-[2px_2px_0px_0px_#000000]'
                    : 'bg-[#10131f] text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>JSON Format</span>
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase border-2 border-black ${
                  activeTab === 'summary'
                    ? 'bg-[#06b6d4] text-black shadow-[2px_2px_0px_0px_#000000]'
                    : 'bg-[#10131f] text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Text Summary</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#84cc16] hover:bg-[#a3e635] text-black font-extrabold text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#3b82f6] hover:bg-[#60a5fa] text-white font-extrabold text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Log Output Viewer */}
          <div className="p-4 overflow-y-auto flex-1 bg-[#090b12]">
            <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap break-all leading-relaxed p-4 bg-[#05060a] border border-slate-800">
              {currentContent}
            </pre>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
