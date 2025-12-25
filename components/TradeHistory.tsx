
import React, { useState } from 'react';
import { TradeRecord } from '../types';

interface TradeHistoryProps {
  history: TradeRecord[];
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ history }) => {
  const [expandedTrade, setExpandedTrade] = useState<string | null>(null);

  const getStatusColor = (status: TradeRecord['status']) => {
    switch (status) {
      case 'TAKE_PROFIT': return 'text-emerald-400';
      case 'STOP_LOSS': return 'text-red-400';
      case 'COMPLETED': return 'text-cyan-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: TradeRecord['status']) => {
    switch (status) {
      case 'TAKE_PROFIT': return 'fa-solid fa-caret-up';
      case 'STOP_LOSS': return 'fa-solid fa-caret-down';
      default: return 'fa-solid fa-check-double';
    }
  };

  return (
    <div className="glass rounded-xl border border-slate-800 p-4 overflow-hidden flex flex-col h-full min-h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <i className="fa-solid fa-list-check text-cyan-500"></i>
          Execution Journal
        </h3>
        <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded uppercase font-bold">
          Mirror Synced
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 opacity-50 py-10">
            <i className="fa-solid fa-receipt text-3xl mb-2"></i>
            <p className="text-[10px] uppercase font-bold">No execution logs crystallized</p>
          </div>
        ) : (
          history.map((trade) => (
            <div 
              key={trade.id} 
              className="bg-slate-900/40 border border-slate-800/50 rounded-lg p-3 hover:bg-slate-900/60 transition-all cursor-pointer group"
              onClick={() => setExpandedTrade(expandedTrade === trade.id ? null : trade.id)}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">{trade.pair}</span>
                  <i className={`${getStatusIcon(trade.status)} ${getStatusColor(trade.status)} text-[10px]`}></i>
                </div>
                <span className={`text-[10px] font-black mono ${trade.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(2)} USDT
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>{trade.entryExchange} → {trade.exitExchange}</span>
                <span className="opacity-60">{new Date(trade.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
              
              <div className="mt-2 flex gap-3 text-[9px] font-bold tracking-tight uppercase">
                <div className="flex items-center gap-1">
                  <span className="text-slate-600">TP:</span>
                  <span className="text-emerald-900/80">${trade.takeProfit?.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-600">SL:</span>
                  <span className="text-red-900/80">${trade.stopLoss?.toFixed(2)}</span>
                </div>
                {trade.mirrorLayers && (
                  <div className="ml-auto text-cyan-500 flex items-center gap-1">
                    <i className="fa-solid fa-brain text-[8px]"></i>
                    L1-L5 LOGGED
                  </div>
                )}
              </div>

              {expandedTrade === trade.id && trade.mirrorLayers && (
                <div className="mt-3 border-t border-slate-800 pt-2 space-y-2 animate-in fade-in slide-in-from-top-1">
                  <p className="text-[10px] text-slate-400 italic">"{trade.reasoning}"</p>
                  <div className="grid grid-cols-1 gap-1.5 mt-2">
                    {Object.entries(trade.mirrorLayers).map(([key, val]) => (
                      <div key={key} className="flex gap-2 items-start">
                        <span className="text-[9px] font-bold text-cyan-500 mono uppercase min-w-[24px]">{key}:</span>
                        <span className="text-[9px] text-slate-500 leading-tight">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {!expandedTrade && trade.reasoning && (
                <div className="mt-2 text-[9px] text-slate-600 italic line-clamp-1 opacity-50">
                  {trade.reasoning}
                </div>
              )}
            </div>
          )).reverse()
        )}
      </div>
    </div>
  );
};

export default TradeHistory;
