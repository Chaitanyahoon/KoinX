export interface CapitalGains {
  profits: number;
  losses: number;
  netGains: number;
}

export interface SummaryGains {
  stcg: CapitalGains;
  ltcg: CapitalGains;
  realised: number;
}

export interface GainDetails {
  balance: number;
  gain: number;
}

export interface Holding {
  id: string;
  coin: string; // e.g. "BTC" or "WETH"
  coinName: string; // e.g. "Bitcoin" or "Wrapped POL"
  logo: string; // image URL or color badge
  currentPrice: number; // e.g. 211756 (INR) or 1620.15 (USD)
  totalHolding: number; // e.g. 0.63778
  averageBuyPrice: number; // e.g. 86738.90
  stcg: GainDetails;
  ltcg: GainDetails;
  shortTermQtyText?: string; // e.g. "0.338 BTC" (for USD visual match)
  longTermQtyText?: string; // e.g. "0.300 BTC" (for USD visual match)
}
