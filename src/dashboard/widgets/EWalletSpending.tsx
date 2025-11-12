import { type FC, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import type { FinancialProfileData } from '../../services/dataTypes';

interface EWalletSpendingProps {
  profileData: FinancialProfileData[];
}

const EWalletSpending: FC<EWalletSpendingProps> = ({ profileData }) => {
  
  /**
   * Format label to be more readable
   */
  const formatLabel = (label: string): string => {
    // Original: "< Rp500.000"
    // Better: "< 500k"
    
    if (label.includes('< Rp500')) return '< 500k';
    if (label.includes('500.001') && label.includes('1.000.000')) return '500k - 1M';
    if (label.includes('1.000.001') && label.includes('3.000.000')) return '1M - 3M';
    if (label.includes('> Rp3.000.000')) return '> 3M';
    
    return label;
  };

  const spendingDistribution = useMemo(() => {
    const categories: Record<string, number> = {};
    
    profileData.forEach(p => {
      const spending = p.ewallet_spending || 'Unknown';
      categories[spending] = (categories[spending] || 0) + 1;
    });
    
    // Sort by typical order
    const order = [
      '< Rp500.000',
      'Rp500.001 - Rp1.000.000',
      'Rp1.000.001 - Rp3.000.000',
      '> Rp3.000.000',
      'Unknown'
    ];
    
    return order
      .filter(cat => categories[cat])
      .map(category => ({
        name: formatLabel(category),
        fullName: category,
        value: categories[category],
        percentage: (categories[category] / profileData.length) * 100
      }));
  }, [profileData]);

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold mb-1">{data.payload.fullName}</p>
          <p className="text-blue-400 text-sm">Count: {data.value}</p>
          <p className="text-green-400 text-sm">Percentage: {data.payload.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (entry: any) => {
    return `${entry.percentage.toFixed(0)}%`;
  };

  return (
    <div className="glass-panel p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          E-Wallet Spending Distribution
        </h3>
        <p className="text-sm text-gray-400">
          Monthly digital payment habits of GenZ
        </p>
      </div>

      {profileData.length === 0 ? (
        <div className="h-[350px] flex items-center justify-center text-gray-500">
          No data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendingDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {spendingDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Stats Summary */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300 mb-1">Most Common</p>
              <p className="text-sm font-bold text-blue-400">{spendingDistribution[0]?.name}</p>
              <p className="text-lg font-bold text-blue-300">
                {spendingDistribution[0]?.percentage.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-300 mb-1">High Spenders (&gt;1M)</p>
              <p className="text-sm font-bold text-green-400">
                {spendingDistribution.filter(d => d.name.includes('3M') || d.name.includes('1M - 3M')).length} groups
              </p>
              <p className="text-lg font-bold text-green-300">
                {(spendingDistribution
                  .filter(d => d.name.includes('3M') || d.name.includes('1M - 3M'))
                  .reduce((sum, d) => sum + d.percentage, 0)
                ).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Insight */}
          <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-sm text-purple-300">
              💳 <strong>Digital Adoption:</strong>{' '}
              {spendingDistribution[0]?.percentage > 40 ? 'Majority' : 'Most'} GenZ 
              spend {spendingDistribution[0]?.name} monthly on e-wallets, showing{' '}
              {spendingDistribution[0]?.percentage > 50 ? 'strong' : 'moderate'} digital payment adoption.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default EWalletSpending;
