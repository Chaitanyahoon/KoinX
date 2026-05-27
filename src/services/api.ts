import { 
  MOCK_CAPITAL_GAINS_USD, 
  MOCK_CAPITAL_GAINS_INR, 
  MOCK_HOLDINGS_USD, 
  MOCK_HOLDINGS_INR 
} from '../data/mockData';
import type { SummaryGains, Holding } from '../types';

// Artificial delay to simulate real network requests
const API_DELAY = 800;

/**
 * Simulates fetching current Capital Gains summary from API
 * @param currency - Current visual currency ('USD' | 'INR')
 * @param shouldFail - Optional flag to trigger error handling simulation
 */
export const fetchCapitalGains = (
  currency: 'USD' | 'INR' = 'USD',
  shouldFail = false
): Promise<SummaryGains> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Failed to retrieve capital gains data. Please check connection and try again.'));
      } else {
        const seedData = currency === 'USD' ? MOCK_CAPITAL_GAINS_USD : MOCK_CAPITAL_GAINS_INR;
        resolve({ ...seedData });
      }
    }, API_DELAY);
  });
};

/**
 * Simulates fetching user's current crypto holdings from API
 * @param currency - Current visual currency ('USD' | 'INR')
 * @param shouldFail - Optional flag to trigger error handling simulation
 * @param returnEmpty - Optional flag to return empty array to test empty fallback UI
 */
export const fetchHoldings = (
  currency: 'USD' | 'INR' = 'USD',
  shouldFail = false,
  returnEmpty = false
): Promise<Holding[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Internal server error while fetching holdings data.'));
      } else if (returnEmpty) {
        resolve([]);
      } else {
        const seedData = currency === 'USD' ? MOCK_HOLDINGS_USD : MOCK_HOLDINGS_INR;
        resolve([...seedData]);
      }
    }, API_DELAY + 100);
  });
};
