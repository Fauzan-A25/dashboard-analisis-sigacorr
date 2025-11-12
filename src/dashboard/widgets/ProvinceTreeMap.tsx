import { type FC, useMemo } from 'react';
import {
  Treemap,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { calculateFinancialLiteracyScore } from '../metrics';
import { normalizeProvinceName } from '../../utils/provinceMapping';

interface ProvinceTreeMapProps {
  surveyData: any[];
  regionalData: any[];
  onProvinceClick: (province: string) => void;
  selectedProvince: string;
}

const ProvinceTreeMap: FC<ProvinceTreeMapProps> = ({ 
  surveyData, 
  regionalData,
  onProvinceClick,
  selectedProvince
}) => {
  
  const provinceData = useMemo(() => {
    const provinceScores: Record<string, number[]> = {};
    
    surveyData.forEach(row => {
      const province = row['Province of Origin'] || row.province;
      if (!province) return;
      
      const score = calculateFinancialLiteracyScore(row);
      if (score > 0) {
        if (!provinceScores[province]) provinceScores[province] = [];
        provinceScores[province].push(score);
      }
    });
    
    return Object.entries(provinceScores).map(([name, scores]) => {
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      const normalizedName = normalizeProvinceName(name);
      const regional = regionalData.find(r => r.province === normalizedName);
      
      return {
        name,
        value: scores.length,
        score: avgScore,
        count: scores.length,
        pdrb: regional?.['PDRB (Ribu Rp)'] || 0,
        loans: regional?.['Outstanding Pinjaman (Rp miliar)'] || 0,
        urbanization: regional?.['Urbanisasi (%)'] || 0
      };
    }).sort((a, b) => b.score - a.score);
  }, [surveyData, regionalData]);

  const getColor = (score: number) => {
    if (score >= 3) return '#10b981';
    if (score >= 2.5) return '#3b82f6';
    if (score >= 2) return '#f59e0b';
    return '#ef4444';
  };

  const CustomContent = (props: any) => {
    const { x, y, width, height, name, score, count } = props;
    
    if (!name || !score || width < 80 || height < 60) return null;
    
    const isSelected = name === selectedProvince;
    const displayName = typeof name === 'string' && name.length > 15 
      ? name.substring(0, 12) + '...' 
      : name;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: getColor(score),
            stroke: isSelected ? '#fff' : '#1a1f3e',
            strokeWidth: isSelected ? 3 : 1,
            opacity: 0.9,
            cursor: 'pointer'
          }}
          onClick={() => onProvinceClick(name)}
        />
        <text
          x={x + width / 2}
          y={y + height / 2 - 10}
          textAnchor="middle"
          fill="#fff"
          fontSize={width > 100 ? 14 : 11}
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          {displayName}
        </text>
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          fill="#fff"
          fontSize={width > 100 ? 16 : 12}
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          {typeof score === 'number' ? score.toFixed(2) : '0.00'}
        </text>
        <text
          x={x + width / 2}
          y={y + height / 2 + 25}
          textAnchor="middle"
          fill="#e5e7eb"
          fontSize={10}
          style={{ pointerEvents: 'none' }}
        >
          {count || 0} resp.
        </text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold mb-2">{data.name}</p>
          <p className="text-blue-400 text-sm">Literacy: {data.score.toFixed(2)}/4</p>
          <p className="text-green-400 text-sm">Respondents: {data.count}</p>
          {data.pdrb > 0 && (
            <p className="text-purple-400 text-sm">PDRB: Rp {(data.pdrb / 1000).toFixed(0)}M</p>
          )}
          {data.loans > 0 && (
            <p className="text-orange-400 text-sm">Loans: Rp {data.loans.toFixed(1)}B</p>
          )}
          {data.urbanization > 0 && (
            <p className="text-yellow-400 text-sm">Urbanization: {data.urbanization.toFixed(1)}%</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          📍 Financial Literacy by Province
        </h3>
        <p className="text-sm text-gray-400">
          Size = Number of respondents, Color = Literacy score. Click to filter.
        </p>
      </div>

      {provinceData.length === 0 ? (
        <div className="h-[500px] flex items-center justify-center text-gray-500">
          No province data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={500}>
            <Treemap
              data={provinceData}
              dataKey="value"
              stroke="#1a1f3e"
              fill="#8884d8"
              content={<CustomContent />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
              <span className="text-xs text-gray-300">High (≥3.0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
              <span className="text-xs text-gray-300">Good (2.5-3.0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
              <span className="text-xs text-gray-300">Moderate (2.0-2.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
              <span className="text-xs text-gray-300">Low (&lt;2.0)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProvinceTreeMap;
