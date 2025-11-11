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
import { 
  calculateFinancialLiteracyScore, 
  calculateDigitalAdoptionScore 
} from '../metrics';

interface LiteracyVsFintechCorrelationProps {
  surveyData: any[];
}

const LiteracyVsFintechCorrelation: FC<LiteracyVsFintechCorrelationProps> = ({ surveyData }) => {
  
  const chartData = useMemo(() => {
    console.log(`📊 Processing ${surveyData.length} survey records for correlation...`);
    
    const data = surveyData
      .map(row => {
        const literacyScore = calculateFinancialLiteracyScore(row);
        const fintechScore = calculateDigitalAdoptionScore(row);
        const birthYear = row['Year of Birth'] || row.birth_year;
        const age = birthYear ? 2025 - birthYear : null;
        
        let ageGroup = 'Unknown';
        if (age) {
          if (age <= 20) ageGroup = '18-20';
          else if (age <= 23) ageGroup = '21-23';
          else if (age <= 25) ageGroup = '24-25';
          else ageGroup = '>25';
        }
        
        return {
          literacy: literacyScore,
          fintech: fintechScore,
          ageGroup,
          isValid: literacyScore > 0 && fintechScore > 0 && !isNaN(literacyScore) && !isNaN(fintechScore)
        };
      })
      .filter(d => d.isValid); // Only keep valid data points
    
    console.log(`✅ Valid data points: ${data.length}`);
    console.log('Sample:', data.slice(0, 3));
    
    return data;
  }, [surveyData]);

  // Calculate correlation
  const correlation = useMemo(() => {
    if (chartData.length < 2) {
      console.warn('⚠️ Not enough data points for correlation');
      return 0;
    }
    
    const n = chartData.length;
    const sumX = chartData.reduce((sum, d) => sum + d.literacy, 0);
    const sumY = chartData.reduce((sum, d) => sum + d.fintech, 0);
    const sumXY = chartData.reduce((sum, d) => sum + d.literacy * d.fintech, 0);
    const sumX2 = chartData.reduce((sum, d) => sum + d.literacy * d.literacy, 0);
    const sumY2 = chartData.reduce((sum, d) => sum + d.fintech * d.fintech, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    if (denominator === 0 || isNaN(denominator)) {
      console.warn('⚠️ Invalid denominator for correlation');
      return 0;
    }
    
    const result = numerator / denominator;
    console.log(`📈 Correlation: ${result.toFixed(3)}`);
    return result;
  }, [chartData]);

  // Calculate trendline
  const trendlineData = useMemo(() => {
    if (chartData.length < 2) return [];
    
    const n = chartData.length;
    const sumX = chartData.reduce((sum, d) => sum + d.literacy, 0);
    const sumY = chartData.reduce((sum, d) => sum + d.fintech, 0);
    const sumXY = chartData.reduce((sum, d) => sum + d.literacy * d.fintech, 0);
    const sumX2 = chartData.reduce((sum, d) => sum + d.literacy * d.literacy, 0);
    
    const denominator = (n * sumX2 - sumX * sumX);
    if (denominator === 0) return [];
    
    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;
    
    const minX = Math.min(...chartData.map(d => d.literacy));
    const maxX = Math.max(...chartData.map(d => d.literacy));
    
    return [
      { literacy: minX, fintech: slope * minX + intercept },
      { literacy: maxX, fintech: slope * maxX + intercept }
    ];
  }, [chartData]);

  const ageColors: Record<string, string> = {
    '18-20': '#3b82f6',
    '21-23': '#10b981',
    '24-25': '#f59e0b',
    '>25': '#ef4444',
    'Unknown': '#6b7280'
  };

  // Aggregate/sample data for performance
  const aggregatedData = useMemo(() => {
    const groups: Record<string, typeof chartData> = {};
    
    chartData.forEach(d => {
      if (!groups[d.ageGroup]) groups[d.ageGroup] = [];
      groups[d.ageGroup].push(d);
    });
    
    // Sample if too many points
    const sampledGroups: Record<string, typeof chartData> = {};
    Object.entries(groups).forEach(([ageGroup, data]) => {
      if (data.length > 300) {
        const step = Math.ceil(data.length / 300);
        sampledGroups[ageGroup] = data.filter((_, i) => i % step === 0);
      } else {
        sampledGroups[ageGroup] = data;
      }
    });
    
    return sampledGroups;
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold mb-1">{data.ageGroup} years</p>
          <p className="text-blue-400 text-sm">Literacy: {data.literacy.toFixed(2)}/4</p>
          <p className="text-green-400 text-sm">Fintech: {data.fintech.toFixed(2)}/4</p>
        </div>
      );
    }
    return null;
  };

  // Calculate display count
  const displayedCount = Object.values(aggregatedData).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="glass-panel p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          Financial Literacy vs Fintech Usage
        </h3>
        <p className="text-sm text-gray-400">
          Correlation between literacy and digital financial adoption
        </p>
      </div>

      {chartData.length < 2 ? (
        <div className="h-[380px] flex flex-col items-center justify-center text-gray-500">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg font-semibold">Insufficient Data</p>
          <p className="text-sm mt-2">Need at least 2 data points for correlation analysis</p>
          <p className="text-xs mt-2 text-gray-600">
            Current: {chartData.length} valid point{chartData.length !== 1 ? 's' : ''}
          </p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart margin={{ top: 20, right: 20, bottom: 40, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number" 
                dataKey="literacy" 
                domain={[0, 4]}
                ticks={[0, 1, 2, 3, 4]}
                stroke="#9ca3af"
                label={{ 
                  value: 'Financial Literacy Score', 
                  position: 'insideBottom',
                  offset: -5,
                  style: { fill: '#9ca3af', fontSize: 12 }
                }}
              />
              <YAxis 
                type="number" 
                dataKey="fintech" 
                domain={[0, 4]}
                ticks={[0, 1, 2, 3, 4]}
                stroke="#9ca3af"
                label={{ 
                  value: 'Fintech Usage Score', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -40,
                  style: { fill: '#9ca3af', fontSize: 12 }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Scatter points by age group */}
              {Object.entries(aggregatedData).map(([ageGroup, data]) => (
                <Scatter
                  key={ageGroup}
                  name={ageGroup}
                  data={data}
                  fill={ageColors[ageGroup]}
                  fillOpacity={0.5}
                  shape="circle"
                  isAnimationActive={false}
                />
              ))}
              
              {/* Trendline */}
              {trendlineData.length > 0 && (
                <Line 
                  data={trendlineData}
                  type="monotone"
                  dataKey="fintech"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="Trend"
                  strokeDasharray="5 5"
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>

          {/* Custom Legend */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center border-t border-gray-700/50 pt-4">
            {Object.entries(aggregatedData)
              .sort((a, b) => b[1].length - a[1].length)
              .map(([ageGroup, data]) => (
                <div key={ageGroup} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: ageColors[ageGroup] }}
                  />
                  <span className="text-xs text-gray-300">
                    {ageGroup} <span className="text-gray-500">({data.length})</span>
                  </span>
                </div>
              ))}
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-xs text-purple-300 mb-1">Correlation (r)</p>
              <p className="text-2xl font-bold text-purple-400">
                {correlation.toFixed(3)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {Math.abs(correlation) > 0.7 ? 'Strong' : Math.abs(correlation) > 0.3 ? 'Moderate' : 'Weak'} 
                {correlation > 0 ? ' positive' : correlation < 0 ? ' negative' : ''}
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300 mb-1">Sample Size</p>
              <p className="text-2xl font-bold text-blue-400">
                {chartData.length}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Displayed: {displayedCount}
              </p>
            </div>
          </div>

          {/* Insight */}
          <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-300">
              💡 <strong>Insight:</strong> {
                Math.abs(correlation) > 0.5 
                  ? 'Strong positive correlation suggests that higher financial literacy leads to more responsible fintech usage.'
                  : Math.abs(correlation) > 0.3
                  ? 'Moderate correlation indicates some relationship between financial literacy and fintech adoption.'
                  : 'Weak correlation suggests other factors may influence fintech usage beyond literacy alone.'
              }
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default LiteracyVsFintechCorrelation;
