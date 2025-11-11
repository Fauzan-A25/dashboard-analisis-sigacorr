import { type FC, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import type { FinancialProfileData } from '../../services/dataTypes';

interface IncomeVsExpenditureProps {
  profileData: FinancialProfileData[];
}

const IncomeVsExpenditure: FC<IncomeVsExpenditureProps> = ({ profileData }) => {
  
  const parseRangeToMillion = (str: any): number => {
    if (!str || typeof str !== 'string') return 0;
    
    const cleaned = str.replace(/Rp/g, '').replace(/\s/g, '');
    
    if (cleaned.includes('<')) return 1;
    if (cleaned.includes('>')) return 17.5;
    
    const numbers = cleaned.match(/[\d.]+/g);
    if (!numbers || numbers.length === 0) return 0;
    
    const values = numbers.map(n => {
      const num = parseFloat(n.replace(/\./g, ''));
      return num / 1000000;
    });
    
    if (values.length >= 2) {
      return (values[0] + values[1]) / 2;
    }
    
    return values[0];
  };

  const chartData = useMemo(() => {
    const data = profileData
      .map(p => {
        const income = parseRangeToMillion(p.avg_monthly_income);
        const expense = parseRangeToMillion(p.avg_monthly_expense);
        
        return {
          income,
          expense,
          education: p.education_level || 'Unknown',
          province: p.province || 'Unknown',
          incomeRaw: p.avg_monthly_income,
          expenseRaw: p.avg_monthly_expense
        };
      })
      .filter(d => d.income > 0 && d.expense > 0);
    
    console.log(`📊 Income vs Expense: ${data.length} valid data points`);
    return data;
  }, [profileData]);

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
          <p className="text-white font-semibold mb-2">{data.education}</p>
          <p className="text-blue-400 text-sm">Income: {data.incomeRaw}</p>
          <p className="text-green-400 text-sm">Expense: {data.expenseRaw}</p>
          <p className="text-gray-400 text-xs mt-2 pt-2 border-t border-gray-700">{data.province}</p>
        </div>
      );
    }
    return null;
  };

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
          <ResponsiveContainer width="100%" height={380}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number" 
                dataKey="income" 
                name="Monthly Income"
                stroke="#9ca3af"
                domain={[0, 20]}
                ticks={[0, 5, 10, 15, 20]}
                label={{ 
                  value: 'Monthly Income (Million Rp)', 
                  position: 'insideBottom',
                  offset: -5,
                  style: { fill: '#9ca3af', fontSize: 12 }
                }}
              />
              <YAxis 
                type="number" 
                dataKey="expense" 
                name="Monthly Expenditure"
                stroke="#9ca3af"
                domain={[0, 20]}
                ticks={[0, 5, 10, 15, 20]}
                label={{ 
                  value: 'Monthly Expenditure (Million Rp)', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -50,
                  style: { fill: '#9ca3af', fontSize: 12 }
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              
              {/* Reference lines */}
              {avgIncome > 0 && (
                <ReferenceLine 
                  x={avgIncome} 
                  stroke="#3b82f6" 
                  strokeDasharray="5 5" 
                  opacity={0.5}
                  label={{ 
                    value: `Avg ${avgIncome.toFixed(1)}M`, 
                    position: 'top', 
                    fill: '#3b82f6', 
                    fontSize: 11 
                  }}
                />
              )}
              {avgExpense > 0 && (
                <ReferenceLine 
                  y={avgExpense} 
                  stroke="#10b981" 
                  strokeDasharray="5 5" 
                  opacity={0.5}
                  label={{ 
                    value: `Avg ${avgExpense.toFixed(1)}M`, 
                    position: 'right', 
                    fill: '#10b981', 
                    fontSize: 11 
                  }}
                />
              )}

              {/* Scatter by education level - NO LEGEND HERE */}
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
            </ScatterChart>
          </ResponsiveContainer>

          {/* Custom Legend Below Chart */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center border-t border-gray-700/50 pt-4">
            {Object.entries(groupedData)
              .sort((a, b) => b[1].length - a[1].length) // Sort by count descending
              .map(([education, data]) => (
                <div key={education} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: educationColors[education] || '#6b7280' }}
                  />
                  <span className="text-xs text-gray-300">
                    {education} <span className="text-gray-500">({data.length})</span>
                  </span>
                </div>
              ))}
          </div>

          {/* Stats Summary */}
          <div className="mt-6 grid grid-cols-3 gap-3">
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
