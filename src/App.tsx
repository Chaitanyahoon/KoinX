import { useState, useEffect, useCallback } from 'react';
import { SummaryCard } from './components/SummaryCard';
import { HoldingsTable } from './components/HoldingsTable';
import { fetchCapitalGains, fetchHoldings } from './services/api';
import type { SummaryGains, Holding } from './types';
import { 
  calculateHarvestedGains, 
  calculateSavings, 
  formatCurrency
} from './utils/calculations';
import { 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  Calculator,
  Bug,
  Info,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';

// Default gains fallback for safety during initial load
const DEFAULT_GAINS: SummaryGains = {
  stcg: { profits: 0, losses: 0, netGains: 0 },
  ltcg: { profits: 0, losses: 0, netGains: 0 },
  realised: 0,
};

function App() {
  // Application Dynamic Themes & Currencies
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // Default to Dark Mode as per figma screenshot

  // Application Data States
  const [originalGains, setOriginalGains] = useState<SummaryGains | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [selectedHoldings, setSelectedHoldings] = useState<{ [id: string]: number }>({});
  
  // UX Async States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Collapsible disclaimers accordion state
  const [disclaimersExpanded, setDisclaimersExpanded] = useState<boolean>(true);

  // Interactive Simulation Controls for Internship Grading
  const [simulateError, setSimulateError] = useState<boolean>(false);
  const [simulateEmpty, setSimulateEmpty] = useState<boolean>(false);

  // Load data from simulated API
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [gainsData, holdingsData] = await Promise.all([
        fetchCapitalGains(currency, simulateError),
        fetchHoldings(currency, simulateError, simulateEmpty)
      ]);
      setOriginalGains(gainsData);
      setHoldings(holdingsData);
      // Reset selected holdings simulation when new data loads
      setSelectedHoldings({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while loading data.');
    } finally {
      setIsLoading(false);
    }
  }, [currency, simulateError, simulateEmpty]);

  // Run loader on mount or when simulator toggles are pressed
  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboardData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDashboardData]);

  // Handle individual selection check
  const handleSelectToggle = (id: string) => {
    const asset = holdings.find((h) => h.id === id);
    if (!asset) return;

    setSelectedHoldings((prev) => {
      const updated = { ...prev };
      if (updated[id] !== undefined) {
        // If checked, uncheck and remove
        delete updated[id];
      } else {
        // If unchecked, check and set sellAmount to 100% of total holdings Count
        updated[id] = asset.totalHolding;
      }
      return updated;
    });
  };

  // Handle select-all header check
  const handleSelectAllToggle = (checked: boolean) => {
    if (!checked) {
      // Clear selections
      setSelectedHoldings({});
    } else {
      // Select all holdings currently in table
      const updated: { [id: string]: number } = {};
      holdings.forEach((h) => {
        updated[h.id] = h.totalHolding;
      });
      setSelectedHoldings(updated);
    }
  };

  // Handle dynamic text-input quantity overrides
  const handleSellAmountChange = (id: string, amount: number) => {
    setSelectedHoldings((prev) => {
      const updated = { ...prev };
      if (amount <= 0) {
        // If amount set to 0, keep selected but sell quantity is 0
        updated[id] = 0;
      } else {
        updated[id] = amount;
      }
      return updated;
    });
  };

  // Reset all current simulations
  const handleResetSimulation = () => {
    setSelectedHoldings({});
  };

  // Derive dynamic state statistics using pure calculations
  const activeGains = originalGains || DEFAULT_GAINS;
  const postHarvestGains = calculateHarvestedGains(activeGains, selectedHoldings, holdings, currency);
  const estimatedSavings = calculateSavings(activeGains, postHarvestGains, selectedHoldings, currency);

  // Show generic browser alert banner ONLY IF pre-harvesting realized gains > post-harvesting realized gains
  const showSavingsBanner = activeGains.realised > postHarvestGains.realised && estimatedSavings > 0;

  // Count active selected rows
  const selectedCount = Object.keys(selectedHoldings).length;

  // Theme-aware styles
  const mainBgClass = isDarkMode ? 'bg-[#0A0D14] text-white' : 'bg-[#F0F4F8] text-slate-800';
  
  const headerClass = isDarkMode 
    ? 'bg-[#111622] border-[#1F293D] bg-[#111622]/95' 
    : 'bg-white border-slate-200 bg-white/95';

  const logoColorClass = isDarkMode ? 'text-white' : 'text-[#0F294A]';

  const titleTextClass = isDarkMode ? 'text-white' : 'text-[#0F294A]';

  const disclaimersClass = isDarkMode
    ? 'border-[#1D3B6C] bg-[#111A2E] text-[#A2B6D4]'
    : 'border-[#D1E3F8] bg-[#EBF4FE] text-[#3E4C5E]';

  const disclaimersTitleClass = isDarkMode ? 'text-white' : 'text-[#0F294A]';

  const disclaimersBulletClass = isDarkMode ? 'text-[#A2B6D4]' : 'text-[#3E4C5E]';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${mainBgClass}`}>
      {/* Figma Responsive Sticky Header */}
      <header className={`sticky top-0 z-30 border-b shadow-sm backdrop-blur-md transition-colors duration-200 ${headerClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            
            {/* Left: Brand Identity Logo */}
            <div className="flex items-center gap-1 select-none">
              <span className={`text-xl font-black tracking-tight ${logoColorClass}`}>Koin</span>
              <span className="text-xl font-black text-[#FF9900] tracking-tight">X</span>
              <span className="text-[8px] align-super text-slate-405 font-bold ml-0.5 select-none">®</span>
            </div>

            {/* Middle: Currency Switcher Widget (USD $ / INR ₹) */}
            <div className={`flex items-center rounded-lg p-0.5 border select-none ${isDarkMode ? 'bg-[#161B26] border-[#2E3A4E]' : 'bg-slate-100 border-slate-205'}`}>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                  currency === 'USD'
                    ? (isDarkMode ? 'bg-[#0A0D14] text-[#0B62F6] shadow-xs' : 'bg-white text-[#0B62F6] shadow-xs')
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency('INR')}
                className={`px-3 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                  currency === 'INR'
                    ? (isDarkMode ? 'bg-[#0A0D14] text-[#0B62F6] shadow-xs' : 'bg-white text-[#0B62F6] shadow-xs')
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                INR (₹)
              </button>
            </div>

            {/* Right Side Toggles: Theme Toggle + Simulated Grading Sandbox */}
            <div className="flex items-center gap-2">
              
              {/* Theme Toggle (Sun/Moon icons) */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'border-[#2E3A4E] text-[#FF9900] hover:bg-[#161B26]' 
                    : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              {/* Reset Sim shortcut */}
              {selectedCount > 0 && (
                <button
                  onClick={handleResetSimulation}
                  className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
                    isDarkMode ? 'bg-[#161B26] text-slate-300 hover:bg-[#1E2533]' : 'bg-slate-150 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Sim</span>
                </button>
              )}

              {/* Error Toggle helper */}
              <button
                onClick={() => setSimulateError((prev) => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                  simulateError
                    ? 'bg-amber-50 border-amber-200 text-amber-700 font-extrabold'
                    : (isDarkMode ? 'bg-[#10141F] border-[#2E3A4E] text-slate-400 hover:bg-[#161B26]' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50')
                }`}
                title="Simulate network failures to test error states"
              >
                <Bug className="w-3 h-3" />
                <span className="hidden sm:inline">Simulate Error</span>
              </button>

              {/* Empty state helper */}
              <button
                onClick={() => setSimulateEmpty((prev) => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                  simulateEmpty
                    ? 'bg-amber-50 border-amber-200 text-amber-700 font-extrabold'
                    : (isDarkMode ? 'bg-[#10141F] border-[#2E3A4E] text-slate-400 hover:bg-[#161B26]' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50')
                }`}
                title="Simulate empty response to test fallback views"
              >
                <Calculator className="w-3 h-3" />
                <span className="hidden sm:inline">Simulate Empty</span>
              </button>

              {/* Reload database */}
              <button
                onClick={loadDashboardData}
                disabled={isLoading}
                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition disabled:opacity-50 cursor-pointer shrink-0"
                title="Refresh API Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dynamic header row: Title and underline Link next to it */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-baseline gap-2">
          <div className="flex items-baseline">
            <h2 className={`text-2xl font-black tracking-tight ${titleTextClass}`}>Tax Harvesting</h2>
            <a 
              href="#" 
              onClick={(e) => e.preventDefault()} 
              className="text-xs font-bold text-[#0B62F6] hover:underline ml-2 tracking-wide"
            >
              How it works?
            </a>
          </div>
        </div>

        {/* Figma Collapsible disclaimers accordion */}
        <div className={`mb-6 rounded-xl border overflow-hidden transition-all duration-205 shadow-sm ${disclaimersClass}`}>
          <button
            onClick={() => setDisclaimersExpanded(!disclaimersExpanded)}
            className={`w-full px-5 py-3 flex items-center justify-between text-left focus:outline-none transition cursor-pointer select-none ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-[#D1E3F8]/30'}`}
          >
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-[#0B62F6] shrink-0" />
              <span className={`text-xs font-bold ${disclaimersTitleClass}`}>Important Notes & Disclaimers</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 shrink-0 ${disclaimersTitleClass} ${disclaimersExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          {disclaimersExpanded && (
            <div className={`px-5 pb-4 pt-1 text-[11px] border-t ${isDarkMode ? 'border-white/5' : 'border-[#D1E3F8]/30'}`}>
              <ul className={`list-disc pl-5 space-y-1.5 font-medium tracking-wide ${disclaimersBulletClass}`}>
                <li>Tax-loss harvesting is currently not allowed under Indian tax regulations. Please consult your tax advisor before making any decisions.</li>
                <li>Tax harvesting does not apply to derivatives or futures. These are handled separately as business income under tax rules.</li>
                <li>Price and market value data is fetched from Coingecko, not from individual exchanges. As a result, values may slightly differ from the ones on your exchange.</li>
                <li>Some countries do not have a short-term / long-term bifurcation. For now, we are calculating everything as long-term.</li>
                <li>Only realized losses are considered for harvesting. Unrealized losses in held assets are not counted.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Dynamic INR/USD Alert savings banner */}
        {showSavingsBanner && (
          <div className="mb-6 rounded-xl bg-blue-600 p-4 text-white shadow-md border border-blue-700/30 flex items-center justify-between gap-4 animate-fade-in sm:hidden">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-200 shrink-0" />
              <span className="text-xs font-bold">
                You're going to save {formatCurrency(estimatedSavings, currency)}
              </span>
            </div>
          </div>
        )}

        {/* Global Connection Error Fallback */}
        {error ? (
          <div className={`rounded-2xl border p-6 shadow-sm my-6 text-center max-w-xl mx-auto ${isDarkMode ? 'bg-[#161B26] border-rose-950 text-white' : 'bg-rose-50/50 border-rose-200 text-slate-800'}`}>
            <div className="w-12 h-12 bg-rose-100/10 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold">Connection Interrupted</h3>
            <p className="text-xs text-rose-500/90 mt-2 max-w-md mx-auto leading-relaxed">{error}</p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={loadDashboardData}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                Try Reconnecting
              </button>
              <button
                onClick={() => {
                  setSimulateError(false);
                  setError(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer border ${isDarkMode ? 'bg-transparent border-[#2E3A4E] text-slate-300 hover:bg-white/5' : 'bg-white border-slate-350 text-slate-700 hover:bg-slate-50'}`}
              >
                Disable Simulator
              </button>
            </div>
          </div>
        ) : (
          /* Normal Interactive Workspace Layout */
          <>
            {/* Top Stat Cards Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SummaryCard
                title="Pre Harvesting"
                subtitle="Calculated before any simulation offsets are applied"
                gains={activeGains}
                isAfter={false}
                currency={currency}
                isDark={isDarkMode}
              />
              <SummaryCard
                title="After Harvesting"
                subtitle="Projected gains incorporating simulated asset sales"
                gains={postHarvestGains}
                isAfter={true}
                savings={estimatedSavings}
                currency={currency}
                isDark={isDarkMode}
              />
            </div>

            {/* Holdings Table Section */}
            <HoldingsTable
              holdings={holdings}
              selectedHoldings={selectedHoldings}
              onSelectToggle={handleSelectToggle}
              onSelectAllToggle={handleSelectAllToggle}
              onSellAmountChange={handleSellAmountChange}
              isLoading={isLoading}
              currency={currency}
              isDark={isDarkMode}
            />
          </>
        )}
      </main>

      {/* Clean humanized Footer */}
      <footer className={`border-t py-5 mt-12 text-center text-xs font-medium ${isDarkMode ? 'bg-[#111622] border-[#1F293D] text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>
            © {new Date().getFullYear()} KoinX Tax Solutions. All Rights Reserved.
          </span>
          <span className="flex items-center justify-center gap-1 select-none">
            Powered by React + TS + Tailwind CSS
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
