import axios from 'axios';

// Reflector Oracle API endpoint (replace with actual endpoint)
const REFLECTOR_API_ENDPOINT = 'https://api.reflector.finance/v1/price';

export class ReflectorService {
  private cache: { price: number; timestamp: number } | null = null;
  private cacheTimeout = 5000; // 5 seconds cache

  async getKALEPrice(): Promise<number> {
    // Check cache first
    if (this.cache && Date.now() - this.cache.timestamp < this.cacheTimeout) {
      return this.cache.price;
    }

    try {
      // In a real implementation, this would call the actual Reflector API
      // For demo purposes, we'll simulate price fluctuations
      const response = await this.simulateReflectorAPI();
      
      const price = response.price;
      
      // Update cache
      this.cache = {
        price,
        timestamp: Date.now()
      };

      return price;
    } catch (error) {
      console.error('Error fetching price from Reflector:', error);
      
      // Return last cached price if available, otherwise default
      if (this.cache) {
        return this.cache.price;
      }
      
      // Default fallback price
      return 0.5;
    }
  }

  // Simulated API call for demo purposes
  private async simulateReflectorAPI(): Promise<{ price: number }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate realistic price fluctuations
    const basePrice = 0.5;
    const volatility = 0.05;
    const randomFactor = (Math.random() - 0.5) * 2 * volatility;
    const price = basePrice * (1 + randomFactor);
    
    return { price: Number(price.toFixed(4)) };
  }

  // In a real implementation, this would connect to Reflector WebSocket for real-time updates
  subscribeToPrice(callback: (price: number) => void): () => void {
    const interval = setInterval(async () => {
      const price = await this.getKALEPrice();
      callback(price);
    }, 5000); // Update every 5 seconds

    // Return unsubscribe function
    return () => clearInterval(interval);
  }
}

// Example of how to integrate with actual Reflector API:
/*
async getKALEPriceReal(): Promise<number> {
  const response = await axios.get(`${REFLECTOR_API_ENDPOINT}/KALE-USD`, {
    headers: {
      'API-Key': process.env.REFLECTOR_API_KEY
    }
  });
  
  return response.data.price;
}
*/