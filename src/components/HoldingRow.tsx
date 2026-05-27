import React from 'react';
import type { Holding } from '../types';
import { formatCurrency } from '../utils/calculations';

interface HoldingRowProps {
  holding: Holding;
  isSelected: boolean;
  onSelectToggle: (id: string) => void;
  sellAmount: number;
  onSellAmountChange: (id: string, amount: number) => void;
  currency?: 'USD' | 'INR';
  isDark?: boolean;
}

export const HoldingRow: React.FC<HoldingRowProps> = ({
  holding,
  isSelected,
  onSelectToggle,
  sellAmount,
  onSellAmountChange,
  currency = 'USD',
  isDark = false,
}) => {
  const {
    id,
    coin,
    coinName,
    logo,
    totalHolding,
    averageBuyPrice,
    currentPrice,
    stcg,
    ltcg,
    shortTermQtyText,
    longTermQtyText,
  } = holding;

  // Handle controlled input changes with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (isNaN(val)) {
      onSellAmountChange(id, 0);
      return;
    }

    // Clamp value between 0 and maximum holdings
    let clampedVal = Math.max(0, val);
    if (clampedVal > totalHolding) {
      clampedVal = totalHolding;
    }

    onSellAmountChange(id, clampedVal);
  };

  // Helper to format text-only gains exactly like Figma
  const renderGainField = (gain: number, qtyText?: string) => {
    if (gain === 0) {
      return <span className={`text-[10px] font-semibold select-none ${isDark ? 'text-slate-600' : 'text-slate-455'}`}>—</span>;
    }
    const isLoss = gain < 0;
    const colorClass = isLoss ? 'text-rose-500' : 'text-emerald-500';
    return (
      <div className="text-left select-none">
        <div className={`text-xs font-bold ${colorClass}`}>
          {formatCurrency(gain, currency)}
        </div>
        {qtyText && (
          <div className={`text-[9px] font-semibold mt-0.5 tracking-wide ${isDark ? 'text-[#8E9CAE]' : 'text-slate-400'}`}>
            {qtyText}
          </div>
        )}
      </div>
    );
  };

  // Calculate dynamic current total value
  const totalCurrentValue = totalHolding * currentPrice;

  // Dynamic short/long-term allocation strings based on USD/INR toggles
  const visualStcgQty = currency === 'USD' 
    ? shortTermQtyText 
    : stcg.balance > 0 ? `${stcg.balance} ${coin}` : undefined;

  const visualLtcgQty = currency === 'USD' 
    ? longTermQtyText 
    : ltcg.balance > 0 ? `${ltcg.balance} ${coin}` : undefined;

  // Theme-aware styles
  const rowBorderClass = isDark ? 'border-[#1F293D]' : 'border-slate-100';
  const rowBgClass = isSelected 
    ? (isDark ? 'bg-blue-500/5' : 'bg-blue-50/10') 
    : '';
  
  const hoverClass = isDark ? 'hover:bg-[#1E2533]/80' : 'hover:bg-slate-50/50';
  const textPrimaryClass = isDark ? 'text-white' : 'text-[#0F294A]';
  const textSecondaryClass = isDark ? 'text-[#8E9CAE]' : 'text-slate-400';

  // Input styles
  const inputClass = isSelected
    ? (isDark 
        ? 'bg-[#10141F] border-[#2E3A4E] text-white focus:ring-blue-500/30 focus:border-blue-500 font-bold' 
        : 'bg-white border-slate-300 text-slate-800 focus:ring-blue-500/20 focus:border-blue-500 font-bold')
    : (isDark
        ? 'bg-[#0D1018] border-[#1F293D] text-[#3E4C5E] cursor-not-allowed text-center'
        : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed text-center');

  // Visual helper to render logo dynamically
  const renderLogo = () => {
    if (logo && logo.startsWith('http')) {
      return (
        <img 
          src={logo} 
          alt={coin} 
          className="w-7 h-7 rounded-full shrink-0 select-none bg-slate-50 object-contain p-0.5 border border-slate-100"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      );
    }
    
    // Default color-based badges
    const fallbackColor = id.startsWith('inr') ? (isDark ? 'bg-[#1E2533] text-indigo-400' : 'bg-indigo-100 text-indigo-700') : logo;
    return (
      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-[9px] uppercase shadow-xs shrink-0 select-none ${fallbackColor}`}>
        {coin.substring(0, 3)}
      </div>
    );
  };

  return (
    <tr className={`border-b last:border-0 transition-colors duration-150 ${rowBorderClass} ${rowBgClass} ${hoverClass}`}>
      {/* Checkbox */}
      <td className="px-6 py-4.5 whitespace-nowrap align-middle">
        <div className="flex items-center h-5">
          <input
            id={`checkbox-${id}`}
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelectToggle(id)}
            className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer transition"
          />
        </div>
      </td>

      {/* Asset: Circular logo and description */}
      <td className="px-6 py-4.5 whitespace-nowrap">
        <div className="flex items-center gap-3">
          {renderLogo()}
          <div>
            <div className={`text-xs font-bold leading-normal ${textPrimaryClass}`}>{coinName}</div>
            <div className={`text-[9px] font-bold mt-0.5 tracking-wide ${textSecondaryClass}`}>{coin}</div>
          </div>
        </div>
      </td>

      {/* Holdings & Average Buy Rate */}
      <td className="px-6 py-4.5 whitespace-nowrap text-left align-middle">
        <div className={`text-xs font-bold leading-normal ${textPrimaryClass}`}>
          {totalHolding.toLocaleString('en-US', { maximumFractionDigits: 6 })} {coin}
        </div>
        <div className={`text-[9px] font-semibold tracking-wide mt-0.5 ${textSecondaryClass}`}>
          {formatCurrency(averageBuyPrice, currency)}/{coin}
        </div>
      </td>

      {/* Total Current Value */}
      <td className="px-6 py-4.5 whitespace-nowrap text-left align-middle">
        <div className={`text-xs font-bold ${textPrimaryClass}`}>
          {formatCurrency(totalCurrentValue, currency)}
        </div>
      </td>

      {/* Short Term Gain Column */}
      <td className="px-6 py-4.5 whitespace-nowrap text-left align-middle">
        {renderGainField(stcg.gain, visualStcgQty)}
      </td>

      {/* Long Term Gain Column */}
      <td className="px-6 py-4.5 whitespace-nowrap text-left align-middle">
        {renderGainField(ltcg.gain, visualLtcgQty)}
      </td>

      {/* Amount to Sell Controlled input override */}
      <td className="px-6 py-4.5 whitespace-nowrap align-middle">
        <div className="flex items-center gap-2 max-w-[125px]">
          <div className="relative rounded-lg shadow-xs w-full">
            <input
              type="number"
              value={isSelected ? (sellAmount === 0 ? '' : sellAmount) : ''}
              onChange={handleInputChange}
              disabled={!isSelected}
              min="0"
              max={totalHolding}
              step="any"
              placeholder="-"
              className={`block w-full text-right pr-9 pl-3 py-1.5 text-xs rounded-lg border focus:ring-2 focus:outline-none transition-all ${inputClass}`}
            />
            {isSelected && (
              <span className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[9px] font-bold select-none ${textSecondaryClass}`}>
                {coin}
              </span>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};
