
import React, { useState } from 'react';
import { Flashcard } from '../types';

interface FlashcardSystemProps {
  cards: Flashcard[];
  onRemove: (id: string) => void;
}

const FlashcardSystem: React.FC<FlashcardSystemProps> = ({ cards, onRemove }) => {
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50 p-8 border-2 border-dashed border-slate-800 rounded-xl">
        <i className="fa-solid fa-brain text-4xl mb-4"></i>
        <p>No retentive cards generated yet.</p>
        <p className="text-sm">Scan market to trigger temporal learning.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-cyan-400 font-bold uppercase tracking-wider text-xs">Temporal Learning Cache</h3>
        <span className="bg-cyan-900/30 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full border border-cyan-800">
          {cards.length} CARDS
        </span>
      </div>
      
      {cards.map((card, idx) => (
        <div 
          key={card.id}
          className={`relative h-48 w-full transition-all duration-500 [transform-style:preserve-3d] cursor-pointer ${flippedIndex === idx ? '[transform:rotateY(180deg)]' : ''}`}
          onClick={() => setFlippedIndex(flippedIndex === idx ? null : idx)}
        >
          {/* Front Side */}
          <div className="absolute inset-0 backface-hidden glass rounded-xl border-l-4 border-l-cyan-500 p-4 flex flex-col justify-between overflow-hidden">
            <div className="scanline"></div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Topic: {card.topic}</span>
              <h4 className="text-lg font-bold mt-1 text-slate-100 leading-tight">{card.content}</h4>
            </div>
            <div className="flex justify-between items-end">
              <div className="w-2/3">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Crystallization</span>
                  <span>{card.crystallizationLevel}%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500" 
                    style={{ width: `${card.crystallizationLevel}%` }}
                  ></div>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(card.id); }}
                className="text-slate-500 hover:text-red-400 p-2"
              >
                <i className="fa-solid fa-trash-can text-xs"></i>
              </button>
            </div>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 backface-hidden [transform:rotateY(180deg)] glass rounded-xl border-l-4 border-l-emerald-500 p-4 flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Mirror Reasoning</span>
            <p className="mt-2 text-sm text-slate-300 flex-1 italic">
              "{card.reasoning}"
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-[10px] mt-2">
              <i className="fa-solid fa-shield-halved"></i>
              <span>TEMPORAL INTEGRITY VERIFIED</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlashcardSystem;
