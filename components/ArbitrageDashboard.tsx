
import React, { useState } from 'react';
import { ArbitrageOpportunity, MarketState, TradeRecord, SimulationMode } from '../types';
import { INITIAL_CAPITAL } from '../constants';

interface ArbitrageDashboardProps {
  opportunities: ArbitrageOpportunity[];
  marketState: MarketState;
  onExecute: (opp: ArbitrageOpportunity) => void;
  onBacktest: (mode: SimulationMode) => void;
  onReset: () => void;
  history: TradeRecord[];
  isBacktesting: boolean;
  toggleBacktest: () => void;
  equity: number;
  isSimulating: boolean;
  onDownload: () => void;
  simProgress: number;
}

const ArbitrageDashboard: React.FC<ArbitrageDashboardProps> = ({ 
  opportunities, 
  onExecute, 
  onBacktest,
  onReset,
  history, 
  isBacktesting, 
  toggleBacktest,
  equity,
  isSimulating,
  onDownload,
  simProgress
}) => {
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  const winRate = history.length > 0 
    ? (history.filter(t => t.profit > 0).length / history.length) * 100 
    : 0;
  
  const totalProfit = history.reduce((acc, t) => acc + t.profit, 0);
  const roi = (totalProfit / INITIAL_CAPITAL) * 100;

  const scenarios: { label: string, mode: SimulationMode, icon: string }[] = [
    { label: 'Bull Rally', mode: 'BACKTEST_BULL', icon: 'fa-arrow-trend-up' },
    { label: 'Bear Crash', mode: 'BACKTEST_BEAR', icon: 'fa-arrow-trend-down' },
    { label: 'High Volatility', mode: 'BACKTEST_VOLATILE', icon: 'fa-bolt-lightning' }
  ];

  return (
    <div className="space-y-6">
      {/* Performance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-3 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Running Equity</div>
          <div className="text-lg font-bold mono text-cyan-400 tracking-tighter">${equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="glass p-3 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Session ROI</div>
          <div className={`text-lg font-bold mono ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'} tracking-tighter`}>
            {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
          </div>
        </div>
        <div className="glass p-3 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Total P/L</div>
          <div className={`text-lg font-bold mono ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'} tracking-tighter`}>
            {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)}
          </div>
        </div>
        <div className="glass p-3 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Efficiency</div>
          <div className="text-lg font-bold mono text-slate-200 tracking-tighter">{winRate.toFixed(1)}%</div>
        </div>
      </div>

      <div className="glass rounded-xl p-4 overflow-hidden relative">
        {isSimulating && (
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 z-50">
            <div 
              className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.7)] transition-all duration-300" 
              style={{ width: `${simProgress}%` }}
            ></div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBacktesting || isSimulating ? 'bg-cyan-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isBacktesting || isSimulating ? 'bg-cyan-500' : 'bg-emerald-500'}`}></span>
            </span>
            {isSimulating ? `Feeding Data Feed: ${simProgress.toFixed(0)}%` : isBacktesting ? 'Autonomous HFT Engine' : 'Market Signal Feed'}
          </h3>
          
          <div className="flex flex-wrap gap-2 items-center">
            <button 
              onClick={onDownload}
              disabled={history.length === 0}
              className="text-[10px] font-bold uppercase px-3 py-1 rounded border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-900/50 transition-all disabled:opacity-30"
            >
              <i className="fa-solid fa-file-export mr-1"></i> Audit
            </button>
            <button 
              onClick={onReset}
              className="text-[10px] font-bold uppercase px-3 py-1 rounded border border-slate-700 text-slate-500 hover:text-red-400 hover:border-red-900/50 transition-all"
            >
              Reset
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowScenarioMenu(!showScenarioMenu)}
                disabled={isSimulating}
                className="text-[10px] font-bold uppercase px-3 py-1 rounded border bg-amber-500/10 border-amber-500/50 text-amber-400 hover:bg-amber-500/20 transition-all disabled:opacity-30"
              >
                <i className="fa-solid fa-play-circle mr-1"></i> Backtest Feed
              </button>
              
              {showScenarioMenu && (
                <div className="absolute top-full mt-2 right-0 w-48 glass rounded-lg border border-slate-700 p-2 z-[100] animate-in fade-in slide-in-from-top-2">
                  <p className="text-[9px] text-slate-500 font-bold uppercase px-2 mb-2">Select Scenario</p>
                  {scenarios.map(s => (
                    <button
                      key={s.mode}
                      onClick={() => { onBacktest(s.mode); setShowScenarioMenu(false); }}
                      className="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 rounded transition-colors flex items-center gap-2"
                    >
                      <i className={`fa-solid ${s.icon} text-cyan-600`}></i>
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={toggleBacktest}
              disabled={isSimulating}
              className={`text-[10px] font-bold uppercase px-3 py-1 rounded border transition-all ${
                isBacktesting 
                ? 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20' 
                : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              {isBacktesting ? 'Stop HFT' : 'Start HFT'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[160px] custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800 uppercase font-black tracking-tighter">
                <th className="pb-2">PAIR / SIG</th>
                <th className="pb-2">SRC / PRICE</th>
                <th className="pb-2">DEST / PRICE</th>
                <th className="pb-2">SCORE</th>
                <th className="pb-2 text-right">EXEC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {opportunities.length > 0 ? (
                opportunities.map(opp => (
                  <tr key={opp.id} className="hover:bg-cyan-500/5 transition-colors group">
                    <td className="py-3">
                      <div className="font-bold text-slate-200">{opp.pair}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-1 w-10 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 shadow-[0_0_5px_rgba(34,211,238,0.5)]" style={{ width: `${opp.signalStrength * 100}%` }}></div>
                        </div>
                        <span className="text-[9px] text-slate-500 font-bold">{(opp.signalStrength * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="text-slate-300 font-medium">{opp.buyExchange}</div>
                      <div className="text-slate-500 mono">${opp.buyPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </td>
                    <td className="py-3">
                      <div className="text-slate-300 font-medium">{opp.sellExchange}</div>
                      <div className="text-slate-500 mono">${opp.sellPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </td>
                    <td className="py-3">
                      <div className="text-emerald-400 font-bold mono text-sm">+{opp.spreadPercentage.toFixed(3)}%</div>
                      <div className="text-cyan-400 text-[10px] font-bold">Score: {opp.compositeScore.toFixed(1)}</div>
                    </td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => onExecute(opp)}
                        disabled={isBacktesting || isSimulating}
                        className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 p-2 rounded transition-all border border-emerald-900/50 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <i className="fa-solid fa-bolt text-[8px]"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-500 italic">
                      <div className="w-4 h-4 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
                      Awaiting Quantum Divergence...
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ArbitrageDashboard;
