import { type FC, useMemo } from 'react';
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
import type { FinancialProfileData } from '../../services/dataTypes';

interface AnxietyHeatmapProps {
  profileData: FinancialProfileData[];
}

const AnxietyHeatmap: FC<AnxietyHeatmapProps> = ({ profileData }) => {
  
  /**
   * Calculate anxiety by age group
   */
  const anxietyByAge = useMemo(() => {
    const groups: Record<string, number[]> = {};
    
    profileData.forEach(p => {
      if (!p.birth_year || !p.financial_anxiety_score) return;
      
      const age = 2025 - p.birth_year;
      let ageGroup = 'Unknown';
      if (age <= 20) ageGroup = '18-20';
      else if (age <= 23) ageGroup = '21-23';
      else if (age <= 25) ageGroup = '24-25';
      else ageGroup = '>25';
      
      if (!groups[ageGroup]) groups[ageGroup] = [];
      groups[ageGroup].push(p.financial_anxiety_score);
    });
    
    return Object.entries(groups)
      .map(([ageGroup, scores]) => ({
        group: ageGroup,
        anxiety: scores.reduce((sum, s) => sum + s, 0) / scores.length,
        count: scores.length
      }))
      .sort((a, b) => {
        const order = ['18-20', '21-23', '24-25', '>25', 'Unknown'];
        return order.indexOf(a.group) - order.indexOf(b.group);
      });
  }, [profileData]);

  const getAnxietyColor = (score: number) => {
    if (score >= 4) return '#ef4444'; // Red - High
    if (score >= 3) return '#f59e0b'; // Orange - Moderate
    return '#10b981'; // Green - Low
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const level = data.anxiety >= 4 ? 'High' : data.anxiety >= 3 ? 'Moderate' : 'Low';
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold mb-1">{data.group} years</p>
          <p className="text-orange-400 text-sm">Anxiety: {data.anxiety.toFixed(2)}/5</p>
          <p className="text-gray-400 text-xs">Level: {level}</p>
          <p className="text-gray-500 text-xs mt-1">{data.count} respondents</p>
        </div>
      );
    }
    return null;
  };

  const highestAnxiety = anxietyByAge.reduce((max, curr) => 
    curr.anxiety > max.anxiety ? curr : max, anxietyByAge[0] || { group: 'N/A', anxiety: 0 }
  );

  const lowestAnxiety = anxietyByAge.reduce((min, curr) => 
    curr.anxiety < min.anxiety ? curr : min, anxietyByAge[0] || { group: 'N/A', anxiety: 0 }
  );

  return (
    <div className="glass-panel p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          Financial Anxiety by Demographics
        </h3>
        <p className="text-sm text-gray-400">
          Stress levels across age groups (1-5 scale)
        </p>
      </div>

      {profileData.length === 0 ? (
        <div className="h-[350px] flex items-center justify-center text-gray-500">
          No data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={anxietyByAge} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="group" 
                stroke="#9ca3af"
                label={{ value: 'Age Group', position: 'insideBottom', offset: -10, style: { fill: '#9ca3af' } }}
              />
              <YAxis 
                domain={[0, 5]}
                stroke="#9ca3af"
                label={{ value: 'Anxiety Score', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="anxiety" radius={[8, 8, 0, 0]}>
                {anxietyByAge.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getAnxietyColor(entry.anxiety)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs text-red-300 mb-1">Highest Anxiety</p>
              <p className="text-sm font-bold text-red-400">{highestAnxiety.group}</p>
              <p className="text-lg font-bold text-red-300">{highestAnxiety.anxiety.toFixed(1)}/5</p>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-300 mb-1">Lowest Anxiety</p>
              <p className="text-sm font-bold text-green-400">{lowestAnxiety.group}</p>
              <p className="text-lg font-bold text-green-300">{lowestAnxiety.anxiety.toFixed(1)}/5</p>
            </div>
          </div>

          {/* Insight */}
          <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <p className="text-sm text-orange-300">
              😰 <strong>Stress Alert:</strong> {highestAnxiety.group} age group shows highest anxiety 
              ({highestAnxiety.anxiety.toFixed(1)}/5), likely due to {highestAnxiety.group === '21-23' ? 'career transition' : 'financial independence'} pressures.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AnxietyHeatmap;
