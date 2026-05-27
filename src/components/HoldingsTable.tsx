import React, { useState } from 'react';
import type { Holding } from '../types';
import { HoldingRow } from './HoldingRow';
import { Search, Info, AlertCircle } from 'lucide-react';

interface HoldingsTableProps {
  holdings: Holding[];
  selectedHoldings: { [id: string]: number };
  onSelectToggle: (id: string) => void;
  onSelectAllToggle: (checked: boolean) => void;
  onSellAmountChange: (id: string, amount: number) => void;
  isLoading: boolean;
  currency?: 'USD' | 'INR';
  isDark?: boolean;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({
  holdings,
  selectedHoldings,
  onSelectToggle,
  onSelectAllToggle,
  onSellAmountChange,
  isLoading,
  currency = 'USD',
  isDark = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLossesOnly, setShowLossesOnly] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if all items are selected
  const allSelected = holdings.length > 0 && holdings.every((h) => selectedHoldings[h.id] !== undefined);
  const someSelected = holdings.length > 0 && holdings.some((h) => selectedHoldings[h.id] !== undefined) && !allSelected;

  // Filter holdings by search query and losses filter
  const filteredHoldings = holdings.filter((holding) => {
    const matchesSearch = 
      holding.coin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      holding.coinName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const hasLoss = holding.stcg.gain < 0 || holding.ltcg.gain < 0;
    const matchesLosses = !showLossesOnly || hasLoss;

    return matchesSearch && matchesLosses;
  });

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAllToggle(e.target.checked);
  };

  // View All / Show Less bonus slice functionality
  const itemsLimit = 6;
  const hasMoreThanLimit = filteredHoldings.length > itemsLimit;
  const visibleHoldings = isExpanded ? filteredHoldings : filteredHoldings.slice(0, itemsLimit);

  // Theme-aware styles
  const cardBgClass = isDark ? 'bg-[#161B26] border-[#2E3A4E] text-white shadow-sm' : 'bg-white border-slate-200 shadow-sm';
  const headerBgClass = isDark ? 'bg-[#111622]/50 border-[#1F293D]' : 'bg-slate-50/50 border-slate-100';
  const tableHeaderBgClass = isDark ? 'bg-[#111622] text-[#8E9CAE] border-[#1F293D]' : 'bg-slate-50 text-slate-400 border-slate-100';
  const titleClass = isDark ? 'text-white font-extrabold' : 'text-[#0F294A] font-extrabold';
  
  // Search styles
  const searchClass = isDark 
    ? 'bg-[#10141F] border-[#2E3A4E] text-white focus:ring-blue-500/30 focus:border-blue-500 font-medium' 
    : 'bg-white border-slate-300 text-slate-800 focus:ring-blue-500/20 focus:border-blue-500 font-medium';

  // Filter Toggle styles
  const filterToggleClass = showLossesOnly
    ? 'bg-rose-50 border-rose-200 text-rose-700'
    : (isDark 
        ? 'bg-[#10141F] border-[#2E3A4E] text-slate-300 hover:bg-[#1E2533]' 
        : 'bg-white border-slate-350 text-slate-700 hover:bg-slate-50');

  const bottomBarClass = isDark ? 'bg-[#111622] border-[#1F293D]' : 'bg-slate-50 border-slate-100';

  return (
    <div className="flex flex-col mt-8">
      {/* Holdings Wrapper Card */}
      <div className={`rounded-2xl border overflow-hidden ${cardBgClass}`}>
        {/* Header Controls bar */}
        <div className={`px-6 py-5 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${headerBgClass}`}>
          <div>
            <h3 className={`text-base font-bold ${titleClass}`}>Holdings</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search input helper */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search coin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-8 pr-3 py-1.5 w-[160px] text-xs rounded-lg transition-all placeholder:text-slate-400 ${searchClass}`}
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowLossesOnly(!showLossesOnly)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${filterToggleClass}`}
            >
              <span>Losses Only</span>
              {showLossesOnly && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>}
            </button>
          </div>
        </div>

        {/* Responsive Table grid */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[10px] font-bold uppercase tracking-wider border-b select-none ${tableHeaderBgClass}`}>
                <th className="px-6 py-3.5 w-12 text-center align-middle">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onChange={handleSelectAllChange}
                      className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer transition"
                    />
                  </div>
                </th>
                <th className="px-6 py-3.5">Asset</th>
                <th className="px-6 py-3.5 text-left">
                  <div>Holdings</div>
                  <div className="text-[8px] font-bold text-slate-400/80 normal-case mt-0.5">Current Market Rate</div>
                </th>
                <th className="px-6 py-3.5">Total Current Value</th>
                <th className="px-6 py-3.5">Short-term</th>
                <th className="px-6 py-3.5">Long-term</th>
                <th className="px-6 py-3.5">Amount to Sell</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Loading Skeleton elements
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className={`border-b animate-pulse ${isDark ? 'border-[#1F293D]' : 'border-slate-100'}`}>
                    <td className="px-6 py-5.5"><div className="w-4 h-4 bg-slate-200 rounded mx-auto" /></td>
                    <td className="px-6 py-5.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200" />
                        <div className="space-y-1.5">
                          <div className="w-12 h-3.5 bg-slate-200 rounded" />
                          <div className="w-8 h-2.5 bg-slate-150 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5.5">
                      <div className="space-y-1.5">
                        <div className="w-16 h-3.5 bg-slate-200 rounded" />
                        <div className="w-20 h-2.5 bg-slate-150 rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-5.5"><div className="w-16 h-3.5 bg-slate-200 rounded" /></td>
                    <td className="px-6 py-5.5"><div className="w-16 h-4 bg-slate-200 rounded" /></td>
                    <td className="px-6 py-5.5"><div className="w-16 h-4 bg-slate-200 rounded" /></td>
                    <td className="px-6 py-5.5"><div className="w-24 h-8 bg-slate-200 rounded-lg" /></td>
                  </tr>
                ))
              ) : filteredHoldings.length === 0 ? (
                // Empty states
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <AlertCircle className="w-8 h-8 text-slate-350 mb-3" />
                      <p className="text-xs font-bold">No assets matching search filter</p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="mt-3.5 text-xs text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                        >
                          Clear Search Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                visibleHoldings.map((holding) => (
                  <HoldingRow
                    key={holding.id}
                    holding={holding}
                    isSelected={selectedHoldings[holding.id] !== undefined}
                    onSelectToggle={onSelectToggle}
                    sellAmount={selectedHoldings[holding.id] || 0}
                    onSellAmountChange={onSellAmountChange}
                    currency={currency}
                    isDark={isDark}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table note */}
        {!isLoading && filteredHoldings.length > 0 && (
          <div className={`px-6 py-3 border-t flex items-center gap-2 text-[10px] font-medium select-none ${bottomBarClass} ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>
              Checking a row activates harvesting. Use "Amount to Sell" to override full holding parameters.
            </span>
          </div>
        )}
      </div>

      {/* Visual bottom view-all anchor with dynamic "Show Less" toggle (Bonus Points) */}
      {!isLoading && hasMoreThanLimit && (
        <div className="mt-4 flex">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold text-[#0F62FE] hover:underline cursor-pointer select-none bg-transparent border-0 outline-none p-0"
          >
            {isExpanded ? 'Show less' : `View all (${filteredHoldings.length - itemsLimit} more)`}
          </button>
        </div>
      )}
    </div>
  );
};
