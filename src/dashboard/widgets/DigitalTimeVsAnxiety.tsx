import { type FC, useMemo } from 'react';
import {
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';
import type { FinancialProfileData } from '../../services/dataTypes';

interface DigitalTimeVsAnxietyProps {
  profileData: FinancialProfileData[];
}

const DigitalTimeVsAnxiety: FC<DigitalTimeVsAnxietyProps> = ({ profileData }) => {
  
  const chartData = useMemo(() => {
    return profileData
      .filter(p => 
        typeof p.digital_time_spent_per_day === 'number' && 
        typeof p.financial_anxiety_score === 'number' &&
        p.digital_time_spent_per_day > 0
      )
      .map(p => ({
        time: p.digital_time_spent_per_day || 0,
        anxiety: p.financial_anxiety_score || 0,
        province: p.province || 'Unknown',
        ageGroup: p.birth_year ? (2025 - p.birth_year <= 23 ? 'Young (≤23)' : 'Older (>23)') : 'Unknown'
      }));
  }, [profileData]);

  // Calculate correlation
  const correlation = useMemo(() => {
    if (chartData.length === 0) return 0;
    
    const n = chartData.length;
    const sumX = chartData.reduce((sum, d) => sum + d.time, 0);
    const sumY = chartData.reduce((sum, d) => sum + d.anxiety, 0);
    const sumXY = chartData.reduce((sum, d) => sum + d.time * d.anxiety, 0);
    const sumX2 = chartData.reduce((sum, d) => sum + d.time * d.time, 0);
    const sumY2 = chartData.reduce((sum, d) => sum + d.anxiety * d.anxiety, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }, [chartData]);

  // Trendline
  const trendlineData = useMemo(() => {
    if (chartData.length === 0) return [];
    
    const n = chartData.length;
    const sumX = chartData.reduce((sum, d) => sum + d.time, 0);
    const sumY = chartData.reduce((sum, d) => sum + d.anxiety, 0);
    const sumXY = chartData.reduce((sum, d) => sum + d.time * d.anxiety, 0);
    const sumX2 = chartData.reduce((sum, d) => sum + d.time * d.time, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const minX = Math.min(...chartData.map(d => d.time));
    const maxX = Math.max(...chartData.map(d => d.time));
    
    return [
      { time: minX, anxiety: slope * minX + intercept },
      { time: maxX, anxiety: slope * maxX + intercept }
    ];
  }, [chartData]);

  const groupedData = useMemo(() => {
    const groups: Record<string, typeof chartData> = {};
    chartData.forEach(d => {
      if (!groups[d.ageGroup]) groups[d.ageGroup] = [];
      groups[d.ageGroup].push(d);
    });
    return groups;
  }, [chartData]);

  const ageColors: Record<string, string> = {
    'Young (≤23)': '#3b82f6',
    'Older (>23)': '#f59e0b',
    'Unknown': '#6b7280'
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold mb-1">{data.ageGroup}</p>
          <p className="text-blue-400 text-sm">Digital Time: {data.time.toFixed(1)} hrs/day</p>
          <p className="text-red-400 text-sm">Anxiety Score: {data.anxiety}/5</p>
          <p className="text-gray-400 text-xs mt-1">{data.province}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          Digital Time vs Financial Anxiety
        </h3>
        <p className="text-sm text-gray-400">
          Impact of digital device usage on financial stress levels
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[400px] flex items-center justify-center text-gray-500">
          No data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number" 
                dataKey="time" 
                stroke="#9ca3af"
                label={{ 
                  value: 'Digital Time Spent (hours/day)', 
                  position: 'bottom',
                  offset: 40,
                  style: { fill: '#9ca3af' }
                }}
              />
              <YAxis 
                type="number" 
                dataKey="anxiety" 
                domain={[0, 5]}
                stroke="#9ca3af"
                label={{ 
                  value: 'Financial Anxiety Score', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -40,
                  style: { fill: '#9ca3af' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Scatter by age group */}
              {Object.entries(groupedData).map(([ageGroup, data]) => (
                <Scatter
                  key={ageGroup}
                  name={ageGroup}
                  data={data}
                  fill={ageColors[ageGroup]}
                  fillOpacity={0.6}
                />
              ))}
              
              {/* Trendline */}
              <Line 
                data={trendlineData}
                type="monotone"
                dataKey="anxiety"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="Trend"
                strokeDasharray="5 5"
              />
            </ComposedChart>
          </ResponsiveContainer>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs text-red-300 mb-1">Correlation (r)</p>
              <p className="text-2xl font-bold text-red-400">
                {correlation.toFixed(3)}
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300 mb-1">Avg Digital Time</p>
              <p className="text-2xl font-bold text-blue-400">
                {(chartData.reduce((sum, d) => sum + d.time, 0) / chartData.length).toFixed(1)}h
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-xs text-purple-300 mb-1">Avg Anxiety</p>
              <p className="text-2xl font-bold text-purple-400">
                {(chartData.reduce((sum, d) => sum + d.anxiety, 0) / chartData.length).toFixed(1)}/5
              </p>
            </div>
          </div>

          {/* Insight */}
          <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <p className="text-sm text-orange-300">
              ⚠️ <strong>Finding:</strong> Correlation of {correlation.toFixed(3)} suggests that increased digital time 
              is associated with higher financial anxiety among GenZ.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default DigitalTimeVsAnxiety;
