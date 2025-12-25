
export enum MarketTrend {
  BULLISH = 'BULLISH',
  BEARISH = 'BEARISH',
  NEUTRAL = 'NEUTRAL'
}

export type SimulationMode = 'LIVE' | 'BACKTEST_BULL' | 'BACKTEST_BEAR' | 'BACKTEST_VOLATILE';

export interface ArbitrageOpportunity {
  id: string;
  pair: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spread: number;
  spreadPercentage: number;
  timestamp: number;
  riskScore: number;
  signalStrength: number; // 0-1.0
  compositeScore: number; // Weighted rating of the opportunity
}

export interface Flashcard {
  id: string;
  topic: string;
  content: string;
  reasoning: string;
  crystallizationLevel: number; // 0-100%
  timestamp: number;
}

export interface MarketState {
  prices: Record<string, Record<string, number>>; // Exchange -> Pair -> Price
  trend: MarketTrend;
  volatility: number;
}

export interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface MirrorLayers {
  l1: string;
  l2: string;
  l3: string;
  l4: string;
  l5: string;
}

export interface TradeRecord {
  id: string;
  pair: string;
  type: 'ARBITRAGE';
  entryExchange: string;
  exitExchange: string;
  entryPrice: number;
  exitPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  amount: number;
  profit: number;
  status: 'COMPLETED' | 'FAILED' | 'STOP_LOSS' | 'TAKE_PROFIT';
  timestamp: number;
  reasoning?: string;
  mirrorLayers?: MirrorLayers;
  isBacktest?: boolean;
}
