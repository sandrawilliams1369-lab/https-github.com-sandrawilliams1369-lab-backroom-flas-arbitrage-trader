
import React from 'react';
import { TradeRecord } from '../types';

interface PerformanceChartProps {
  history: TradeRecord[];
  initialEquity: number;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ history, initialEquity }) => {
  const equityPoints = history.reduce((acc, trade) => {
    const lastPoint = acc[acc.length - 1] || initialEquity;
    acc.push(lastPoint + trade.profit);
    return acc;
  }, [initialEquity]);

  const maxEquity = Math.max(...equityPoints, initialEquity + 100);
  const minEquity = Math.min(...equityPoints, initialEquity - 100);
  const range = maxEquity - minEquity;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex items-end justify-between gap-0.5 relative">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
          <div className="border-t border-slate-500 w-full"></div>
          <div className="border-t border-slate-500 w-full"></div>
          <div className="border-t border-slate-500 w-full"></div>
        </div>

        {equityPoints.slice(-40).map((point, i) => {
          const height = ((point - minEquity) / range) * 100;
          const prevPoint = i > 0 ? equityPoints.slice(-40)[i - 1] : point;
          const isUp = point >= prevPoint;

          return (
            <div 
              key={i} 
              className={`flex-1 min-w-[4px] rounded-t-sm transition-all duration-700 ${
                isUp ? 'bg-emerald-500/40 border-t border-emerald-400' : 'bg-red-500/40 border-t border-red-400'
              }`}
              style={{ height: `${Math.max(height, 5)}%` }}
            >
              <div className="w-full h-full hover:bg-white/10 cursor-crosshair group relative">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                  <div className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[10px] mono whitespace-nowrap">
                    ${point.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
        <span>T-{Math.min(history.length, 40)}</span>
        <span>Relative Equity Growth (Live)</span>
        <span>NOW</span>
      </div>
    </div>
  );
};

export default PerformanceChart;
