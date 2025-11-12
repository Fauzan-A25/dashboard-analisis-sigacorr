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

interface LoanUsageAnalysisProps {
  profileData: FinancialProfileData[];
}

const LoanUsageAnalysis: FC<LoanUsageAnalysisProps> = ({ profileData }) => {
  
  const loanData = useMemo(() => {
    const purposes: Record<string, { count: number; totalDebt: number }> = {};
    
    profileData.forEach(p => {
      const purpose = p.loan_usage_purpose || 'Unknown';
      const debt = p.outstanding_loan || 0;
      
      if (!purposes[purpose]) {
        purposes[purpose] = { count: 0, totalDebt: 0 };
      }
      purposes[purpose].count++;
      purposes[purpose].totalDebt += debt;
    });
    
    return Object.entries(purposes)
      .map(([purpose, data]) => ({
        purpose,
        count: data.count,
        avgDebt: data.totalDebt / data.count / 1000000, // Convert to millions
        percentage: (data.count / profileData.length) * 100
      }))
      .sort((a, b) => b.count - a.count);
  }, [profileData]);

  const colors: Record<string, string> = {
    'Konsumsi': '#ef4444',
    'Pendidikan': '#3b82f6',
    'Usaha': '#10b981',
    'Gaya': '#f59e0b',
    'Tidak Ada': '#6b7280',
    'Unknown': '#9ca3af'
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold mb-2">{data.purpose}</p>
          <p className="text-blue-400 text-sm">Count: {data.count} ({data.percentage.toFixed(1)}%)</p>
          <p className="text-green-400 text-sm">Avg Debt: Rp {data.avgDebt.toFixed(1)}M</p>
        </div>
      );
    }
    return null;
  };

  const withLoans = loanData.filter(d => d.purpose !== 'Tidak Ada').reduce((sum, d) => sum + d.count, 0);
  const withoutLoans = loanData.find(d => d.purpose === 'Tidak Ada')?.count || 0;

  return (
    <div className="glass-panel p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          Loan Usage Breakdown
        </h3>
        <p className="text-sm text-gray-400">
          Purpose of borrowing and average debt by category
        </p>
      </div>

      {profileData.length === 0 ? (
        <div className="h-[350px] flex items-center justify-center text-gray-500">
          No data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={loanData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="purpose" 
                stroke="#9ca3af"
                angle={-25}
                textAnchor="end"
                height={80}
                interval={0}
                style={{ fontSize: '11px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {loanData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[entry.purpose] || '#6b7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs text-red-300 mb-1">With Loans</p>
              <p className="text-2xl font-bold text-red-400">{withLoans}</p>
              <p className="text-xs text-gray-400">{((withLoans / profileData.length) * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-300 mb-1">No Loans</p>
              <p className="text-2xl font-bold text-green-400">{withoutLoans}</p>
              <p className="text-xs text-gray-400">{((withoutLoans / profileData.length) * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300 mb-1">Avg Debt</p>
              <p className="text-lg font-bold text-blue-400">
                Rp {(loanData.reduce((sum, d) => sum + (d.avgDebt * d.count), 0) / withLoans).toFixed(1)}M
              </p>
            </div>
          </div>

          {/* Insight */}
          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-300">
              💰 <strong>Debt Pattern:</strong> {loanData[0]?.purpose} is the top loan purpose 
              ({loanData[0]?.percentage.toFixed(0)}%), with average debt of Rp {loanData[0]?.avgDebt.toFixed(1)}M per person.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default LoanUsageAnalysis;
