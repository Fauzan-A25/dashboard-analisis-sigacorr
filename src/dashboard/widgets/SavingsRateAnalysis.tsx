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

interface SavingsRateAnalysisProps {
  profileData: FinancialProfileData[];
}

const SavingsRateAnalysis: FC<SavingsRateAnalysisProps> = ({ profileData }) => {
  
  /**
   * Parse income/expense and calculate savings rate
   */
  const parseAmount = (value: any): number => {
    if (!value) return 0;
    
    // Convert to string if it's a number
    const str = typeof value === 'number' ? value.toString() : value;
    
    const cleaned = str.replace(/Rp/g, '').replace(/\s/g, '');
    if (cleaned.includes('<')) return 1;
    if (cleaned.includes('>')) return 17.5;
    const numbers = cleaned.match(/[\d.]+/g);
    if (!numbers) return 0;
    const values = numbers.map((n: string) => parseFloat(n.replace(/\./g, '')) / 1000000);
    return values.length >= 2 ? (values[0] + values[1]) / 2 : values[0];
  };

  const savingsDistribution = useMemo(() => {
    const categories = {
      'Deficit': 0,
      'Low (0-10%)': 0,
      'Moderate (10-30%)': 0,
      'High (>30%)': 0
    };
    
    profileData.forEach(p => {
      const income = parseAmount(p.avg_monthly_income);
      const expense = parseAmount(p.avg_monthly_expense);
      
      if (income === 0) return;
      
      const savingsRate = ((income - expense) / income) * 100;
      
      if (savingsRate < 0) categories['Deficit']++;
      else if (savingsRate <= 10) categories['Low (0-10%)']++;
      else if (savingsRate <= 30) categories['Moderate (10-30%)']++;
      else categories['High (>30%)']++;
    });
    
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      percentage: profileData.length > 0 ? (value / profileData.length) * 100 : 0
    }));
  }, [profileData]);

  const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold mb-1">{data.name}</p>
          <p className="text-blue-400 text-sm">Count: {data.value}</p>
          <p className="text-green-400 text-sm">{data.payload.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = (entry: any) => {
    return `${entry.percentage.toFixed(0)}%`;
  };

  const healthySavers = savingsDistribution.slice(-2).reduce((sum, d) => sum + d.value, 0);
  const atRisk = savingsDistribution[0].value; // Deficit

  return (
    <div className="glass-panel p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          Savings Rate Distribution
        </h3>
        <p className="text-sm text-gray-400">
          Financial cushion analysis: (Income - Expense) / Income
        </p>
      </div>

      {profileData.length === 0 ? (
        <div className="h-[350px] flex items-center justify-center text-gray-500">
          No data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={savingsDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {savingsDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
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

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-300 mb-1">Healthy Savers</p>
              <p className="text-2xl font-bold text-green-400">{healthySavers}</p>
              <p className="text-xs text-gray-400">{((healthySavers / profileData.length) * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs text-red-300 mb-1">Deficit (At Risk)</p>
              <p className="text-2xl font-bold text-red-400">{atRisk}</p>
              <p className="text-xs text-gray-400">{((atRisk / profileData.length) * 100).toFixed(1)}%</p>
            </div>
          </div>

          {/* Insight */}
          <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <p className="text-sm text-orange-300">
              💰 <strong>Savings Alert:</strong> {((atRisk / profileData.length) * 100).toFixed(0)}% are spending more than they earn. 
              {atRisk > (profileData.length * 0.3) && ' Budget counseling programs urgently needed.'}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default SavingsRateAnalysis;
