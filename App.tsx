
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MarketTrend, ArbitrageOpportunity, Flashcard, MarketState, Message, TradeRecord, SimulationMode } from './types';
import { INITIAL_MARKET_STATE, EXCHANGES, PAIRS, INITIAL_CAPITAL } from './constants';
import ArbitrageDashboard from './components/ArbitrageDashboard';
import FlashcardSystem from './components/FlashcardSystem';
import AgentChat from './components/AgentChat';
import TradeHistory from './components/TradeHistory';
import PerformanceChart from './components/PerformanceChart';
import { generateAgentAnalysis, generateFlashcard, getStructuredMirrorAnalysis } from './services/geminiService';

const App: React.FC = () => {
  const [marketState, setMarketState] = useState<MarketState>(INITIAL_MARKET_STATE);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Quantum HFT Core initialized. Mirror Synthesis layers online.', timestamp: Date.now() }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Performance States
  const [equity, setEquity] = useState(INITIAL_CAPITAL);
  const [tradeHistory, setTradeHistory] = useState<TradeRecord[]>([]);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);

  // Refs for state inside rapid intervals
  const equityRef = useRef(equity);
  const opportunitiesRef = useRef(opportunities);
  const marketStateRef = useRef(marketState);

  useEffect(() => {
    equityRef.current = equity;
    opportunitiesRef.current = opportunities;
    marketStateRef.current = marketState;
  }, [equity, opportunities, marketState]);

  // High-Precision Scanner Core
  const scanTick = (currentPrices: Record<string, Record<string, number>>, volatility: number): ArbitrageOpportunity[] => {
    const newOpps: ArbitrageOpportunity[] = [];
    PAIRS.forEach(pair => {
      const allExchangePrices = EXCHANGES.map(ex => currentPrices[ex][pair]);
      const sortedPrices = [...allExchangePrices].sort((a, b) => a - b);
      const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)];

      let minPrice = Infinity;
      let maxPrice = -Infinity;
      let buyEx = '';
      let sellEx = '';

      EXCHANGES.forEach(exchange => {
        const price = currentPrices[exchange][pair];
        if (price < minPrice) { minPrice = price; buyEx = exchange; }
        if (price > maxPrice) { maxPrice = price; sellEx = exchange; }
      });

      const spread = maxPrice - minPrice;
      const spreadPct = (spread / minPrice) * 100;

      const buyDivergence = Math.abs((minPrice - medianPrice) / medianPrice);
      const sellDivergence = Math.abs((maxPrice - medianPrice) / medianPrice);
      const signalStrength = Math.min((buyDivergence + sellDivergence) * 100, 1.0);
      const compositeScore = (spreadPct * 40) + (signalStrength * 60);

      if (spreadPct > 0.04) {
        newOpps.push({
          id: Math.random().toString(36).substr(2, 9),
          pair,
          buyExchange: buyEx,
          sellExchange: sellEx,
          buyPrice: minPrice,
          sellPrice: maxPrice,
          spread,
          spreadPercentage: spreadPct,
          timestamp: Date.now(),
          riskScore: Math.floor(Math.random() * 8) + 1,
          signalStrength,
          compositeScore
        });
      }
    });
    return newOpps.sort((a, b) => b.compositeScore - a.compositeScore);
  };

  // Live Market Engine (Replaced with feed simulation logic)
  useEffect(() => {
    if (isSimulating) return;

    const interval = setInterval(() => {
      setMarketState(prev => {
        const nextPrices = { ...prev.prices };
        const drift = (Math.random() - 0.5) * 0.0002;
        
        EXCHANGES.forEach(exchange => {
          PAIRS.forEach(pair => {
            const vol = prev.volatility / 100; 
            const change = 1 + (Math.random() * vol * 2.5 - vol * 1.25) + drift;
            nextPrices[exchange][pair] *= change;
          });
        });

        const newOpps = scanTick(nextPrices, prev.volatility);
        setOpportunities(newOpps);
        return { ...prev, prices: nextPrices };
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Autonomous Trading Agent (HFT Loop)
  useEffect(() => {
    if (!isBacktesting || isSimulating) return;

    const scanner = setInterval(() => {
      const best = opportunitiesRef.current[0];
      if (best && best.compositeScore > 20) { 
        executeTrade(best);
      }
    }, 250);

    return () => clearInterval(scanner);
  }, [isBacktesting, isSimulating]);

  const executeTrade = async (opp: ArbitrageOpportunity, silent: boolean = false, currentEquityOverride?: number, isBacktest: boolean = false) => {
    const activeEquity = currentEquityOverride !== undefined ? currentEquityOverride : equityRef.current;
    if (activeEquity <= 0) return 0;

    const feeRate = 0.0006;
    const allocation = Math.min(activeEquity * 0.2, 5000); 

    const takeProfitLevel = opp.sellPrice * (1 - (Math.random() * 0.00005));
    const stopLossLevel = opp.buyPrice * (1 - (marketStateRef.current.volatility * 0.003));

    const marketNoise = (Math.random() - 0.5) * marketStateRef.current.volatility * 0.03;
    const finalRealizedPrice = takeProfitLevel * (1 + marketNoise);

    let status: TradeRecord['status'] = 'COMPLETED';
    let realizedPrice = finalRealizedPrice;

    if (finalRealizedPrice >= takeProfitLevel) {
      status = 'TAKE_PROFIT';
      realizedPrice = takeProfitLevel;
    } else if (finalRealizedPrice <= stopLossLevel) {
      status = 'STOP_LOSS';
      realizedPrice = stopLossLevel;
    }

    const tokensBought = allocation / opp.buyPrice;
    const grossReturn = tokensBought * realizedPrice;
    const fees = (allocation * feeRate) + (grossReturn * feeRate);
    const netProfit = (grossReturn - allocation) - fees;

    const newTrade: TradeRecord = {
      id: Math.random().toString(36).substr(2, 9),
      pair: opp.pair,
      type: 'ARBITRAGE',
      entryExchange: opp.buyExchange,
      exitExchange: opp.sellExchange,
      entryPrice: opp.buyPrice,
      exitPrice: realizedPrice,
      takeProfit: takeProfitLevel,
      stopLoss: stopLossLevel,
      amount: tokensBought,
      profit: netProfit,
      status: status,
      timestamp: Date.now(),
      isBacktest
    };

    setEquity(prev => prev + netProfit);
    setTradeHistory(prev => [...prev, newTrade]);

    if (!silent) {
      getStructuredMirrorAnalysis(newTrade).then(analysis => {
        if (analysis) {
          setTradeHistory(prev => prev.map(t => t.id === newTrade.id ? { 
            ...t, 
            reasoning: analysis.summary,
            mirrorLayers: analysis.layers 
          } : t));
        }
      });

      if (Math.abs(netProfit) > 25) {
        generateFlashcard(
          `Trade Outcome Analysis: Execution ${newTrade.id}. Net Yield: ${netProfit.toFixed(2)} USDT. Status: ${status}.`
        ).then(cardData => {
          if (cardData) {
            setFlashcards(prev => [{ id: Math.random().toString(36).substr(2, 9), ...cardData, timestamp: Date.now() }, ...prev].slice(0, 15));
          }
        });
      }
    }
    
    return netProfit;
  };

  const runScenarioBacktest = async (mode: SimulationMode) => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimProgress(0);
    
    const scenarioName = mode.split('_').slice(1).join(' ') || 'Standard';
    setMessages(prev => [...prev, { role: 'assistant', text: `Initializing Live Feed Backtest: ${scenarioName} Scenario. Synthesizing 100 high-fidelity ticks...`, timestamp: Date.now() }]);

    const totalTicks = 100;
    let localEquity = equityRef.current;
    let localPrices = JSON.parse(JSON.stringify(marketStateRef.current.prices));
    
    let scenarioDrift = 0;
    let scenarioVol = marketStateRef.current.volatility;
    
    if (mode === 'BACKTEST_BULL') scenarioDrift = 0.0006;
    if (mode === 'BACKTEST_BEAR') scenarioDrift = -0.0006;
    if (mode === 'BACKTEST_VOLATILE') scenarioVol *= 2.5;

    for (let i = 0; i < totalTicks; i++) {
      // 1. Evolve the Feed
      EXCHANGES.forEach(ex => {
        PAIRS.forEach(pair => {
          const change = 1 + (Math.random() * scenarioVol * 2.5 - scenarioVol * 1.25) + scenarioDrift;
          localPrices[ex][pair] *= change;
        });
      });

      // 2. Scan & Decide
      const tickOpps = scanTick(localPrices, scenarioVol);
      if (tickOpps.length > 0 && tickOpps[0].compositeScore > 20) {
        const profit = await executeTrade(tickOpps[0], true, localEquity, true);
        localEquity += profit;
      }

      // 3. Update Visuals
      setMarketState(prev => ({ ...prev, prices: { ...localPrices }, volatility: scenarioVol }));
      setOpportunities(tickOpps);
      setSimProgress(((i + 1) / totalTicks) * 100);
      
      // Speed optimized replay
      await new Promise(r => setTimeout(r, 45)); 
    }

    setIsSimulating(false);
    setSimProgress(0);
    setMessages(prev => [...prev, { role: 'assistant', text: `Quantum Feed simulation concluded. Net Yield: ${(localEquity - equityRef.current).toFixed(2)} USDT. Audit logs initialized.`, timestamp: Date.now() }]);
  };

  const handleDownloadHistory = () => {
    if (tradeHistory.length === 0) return;
    
    const headers = ['ID', 'Scope', 'Timestamp', 'Pair', 'Status', 'Profit (USDT)', 'Entry Exchange', 'Exit Exchange', 'Entry Price', 'Exit Price', 'Analysis Summary'];
    const csvContent = [
      headers.join(','),
      ...tradeHistory.map(t => [
        t.id,
        t.isBacktest ? 'SIM' : 'LIVE',
        new Date(t.timestamp).toISOString(),
        t.pair,
        t.status,
        t.profit.toFixed(4),
        t.entryExchange,
        t.exitExchange,
        t.entryPrice.toFixed(4),
        t.exitPrice.toFixed(4),
        `"${(t.reasoning || 'Awaiting L5 Crystallization').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mirror_synthesis_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto relative overflow-x-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white flex items-center gap-2">
            <span className="text-cyan-500">MIRROR</span> SYNTHESIS
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Quantum Autonomous HFT Protocol</p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Latency</span>
            <span className="text-emerald-400 font-bold mono text-sm">&lt;1ms</span>
          </div>
          <div className="h-10 w-px bg-slate-800 hidden md:block"></div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Protocol State</span>
            <span className="text-cyan-400 font-bold mono text-sm uppercase">{isSimulating ? 'INJECTING FEED' : 'ACTIVE MONITOR'}</span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 h-full min-h-0">
        <div className="lg:col-span-8 flex flex-col gap-6 min-h-0 overflow-y-auto custom-scrollbar">
          <ArbitrageDashboard 
            opportunities={opportunities} 
            marketState={marketState} 
            onExecute={(opp) => executeTrade(opp, false)}
            onBacktest={runScenarioBacktest}
            onReset={() => { setEquity(INITIAL_CAPITAL); setTradeHistory([]); }}
            history={tradeHistory}
            isBacktesting={isBacktesting}
            toggleBacktest={() => setIsBacktesting(!isBacktesting)}
            equity={equity}
            isSimulating={isSimulating}
            onDownload={handleDownloadHistory}
            simProgress={simProgress}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
             <div className="glass rounded-xl border border-slate-800 p-6 relative overflow-hidden flex flex-col min-h-[400px]">
                <div className="scanline"></div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest text-shadow-glow">Equity Evolution</h2>
                  <div className="flex gap-2 text-[10px] mono text-slate-400 font-bold">
                    <span>Balance: ${equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="flex-1 bg-slate-900/30 rounded border border-slate-800/50 p-4">
                   <PerformanceChart history={tradeHistory} initialEquity={INITIAL_CAPITAL} />
                </div>
             </div>

             <TradeHistory history={tradeHistory} />
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          <div className="h-[350px]">
            <AgentChat messages={messages} onSendMessage={(txt) => {
              setIsAiLoading(true);
              const userMsg: Message = { role: 'user', text: txt, timestamp: Date.now() };
              setMessages(m => [...m, userMsg]);
              generateAgentAnalysis(txt, { marketState, equity, opportunities: opportunities.slice(0,3) })
                .then(res => {
                  setMessages(m => [...m, { role: 'assistant', text: res || '', timestamp: Date.now() }]);
                  setIsAiLoading(false);
                });
            }} isLoading={isAiLoading} />
          </div>
          <div className="flex-1 overflow-hidden">
            <FlashcardSystem cards={flashcards} onRemove={(id) => setFlashcards(prev => prev.filter(c => c.id !== id))} />
          </div>
        </div>
      </main>

      <footer className="mt-auto pt-4 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
        <div className="flex gap-6">
          <span className="flex items-center gap-2">
            <i className={`fa-solid fa-circle text-[6px] ${isBacktesting ? 'text-cyan-500 animate-pulse' : 'text-emerald-500'}`}></i>
            Core Node Status: {isSimulating ? 'Injecting Feed' : isBacktesting ? 'Autonomous HFT' : 'Passive Scan'}
          </span>
          <span className="flex items-center gap-2">
            <i className="fa-solid fa-microchip text-[6px] text-cyan-500"></i>
            Active Signals: {opportunities.length}
          </span>
        </div>
        <div className="mono text-slate-500 flex gap-4">
          <span>{marketState.trend} Trend</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
