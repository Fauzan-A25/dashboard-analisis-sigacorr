import { type FC, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import type { FinancialProfileData } from '../../services/dataTypes';

interface IncomeVsExpenditureProps {
  profileData: FinancialProfileData[];
}

const IncomeVsExpenditure: FC<IncomeVsExpenditureProps> = ({ profileData }) => {
  
  /**
   * Parse income range from string format
   */
  const parseIncomeRange = (str: string | number): number => {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    
    const strVal = String(str);
    
    // Extract all numbers from string
    const matches = strVal.match(/\d+/g);
    if (!matches) return 0;
    
    const numbers = matches.map(m => parseInt(m));
    
    // If range (e.g., "Rp2.000.001 - Rp4.000.000"), take midpoint
    if (numbers.length >= 2) {
      return (numbers[0] + numbers[1]) / 2;
    }
    
    // Single number
    return numbers[0] || 0;
  };

  const chartData = useMemo(() => {
    const data = profileData
      .filter(p => p.avg_monthly_income && p.avg_monthly_expense)
      .map(p => {
        const income = parseIncomeRange(p.avg_monthly_income_raw || p.avg_monthly_income || 0);
        const expense = parseIncomeRange(p.avg_monthly_expense_raw || p.avg_monthly_expense || 0);
        
        return {
          income: income / 1000000, // Convert to millions
          expense: expense / 1000000,
          education: p.education_level || 'Unknown',
          province: p.province || 'Unknown'
        };
      })
      .filter(d => d.income > 0 && d.expense > 0);
    
    console.log(`📊 Income vs Expense: ${data.length} valid data points`);
    return data;
  }, [profileData]);

  // Education colors
  const educationColors: Record<string, string> = {
    'Elementary School': '#ef4444',
    'Junior High School': '#f59e0b',
    'Senior High School': '#3b82f6',
    'Diploma I/II/III': '#8b5cf6',
    'Bachelor (S1)/Diploma IV': '#10b981',
    'Postgraduate': '#ec4899',
    'Unknown': '#6b7280'
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold mb-1">{data.education}</p>
          <p className="text-blue-400 text-sm">Income: Rp {data.income.toFixed(2)}M</p>
          <p className="text-green-400 text-sm">Expense: Rp {data.expense.toFixed(2)}M</p>
          <p className="text-gray-400 text-xs mt-1">{data.province}</p>
        </div>
      );
    }
    return null;
  };

  // Calculate average for reference lines
  const avgIncome = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, d) => acc + d.income, 0);
    return sum / chartData.length;
  }, [chartData]);

  const avgExpense = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, d) => acc + d.expense, 0);
    return sum / chartData.length;
  }, [chartData]);

  // Group by education (only show education levels that exist in filtered data)
  const groupedData = useMemo(() => {
    const groups: Record<string, typeof chartData> = {};
    chartData.forEach(d => {
      if (!groups[d.education]) groups[d.education] = [];
      groups[d.education].push(d);
    });
    return groups;
  }, [chartData]);

  return (
    <div className="glass-panel p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          Income vs Expenditure Pattern
        </h3>
        <p className="text-sm text-gray-400">
          GenZ spending behavior across different income levels
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[400px] flex items-center justify-center text-gray-500">
          No data available for the selected filters
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number" 
                dataKey="income" 
                name="Monthly Income"
                stroke="#9ca3af"
                domain={[0, 'auto']}
                label={{ 
                  value: 'Monthly Income (Million Rp)', 
                  position: 'bottom',
                  offset: 40,
                  style: { fill: '#9ca3af' }
                }}
              />
              <YAxis 
                type="number" 
                dataKey="expense" 
                name="Monthly Expenditure"
                stroke="#9ca3af"
                domain={[0, 'auto']}
                label={{ 
                  value: 'Monthly Expenditure (Million Rp)', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -40,
                  style: { fill: '#9ca3af' }
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              
              {/* Reference lines for averages */}
              {avgIncome > 0 && (
                <ReferenceLine 
                  x={avgIncome} 
                  stroke="#3b82f6" 
                  strokeDasharray="5 5" 
                  opacity={0.5}
                  label={{ value: 'Avg Income', position: 'top', fill: '#3b82f6', fontSize: 12 }}
                />
              )}
              {avgExpense > 0 && (
                <ReferenceLine 
                  y={avgExpense} 
                  stroke="#10b981" 
                  strokeDasharray="5 5" 
                  opacity={0.5}
                  label={{ value: 'Avg Expense', position: 'right', fill: '#10b981', fontSize: 12 }}
                />
              )}

              {/* Scatter by education level - only for existing groups */}
              {Object.entries(groupedData).map(([education, data]) => (
                <Scatter
                  key={education}
                  name={education}
                  data={data}
                  fill={educationColors[education] || '#6b7280'}
                  fillOpacity={0.7}
                  shape="circle"
                />
              ))}
              
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>

          {/* Stats Summary */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300 mb-1">Avg Income</p>
              <p className="text-xl font-bold text-blue-400">
                Rp {avgIncome.toFixed(1)}M
              </p>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-300 mb-1">Avg Expense</p>
              <p className="text-xl font-bold text-green-400">
                Rp {avgExpense.toFixed(1)}M
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-xs text-purple-300 mb-1">Sample Size</p>
              <p className="text-xl font-bold text-purple-400">
                {chartData.length}
              </p>
            </div>
          </div>

          {/* Insight Box */}
          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              💡 <strong>Insight:</strong> Low-income respondents often have high expenditure relative to income, 
              while high-income groups show more moderate spending patterns.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default IncomeVsExpenditure;
