import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, ExternalLink } from 'lucide-react';

export interface InfoItem {
  label: string;
  value: string | number | React.ReactNode;
  copyable?: boolean;
  copyText?: string;
  badge?: string;
  actionUrl?: string;
  actionLabel?: string;
  highlight?: boolean;
}

interface InfoCardProps {
  title: string;
  categoryBadge?: string;
  icon: React.ElementType;
  accentColor?: 'yellow' | 'cyan' | 'magenta' | 'lime' | 'violet' | 'orange' | 'blue' | 'emerald';
  items: InfoItem[];
  onCopySuccess?: (label: string, text: string) => void;
  footerNote?: string;
  className?: string;
  id?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  categoryBadge,
  icon: Icon,
  accentColor = 'yellow',
  items,
  onCopySuccess,
  footerNote,
  className = '',
  id,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const getAccentStyles = () => {
    switch (accentColor) {
      case 'cyan':
        return {
          headerBg: 'bg-[#06b6d4] text-black',
          border: 'border-[#06b6d4]',
          shadow: 'shadow-[5px_5px_0px_0px_#06b6d4]',
          highlightText: 'text-[#22d3ee]',
        };
      case 'magenta':
        return {
          headerBg: 'bg-[#ec4899] text-white',
          border: 'border-[#ec4899]',
          shadow: 'shadow-[5px_5px_0px_0px_#ec4899]',
          highlightText: 'text-[#f472b6]',
        };
      case 'lime':
        return {
          headerBg: 'bg-[#84cc16] text-black',
          border: 'border-[#84cc16]',
          shadow: 'shadow-[5px_5px_0px_0px_#84cc16]',
          highlightText: 'text-[#a3e635]',
        };
      case 'violet':
        return {
          headerBg: 'bg-[#a855f7] text-white',
          border: 'border-[#a855f7]',
          shadow: 'shadow-[5px_5px_0px_0px_#a855f7]',
          highlightText: 'text-[#c084fc]',
        };
      case 'orange':
        return {
          headerBg: 'bg-[#f97316] text-black',
          border: 'border-[#f97316]',
          shadow: 'shadow-[5px_5px_0px_0px_#f97316]',
          highlightText: 'text-[#fb923c]',
        };
      case 'blue':
        return {
          headerBg: 'bg-[#3b82f6] text-white',
          border: 'border-[#3b82f6]',
          shadow: 'shadow-[5px_5px_0px_0px_#3b82f6]',
          highlightText: 'text-[#60a5fa]',
        };
      case 'emerald':
        return {
          headerBg: 'bg-[#10b981] text-black',
          border: 'border-[#10b981]',
          shadow: 'shadow-[5px_5px_0px_0px_#10b981]',
          highlightText: 'text-[#34d399]',
        };
      case 'yellow':
      default:
        return {
          headerBg: 'bg-[#facc15] text-black',
          border: 'border-[#facc15]',
          shadow: 'shadow-[5px_5px_0px_0px_#facc15]',
          highlightText: 'text-[#fde047]',
        };
    }
  };

  const accent = getAccentStyles();

  const handleCopy = (item: InfoItem) => {
    const textToCopy = item.copyText || String(item.value);
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(item.label);
    if (onCopySuccess) {
      onCopySuccess(item.label, textToCopy);
    }
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, x: -2 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col bg-[#141722] border-3 border-black ${accent.shadow} transition-all duration-150 ${className}`}
    >
      {/* Header Bar */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b-3 border-black ${accent.headerBg}`}>
        <div className="flex items-center gap-2.5">
          <Icon className="w-5 h-5 stroke-[2.5]" />
          <h3 className="font-extrabold uppercase font-mono tracking-tight text-sm sm:text-base leading-tight">
            {title}
          </h3>
        </div>
        {categoryBadge && (
          <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-black text-white border border-black font-mono">
            {categoryBadge}
          </span>
        )}
      </div>

      {/* Card Content Grid */}
      <div className="p-4 flex-1 flex flex-col gap-3 font-mono text-xs">
        {items.map((item, index) => {
          const isCopied = copiedKey === item.label;
          return (
            <div
              key={index}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 p-2.5 bg-[#0e101a] border border-slate-800 ${
                item.highlight ? 'border-amber-400/50 bg-amber-500/5' : ''
              }`}
            >
              <div className="flex items-center gap-2 min-w-[120px]">
                <span className="text-slate-400 font-bold uppercase text-[11px] tracking-wide">
                  {item.label}
                </span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 bg-slate-800 text-amber-300 text-[9px] font-bold border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 justify-between sm:justify-end flex-1 break-all">
                <span
                  className={`font-semibold ${
                    item.highlight ? 'text-amber-300 font-bold text-sm' : 'text-slate-100'
                  }`}
                >
                  {item.value}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  {item.actionUrl && (
                    <a
                      href={item.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-[#1e2338] hover:bg-[#2a314d] text-amber-300 font-bold text-[10px] uppercase border border-black shadow-[1px_1px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    >
                      <span>{item.actionLabel || 'Open'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {item.copyable !== false && item.value && (
                    <button
                      onClick={() => handleCopy(item)}
                      className={`p-1 border border-black shadow-[1px_1px_0px_0px_#000000] transition-colors ${
                        isCopied
                          ? 'bg-emerald-400 text-black'
                          : 'bg-[#1e2338] hover:bg-[#2b3350] text-slate-300 hover:text-white'
                      }`}
                      title={`Copy ${item.label}`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {footerNote && (
          <div className="mt-auto pt-2 text-[10px] text-slate-400 italic flex items-center gap-1 border-t border-slate-800">
            <span>💡 {footerNote}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
