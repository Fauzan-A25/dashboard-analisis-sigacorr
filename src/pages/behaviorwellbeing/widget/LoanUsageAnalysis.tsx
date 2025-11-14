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
import type { FinancialProfileData } from '../../../services/dataTypes';
import '../../../styles/components/behaviorwellbeing/loan-usage-analysis.css';

interface LoanUsageAnalysisProps {
  profileData: FinancialProfileData[];
}

const LoanUsageAnalysis: FC<LoanUsageAnalysisProps> = ({ profileData }) => {
  
  const loanData = useMemo(() => {
    const purposes: Record<string, { count: number; totalDebt: number }> = {};
    
    profileData.forEach(p => {
      const purpose = p.loan_usage_purpose || 'Tidak diketahui';
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
        avgDebt: data.totalDebt / data.count / 1000000,
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
    'Tidak diketahui': '#9ca3af'
  };


  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="loan-usage-tooltip">
          <p className="loan-usage-tooltip__title">{data.purpose}</p>
          <p className="loan-usage-tooltip__count">Jumlah: {data.count} ({data.percentage.toFixed(1)}%)</p>
          <p className="loan-usage-tooltip__debt">Rata-rata Hutang: Rp {data.avgDebt.toFixed(1)}Jt</p>
        </div>
      );
    }
    return null;
  };


  const withLoans = loanData.filter(d => d.purpose !== 'Tidak Ada').reduce((sum, d) => sum + d.count, 0);
  const withoutLoans = loanData.find(d => d.purpose === 'Tidak Ada')?.count || 0;


  return (
    <div className="loan-usage-analysis">
      <div className="loan-usage-analysis__header">
        <h3 className="loan-usage-analysis__title">
          Rincian Penggunaan Pinjaman
        </h3>
        <p className="loan-usage-analysis__subtitle">
          Tujuan pinjaman dan rata-rata hutang per kategori
        </p>
      </div>


      {profileData.length === 0 ? (
        <div className="loan-usage-analysis__empty">
          Tidak ada data
        </div>
      ) : (
        <>
          <div className="loan-usage-analysis__chart">
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
                  label={{ value: 'Jumlah', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {loanData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[entry.purpose] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>


          {/* Statistik */}
          <div className="loan-usage-analysis__stats">
            <div className="loan-stat loan-stat--with">
              <p className="loan-stat__label">Dengan Pinjaman</p>
              <p className="loan-stat__value">{withLoans}</p>
              <p className="loan-stat__meta">{((withLoans / profileData.length) * 100).toFixed(1)}%</p>
            </div>
            <div className="loan-stat loan-stat--without">
              <p className="loan-stat__label">Tanpa Pinjaman</p>
              <p className="loan-stat__value">{withoutLoans}</p>
              <p className="loan-stat__meta">{((withoutLoans / profileData.length) * 100).toFixed(1)}%</p>
            </div>
            <div className="loan-stat loan-stat--avg">
              <p className="loan-stat__label">Rata-rata Hutang</p>
              <p className="loan-stat__value loan-stat__value--small">
                Rp {(loanData.reduce((sum, d) => sum + (d.avgDebt * d.count), 0) / withLoans).toFixed(1)}Jt
              </p>
            </div>
          </div>


          {/* Insight */}
          <div className="loan-usage-analysis__insight">
            <p className="loan-usage-analysis__insight-text">
              💰 <strong>Pola Hutang:</strong> {loanData[0]?.purpose} adalah tujuan pinjaman teratas 
              ({loanData[0]?.percentage.toFixed(0)}%), dengan rata-rata hutang Rp {loanData[0]?.avgDebt.toFixed(1)}Jt per orang.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default LoanUsageAnalysis;
