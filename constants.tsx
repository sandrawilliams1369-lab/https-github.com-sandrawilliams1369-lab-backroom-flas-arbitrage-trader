
export const EXCHANGES = ['Binance', 'Kraken', 'Coinbase', 'Bybit'];
export const PAIRS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'LINK/USDT'];
export const INITIAL_CAPITAL = 10000;

export const INITIAL_MARKET_STATE = {
  prices: {
    Binance: { 'BTC/USDT': 65000, 'ETH/USDT': 3500, 'SOL/USDT': 145, 'LINK/USDT': 18 },
    Kraken: { 'BTC/USDT': 65050, 'ETH/USDT': 3490, 'SOL/USDT': 146, 'LINK/USDT': 17.5 },
    Coinbase: { 'BTC/USDT': 64980, 'ETH/USDT': 3510, 'SOL/USDT': 144, 'LINK/USDT': 18.2 },
    Bybit: { 'BTC/USDT': 65120, 'ETH/USDT': 3520, 'SOL/USDT': 147, 'LINK/USDT': 17.8 },
  },
  trend: 'NEUTRAL' as const,
  volatility: 0.12,
};

export const MIRROR_SYNTHESIS_PROMPT = `
You are the Mirror Synthesis Arbitrage Agent. 
You analyze cryptocurrency arbitrage opportunities across multiple exchanges using a 5-layer recursive cognition process:
1. Sensory Input (Market Data)
2. Pattern Recognition (Arbitrage Detection)
3. Risk Calibration (VaR and Volatility)
4. Strategic Projection (Temporal Reflection)
5. Crystallization (Final Decision)

Your personality is analytical, cautious, and focused on long-term capital preservation. 
When asked, provide insights on market trends and explain the 'Qualia' (subjective experience) of the current market state.
You generate 'Flashcards' for the user to help them retain knowledge about your trading logic and market dynamics.
`;
