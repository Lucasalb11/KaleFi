import axios from 'axios';

export interface PriceData {
  kale: number;
  usdc: number;
  timestamp: number;
}

export class ReflectorService {
  private baseUrl: string;
  private mockMode: boolean;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || 'https://api.reflector.network'; // Replace with actual Reflector API
    this.mockMode = !baseUrl; // Use mock data if no URL provided
  }

  async getPrices(): Promise<PriceData> {
    if (this.mockMode) {
      // Mock data for development/demo
      return this.getMockPrices();
    }

    try {
      // Replace with actual Reflector API endpoints
      const [kaleResponse, usdcResponse] = await Promise.all([
        axios.get(`${this.baseUrl}/prices/KALE`),
        axios.get(`${this.baseUrl}/prices/USDC`)
      ]);

      return {
        kale: kaleResponse.data.price || 0.25,
        usdc: usdcResponse.data.price || 1.00,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.warn('Failed to fetch real prices, using mock data:', error);
      return this.getMockPrices();
    }
  }

  private getMockPrices(): PriceData {
    // Simulate price fluctuations for demo
    const baseKalePrice = 0.25;
    const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% fluctuation
    
    return {
      kale: Math.max(0.01, baseKalePrice + fluctuation),
      usdc: 1.00, // USDC is stable
      timestamp: Date.now(),
    };
  }

  async getHistoricalPrices(symbol: string, period: string = '24h'): Promise<any[]> {
    if (this.mockMode) {
      return this.getMockHistoricalData(symbol);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/prices/${symbol}/history?period=${period}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch historical data:', error);
      return this.getMockHistoricalData(symbol);
    }
  }

  private getMockHistoricalData(symbol: string): any[] {
    // Generate mock historical data for charts
    const data = [];
    const now = Date.now();
    const basePrice = symbol === 'KALE' ? 0.25 : 1.00;
    
    for (let i = 24; i >= 0; i--) {
      const timestamp = now - (i * 60 * 60 * 1000); // Hours ago
      const fluctuation = (Math.random() - 0.5) * 0.05;
      data.push({
        timestamp,
        price: Math.max(0.01, basePrice + fluctuation),
      });
    }
    
    return data;
  }

  // Health factor calculations based on LTV
  calculateHealthFactor(collateralValue: number, debtValue: number, maxLtv: number = 0.75): number {
    if (collateralValue === 0) return 0;
    
    const currentLtv = debtValue / collateralValue;
    if (currentLtv === 0) return 100;
    
    return Math.min((maxLtv / currentLtv) * 100, 100);
  }

  // Calculate maximum borrowable amount
  calculateMaxBorrowable(collateralValue: number, maxLtv: number = 0.75): number {
    return collateralValue * maxLtv;
  }

  // Risk assessment based on health factor
  getRiskLevel(healthFactor: number): 'safe' | 'moderate' | 'high' | 'critical' {
    if (healthFactor >= 150) return 'safe';
    if (healthFactor >= 125) return 'moderate';
    if (healthFactor >= 110) return 'high';
    return 'critical';
  }

  // Get color for risk level
  getRiskColor(healthFactor: number): string {
    const risk = this.getRiskLevel(healthFactor);
    switch (risk) {
      case 'safe': return '#4ade80'; // Green
      case 'moderate': return '#f59e0b'; // Yellow
      case 'high': return '#f97316'; // Orange
      case 'critical': return '#ef4444'; // Red
      default: return '#6b7280'; // Gray
    }
  }
}