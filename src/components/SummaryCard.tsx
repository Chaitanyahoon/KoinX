import React from 'react';
import type { SummaryGains } from '../types';
import { formatCurrency } from '../utils/calculations';

interface SummaryCardProps {
  title: string;
  subtitle: string;
  gains: SummaryGains;
  isAfter?: boolean;
  savings?: number;
  currency?: 'USD' | 'INR';
  isDark?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  subtitle,
  gains,
  isAfter = false,
  savings = 0,
  currency = 'USD',
  isDark = false,
}) => {
  const { stcg, ltcg, realised } = gains;

  // Pixels-per-pixel Figma styles for Light & Dark mode
  let cardBgClass = 'bg-white text-slate-800 border-slate-200 shadow-sm';
  let labelClass = 'text-slate-500';
  let headingClass = 'text-slate-400';
  let titleClass = 'text-[#0F294A] font-extrabold';
  let dividerClass = 'border-slate-100';

  if (isAfter) {
    // After Harvesting is always solid vibrant KoinX blue
    cardBgClass = 'bg-[#0B62F6] text-white border-[#0B62F6] shadow-md shadow-blue-100/10';
    labelClass = 'text-white/80';
    headingClass = 'text-white/95';
    titleClass = 'text-white font-extrabold';
    dividerClass = 'border-white/20';
  } else if (isDark) {
    // Pre Harvesting Card in Dark Mode
    cardBgClass = 'bg-[#161B26] text-white border-[#2E3A4E] shadow-sm';
    labelClass = 'text-[#8E9CAE]';
    headingClass = 'text-[#8E9CAE]';
    titleClass = 'text-white font-extrabold';
    dividerClass = 'border-[#2E3A4E]';
  }

  const valueClass = isAfter || isDark ? 'text-white' : 'text-slate-800';

  return (
    <div className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-205 ${cardBgClass}`}>
      <div>
        {/* Header Title Section */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className={`text-base font-bold tracking-tight ${titleClass}`}>
              {title}
            </h3>
            <p className={`text-[10px] mt-0.5 font-medium ${isAfter ? 'text-white/70' : isDark ? 'text-[#8E9CAE]/70' : 'text-slate-400'}`}>
              {subtitle}
            </p>
          </div>
        </div>

        {/* Short & Long Term Grid Layout */}
        <div className="space-y-4">
          {/* Header Row */}
          <div className={`grid grid-cols-3 text-right text-[10px] font-bold tracking-wider select-none border-b pb-1.5 border-dashed ${isAfter ? 'border-white/10' : isDark ? 'border-white/10' : 'border-slate-100'}`}>
            <div />
            <div className={`${headingClass}`}>Short-term</div>
            <div className={`${headingClass}`}>Long-term</div>
          </div>

          {/* Profits Row */}
          <div className="grid grid-cols-3 items-center text-xs font-bold">
            <span className={`${labelClass}`}>Profits</span>
            <span className={`text-right ${valueClass}`}>{formatCurrency(stcg.profits, currency)}</span>
            <span className={`text-right ${valueClass}`}>{formatCurrency(ltcg.profits, currency)}</span>
          </div>

          {/* Losses Row */}
          <div className="grid grid-cols-3 items-center text-xs font-bold">
            <span className={`${labelClass}`}>Losses</span>
            <span className="text-right text-rose-500">{formatCurrency(stcg.losses, currency)}</span>
            <span className="text-right text-rose-500">{formatCurrency(ltcg.losses, currency)}</span>
          </div>

          {/* Net Capital Gains Row */}
          <div className="grid grid-cols-3 items-center text-xs font-extrabold">
            <span className={`${labelClass}`}>Net Capital Gains</span>
            <span className={`text-right ${valueClass}`}>{formatCurrency(stcg.netGains, currency)}</span>
            <span className={`text-right ${valueClass}`}>{formatCurrency(ltcg.netGains, currency)}</span>
          </div>
        </div>
      </div>

      <div>
        {/* Divider */}
        <hr className={`my-4 border-t-2 ${dividerClass}`} />

        {/* Total/Effective Capital gains */}
        <div className="flex items-center justify-between font-extrabold text-xs">
          <span className="uppercase tracking-wider">
            {isAfter ? 'Effective Capital Gains' : 'Realised Capital Gains:'}
          </span>
          <span className={`text-xl tracking-tight font-black ${valueClass}`}>
            {formatCurrency(realised, currency)}
          </span>
        </div>

        {/* Savings banner inside After Card */}
        {isAfter && savings > 0 && (
          <div className="mt-4 p-3 bg-white/10 rounded-xl flex items-center gap-2 border border-white/20 animate-fade-in select-none">
            <span className="text-sm">🎉</span>
            <span className="text-[10px] font-bold text-white tracking-wide uppercase">
              You are going to save upto {formatCurrency(savings, currency)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
