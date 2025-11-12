import { type FC, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { calculateFinancialLiteracyScore } from '../metrics';
import { normalizeProvinceName } from '../../utils/provinceMapping';

interface UrbanizationImpactProps {
  surveyData: any[];
  regionalData: any[];
}

const UrbanizationImpact: FC<UrbanizationImpactProps> = ({ surveyData, regionalData }) => {
  
  const urbanizationData = useMemo(() => {
    // Create urbanization map
    const urbanizationMap: Record<string, number> = {};
    regionalData.forEach(region => {
        const provinsi = region.province || ''; // lowercase
        urbanizationMap[provinsi] = region.urbanization_percent || 0;
    });

    
    // Group by urbanization level
    const groups: Record<string, { scores: number[], urban: number[] }> = {
      'Rural (<30%)': { scores: [], urban: [] },
      'Semi-Urban (30-50%)': { scores: [], urban: [] },
      'Urban (50-70%)': { scores: [], urban: [] },
      'Highly Urban (>70%)': { scores: [], urban: [] }
    };
    
    surveyData.forEach(row => {
      const province = row['Province of Origin'] || row.province;
      if (!province) return;
      
      const normalizedName = normalizeProvinceName(province);
      const urbanization = urbanizationMap[normalizedName];
      
      if (!urbanization) return;
      
      const score = calculateFinancialLiteracyScore(row);
      if (score === 0) return;
      
      let category = '';
      if (urbanization < 30) category = 'Rural (<30%)';
      else if (urbanization < 50) category = 'Semi-Urban (30-50%)';
      else if (urbanization < 70) category = 'Urban (50-70%)';
      else category = 'Highly Urban (>70%)';
      
      groups[category].scores.push(score);
      groups[category].urban.push(urbanization);
    });
    
    return Object.entries(groups)
      .map(([category, data]) => ({
        category,
        literacy: data.scores.length > 0 
          ? data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length 
          : 0,
        avgUrbanization: data.urban.length > 0
          ? data.urban.reduce((sum, u) => sum + u, 0) / data.urban.length
          : 0,
        count: data.scores.length
      }))
      .filter(d => d.count > 0);
  }, [surveyData, regionalData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold mb-1">{data.category}</p>
          <p className="text-blue-400 text-sm">Literacy: {data.literacy.toFixed(2)}/4</p>
          <p className="text-green-400 text-sm">Avg Urbanization: {data.avgUrbanization.toFixed(1)}%</p>
          <p className="text-gray-400 text-xs mt-1">{data.count} respondents</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          🏙️ Urbanization Impact on Literacy
        </h3>
        <p className="text-sm text-gray-400">
          Financial literacy by urbanization level
        </p>
      </div>

      {urbanizationData.length === 0 ? (
        <div className="h-[350px] flex items-center justify-center text-gray-500">
          No urbanization data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={urbanizationData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="category" 
                stroke="#9ca3af"
                angle={-15}
                textAnchor="end"
                height={80}
                style={{ fontSize: '11px' }}
              />
              <YAxis 
                domain={[0, 4]}
                stroke="#9ca3af"
                label={{ 
                  value: 'Literacy Score', 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { fill: '#9ca3af' } 
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="literacy" 
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-sm text-purple-300">
              📊 <strong>Urban Advantage:</strong>{' '}
              {urbanizationData.length > 1 && urbanizationData[urbanizationData.length - 1]?.literacy > urbanizationData[0]?.literacy
                ? `Highly urban areas show ${((urbanizationData[urbanizationData.length - 1]?.literacy - urbanizationData[0]?.literacy) * 100 / urbanizationData[0]?.literacy).toFixed(0)}% higher literacy than rural areas.`
                : 'Urbanization shows positive impact on financial literacy.'
              }
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default UrbanizationImpact;
