
import React from 'react';
import { SentimentData } from '../types';
import { Smile, Frown, Meh, Zap } from 'lucide-react';

interface SentimentPanelProps {
  data: SentimentData[];
  overallTone: string;
}

const SentimentPanel: React.FC<SentimentPanelProps> = ({ data, overallTone }) => {
  const dominant = [...data].sort((a, b) => b.score - a.score)[0];

  const getIcon = (label: string) => {
    if (label.includes('喜') || label.includes('Joy')) return <Smile size={32} className="text-amber-500" />;
    if (label.includes('悲') || label.includes('怒') || label.includes('Sad') || label.includes('Anger')) return <Frown size={32} className="text-rose-500" />;
    if (label.includes('中') || label.includes('Neutral')) return <Meh size={32} className="text-slate-400" />;
    return <Zap size={32} className="text-purple-500" />;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-md space-y-6">
      <div className="flex items-start gap-4">
        <div className="p-4 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
          {dominant ? getIcon(dominant.label) : <Meh size={32} className="text-slate-400" />}
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">情绪倾向：{dominant?.label || "分析中"}</h3>
          <p className="text-slate-500 text-sm leading-relaxed">{overallTone}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">情感分布</h4>
        {data.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 font-medium">{item.label}</span>
              <span className="text-slate-400">{item.score}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div 
                className="h-full transition-all duration-1000 ease-out" 
                style={{ 
                  width: `${item.score}%`, 
                  backgroundColor: item.color,
                  boxShadow: `0 0 8px ${item.color}33`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentimentPanel;
