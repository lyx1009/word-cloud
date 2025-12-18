import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { WordData } from '../types';
import { COLORS } from '../constants';

interface StatsChartProps {
  data: WordData[];
}

const StatsChart: React.FC<StatsChartProps> = ({ data }) => {
  // Take top 20 words for the chart
  const chartData = data.slice(0, 20).map(d => ({
    name: d.text,
    count: d.value
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 p-2 rounded shadow text-slate-100">
          <p className="font-bold">{label}</p>
          <p className="text-primary">{`Frequency: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[500px] bg-surface rounded-xl border border-slate-700 p-4 shadow-xl">
      <h3 className="text-lg font-semibold text-slate-200 mb-4 px-2">Top 20 Keywords</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={80} 
            stroke="#94a3b8" 
            tick={{ fontSize: 12 }} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsChart;
