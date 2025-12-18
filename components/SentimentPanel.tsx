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
    if (label.includes('喜') || label.includes('Joy')) return <Smile className="text-yellow-400" />;
    if (label.includes('悲') || label.includes('怒') || label.includes('Sad') || label.includes('Anger')) return <Frown className="text-red-400" />;
    if (label.includes('中') || label.includes('Neutral')) return <Meh className="text-slate-400" />;
    return <Zap className="text-purple-400" />;
  };

  return (
    <div className="bg-surface rounded-xl border border-slate-700 p-6 shadow-xl space-y-6">
      <div className="flex items-start gap-4">
        <div className="p-4 bg-slate-800 rounded-full border border-slate-600 shadow-inner">
          {dominant ? getIcon(dominant.label) : <Meh />}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-1">情绪倾向：{dominant?.label || "未知"}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{overallTone}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">情感分布</h4>
        {data.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300 font-medium">{item.label}</span>
              <span className="text-slate-500">{item.score}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div 
                className="h-full transition-all duration-1000 ease-out" 
                style={{ 
                  width: `${item.score}%`, 
                  backgroundColor: item.color,
                  boxShadow: `0 0 10px ${item.color}44`
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
