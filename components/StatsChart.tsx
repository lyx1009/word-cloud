
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
        <div className="bg-white border border-slate-200 p-2 rounded shadow-lg text-slate-800">
          <p className="font-bold">{label}</p>
          <p className="text-primary">{`频次: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[500px] bg-white rounded-xl border border-slate-200 p-4 shadow-md">
      <h3 className="text-lg font-semibold text-slate-700 mb-4 px-2">前 20 位高频词汇</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" fontSize={10} />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={80} 
            stroke="#94a3b8" 
            tick={{ fontSize: 12, fill: '#64748b' }} 
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
