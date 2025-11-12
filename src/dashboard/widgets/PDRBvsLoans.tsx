import { type FC, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis
} from 'recharts';
import { normalizeProvinceName } from '../../utils/provinceMapping';

interface PDRBvsLoansProps {
  regionalData: any[];
  selectedProvince: string;
}

const PDRBvsLoans: FC<PDRBvsLoansProps> = ({ regionalData, selectedProvince }) => {
  
  const scatterData = useMemo(() => {
    if (!regionalData || regionalData.length === 0) return [];
    
    return regionalData
      .map(region => {
        const pdrb = region['PDRB (Ribu Rp)'] || 0;
        const loans = region['Outstanding Pinjaman (Rp miliar)'] || 0;
        const population = region['Jumlah Penduduk (Ribu)'] || 1;
        const urbanization = region['Urbanisasi (%)'] || 0;
        const provinsi = region.province || 'Unknown'; // lowercase
        
        const pdrbPerCapita = population > 0 ? pdrb / population : 0;
        
        return {
          name: provinsi,
          pdrb: pdrb / 1000, // Convert to millions
          loans,
          pdrbPerCapita,
          urbanization,
          population,
          isSelected: normalizeProvinceName(selectedProvince) === provinsi
        };
      })
      .filter(d => d.pdrb > 0 && d.loans > 0);
  }, [regionalData, selectedProvince]);

  const getColor = (urbanization: number) => {
    if (urbanization >= 70) return '#10b981';
    if (urbanization >= 50) return '#3b82f6';
    if (urbanization >= 30) return '#f59e0b';
    return '#ef4444';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold mb-2">{data.name}</p>
          <p className="text-blue-400 text-sm">PDRB: Rp {data.pdrb.toFixed(0)}M</p>
          <p className="text-orange-400 text-sm">Loans: Rp {data.loans.toFixed(1)}B</p>
          <p className="text-green-400 text-sm">PDRB/Capita: Rp {data.pdrbPerCapita.toFixed(0)}k</p>
          <p className="text-purple-400 text-sm">Urbanization: {data.urbanization.toFixed(1)}%</p>
          <p className="text-gray-400 text-xs mt-1">Population: {data.population}k</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          💰 PDRB vs Outstanding Loans
        </h3>
        <p className="text-sm text-gray-400">
          Economic productivity vs debt burden by province
        </p>
      </div>

      {scatterData.length === 0 ? (
        <div className="h-[350px] flex flex-col items-center justify-center text-gray-500">
          <div className="text-5xl mb-3">📊</div>
          <p className="text-lg">No regional data available</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number" 
                dataKey="pdrb" 
                name="PDRB"
                stroke="#9ca3af"
                label={{ 
                  value: 'PDRB (Million Rp)', 
                  position: 'insideBottom', 
                  offset: -5, 
                  style: { fill: '#9ca3af', fontSize: 11 } 
                }}
              />
              <YAxis 
                type="number" 
                dataKey="loans" 
                name="Loans"
                stroke="#9ca3af"
                label={{ 
                  value: 'Outstanding Loans (Billion Rp)', 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { fill: '#9ca3af', fontSize: 11 } 
                }}
              />
              <ZAxis range={[50, 400]} dataKey="population" />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter 
                data={scatterData} 
                fill="#8884d8"
                isAnimationActive={false}
              >
                {scatterData.map((entry, index) => (
                  <circle 
                    key={`dot-${index}`} 
                    r={entry.isSelected ? 8 : 6} 
                    fill={getColor(entry.urbanization)}
                    opacity={entry.isSelected ? 1 : 0.7}
                    stroke={entry.isSelected ? '#fff' : 'none'}
                    strokeWidth={entry.isSelected ? 2 : 0}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300 mb-1">Correlation</p>
              <p className="text-sm font-bold text-blue-400">
                Higher PDRB = Higher loan activity
              </p>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-300 mb-1">Color Legend</p>
              <div className="flex gap-2 flex-wrap text-xs">
                <span className="text-green-400">● &gt;70%</span>
                <span className="text-blue-400">● 50-70%</span>
                <span className="text-orange-400">● 30-50%</span>
                <span className="text-red-400">● &lt;30%</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PDRBvsLoans;
