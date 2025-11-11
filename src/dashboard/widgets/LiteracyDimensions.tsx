import { type FC, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

interface Props {
  data: any[];
}

const LiteracyDimensions: FC<Props> = ({ data = [] }) => {
  
  /**
   * Calculate dimension score (normalized to 0-25 scale for better visualization)
   */
  const calculateDimensionScore = (dataset: any[], startQ: number, endQ: number) => {
    const questionCount = endQ - startQ + 1;
    if (!dataset || dataset.length === 0) return 0;
    
    const total = dataset.reduce((acc, row) => {
      const sum = Array.from({ length: questionCount }, (_, i) => row[`Q${startQ + i}`] || 0)
        .reduce((a, b) => a + b, 0);
      return acc + sum;
    }, 0);
    
    // Normalize from 1-4 Likert to 0-25 scale
    const avgLikert = total / (dataset.length * questionCount);
    return ((avgLikert - 1) / 3) * 25; // (avg - min) / (max - min) * 25
  };

  const dimensionsData = useMemo(() => {
    const dims = {
      'Financial Knowledge': calculateDimensionScore(data, 1, 9),
      'Digital Literacy': calculateDimensionScore(data, 10, 18),
      'Financial Behavior': calculateDimensionScore(data, 19, 29),
      'Decision Making': calculateDimensionScore(data, 30, 39),
      'Well-being': calculateDimensionScore(data, 40, 48),
    };

    return Object.entries(dims).map(([name, value]) => ({
      name,
      value: Math.round(value * 10) / 10, // Round to 1 decimal
      fullValue: value
    }));
  }, [data]);

  // Color palette for each dimension
  const dimensionColors: Record<string, string> = {
    'Financial Knowledge': '#3b82f6',  // Blue
    'Digital Literacy': '#10b981',     // Green
    'Financial Behavior': '#f59e0b',   // Orange
    'Decision Making': '#8b5cf6',      // Purple
    'Well-being': '#ec4899',           // Pink
  };

  // Find highest and lowest dimensions
  const highest = useMemo(() => {
    return dimensionsData.reduce((max, d) => d.value > max.value ? d : max, dimensionsData[0]);
  }, [dimensionsData]);

  const lowest = useMemo(() => {
    return dimensionsData.reduce((min, d) => d.value < min.value ? d : min, dimensionsData[0]);
  }, [dimensionsData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold mb-1">{data.name}</p>
          <p className="text-blue-400 text-lg font-bold">{data.value}/25</p>
          <p className="text-gray-400 text-xs mt-1">
            {((data.value / 25) * 100).toFixed(1)}% of maximum
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          Financial Literacy Dimensions
        </h3>
        <p className="text-sm text-gray-400">
          Five key dimensions of financial literacy performance
        </p>
      </div>

      {data.length === 0 ? (
        <div className="h-[380px] flex items-center justify-center text-gray-500">
          No data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart 
              data={dimensionsData}
              margin={{ top: 20, right: 20, bottom: 80, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                domain={[0, 25]}
                ticks={[0, 5, 10, 15, 20, 25]}
                stroke="#9ca3af"
                label={{ 
                  value: 'Score (out of 25)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: '#9ca3af', fontSize: 12 }
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
              <Bar 
                dataKey="value" 
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              >
                {dimensionsData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={dimensionColors[entry.name] || '#6b7280'}
                  />
                ))}
                {/* Show values on top of bars */}
                <LabelList 
                  dataKey="value" 
                  position="top" 
                  style={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Stats Summary */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-300 mb-1">Highest</p>
              <p className="text-sm font-bold text-green-400">
                {highest.name}
              </p>
              <p className="text-lg font-bold text-green-300">
                {highest.value}/25
              </p>
            </div>
            <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p className="text-xs text-orange-300 mb-1">Lowest</p>
              <p className="text-sm font-bold text-orange-400">
                {lowest.name}
              </p>
              <p className="text-lg font-bold text-orange-300">
                {lowest.value}/25
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300 mb-1">Average</p>
              <p className="text-lg font-bold text-blue-400">
                {(dimensionsData.reduce((sum, d) => sum + d.value, 0) / dimensionsData.length).toFixed(1)}/25
              </p>
              <p className="text-xs text-gray-400">Across all dimensions</p>
            </div>
          </div>

          {/* Insight Box */}
          <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-sm text-purple-300">
              💡 <strong>Insight:</strong> {highest.name} shows the strongest performance 
              ({((highest.value / 25) * 100).toFixed(0)}%), while {lowest.name} 
              ({((lowest.value / 25) * 100).toFixed(0)}%) needs improvement among GenZ respondents.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default LiteracyDimensions;
