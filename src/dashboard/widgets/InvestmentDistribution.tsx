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

interface InvestmentDistributionProps {
  profileData: FinancialProfileData[];
}

const InvestmentDistribution: FC<InvestmentDistributionProps> = ({ profileData }) => {
  
  const investmentData = useMemo(() => {
    const types: Record<string, number> = {};
    
    profileData.forEach(p => {
      const type = p.investment_type || 'None';
      types[type] = (types[type] || 0) + 1;
    });
    
    return Object.entries(types)
      .map(([type, count]) => ({
        type,
        count,
        percentage: (count / profileData.length) * 100
      }))
      .sort((a, b) => b.count - a.count);
  }, [profileData]);

  const colors: Record<string, string> = {
    'Reksadana': '#3b82f6',
    'Saham': '#10b981',
    'Kripto': '#f59e0b',
    'Emas': '#fbbf24',
    'Deposito': '#8b5cf6',
    'None': '#6b7280',
    'Unknown': '#9ca3af'
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold mb-1">{data.type}</p>
          <p className="text-blue-400 text-sm">Count: {data.count}</p>
          <p className="text-green-400 text-sm">Percentage: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const investors = investmentData.filter(d => d.type !== 'None').reduce((sum, d) => sum + d.count, 0);
  const nonInvestors = investmentData.find(d => d.type === 'None')?.count || 0;

  return (
    <div className="glass-panel p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          Investment Type Distribution
        </h3>
        <p className="text-sm text-gray-400">
          GenZ investment preferences and adoption
        </p>
      </div>

      {profileData.length === 0 ? (
        <div className="h-[350px] flex items-center justify-center text-gray-500">
          No data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart 
              data={investmentData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number" 
                stroke="#9ca3af"
                label={{ value: 'Count', position: 'insideBottom', offset: -10, style: { fill: '#9ca3af' } }}
              />
              <YAxis 
                type="category" 
                dataKey="type"
                stroke="#9ca3af"
                width={90}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {investmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[entry.type] || '#6b7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-300 mb-1">Active Investors</p>
              <p className="text-2xl font-bold text-green-400">{investors}</p>
              <p className="text-xs text-gray-400">{((investors / profileData.length) * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-gray-500/10 border border-gray-500/30 rounded-lg">
              <p className="text-xs text-gray-300 mb-1">Non-Investors</p>
              <p className="text-2xl font-bold text-gray-400">{nonInvestors}</p>
              <p className="text-xs text-gray-400">{((nonInvestors / profileData.length) * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300 mb-1">Most Popular</p>
              <p className="text-sm font-bold text-blue-400">{investmentData[0]?.type}</p>
              <p className="text-xs text-gray-400">{investmentData[0]?.percentage.toFixed(1)}%</p>
            </div>
          </div>

          {/* Insight */}
          <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-sm text-purple-300">
              📈 <strong>Investment Behavior:</strong> {investmentData[0]?.type} is the preferred choice 
              ({investmentData[0]?.percentage.toFixed(0)}%), showing GenZ's interest in 
              {investmentData[0]?.type === 'Reksadana' ? ' low-risk diversified' : ' high-risk high-return'} instruments.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default InvestmentDistribution;
