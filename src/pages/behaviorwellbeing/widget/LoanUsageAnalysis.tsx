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
  // Filter hanya yang punya pinjaman (bukan 'Tidak Ada')
  const onlyWithLoans = useMemo(
    () => profileData.filter(p => (p.loan_usage_purpose || '').toLowerCase() !== 'tidak ada'),
    [profileData]
  );

  const loanData = useMemo(() => {
    const purposes: Record<string, { count: number; totalDebt: number }> = {};
    onlyWithLoans.forEach(p => {
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
        avgDebt: data.totalDebt / data.count / 1000000, // juta
        percentage: (data.count / onlyWithLoans.length) * 100
      }))
      .sort((a, b) => b.count - a.count);
  }, [onlyWithLoans]);

  const colors: Record<string, string> = {
    'Konsumsi': '#ef4444',
    'Pendidikan': '#3b82f6',
    'Usaha': '#10b981',
    'Gaya': '#f59e0b',
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

  const totalWithLoans = onlyWithLoans.length;

  // Mendapatkan rata-rata hutang keseluruhan (hanya untuk yang punya pinjaman)
  const avgDebtAll = useMemo(() => {
    if (totalWithLoans === 0) return 0;
    return (
      loanData.reduce((sum, d) => sum + (d.avgDebt * d.count), 0) / totalWithLoans
    );
  }, [loanData, totalWithLoans]);

  return (
    <div className="loan-usage-analysis">
      <div className="loan-usage-analysis__header">
        <h3 className="loan-usage-analysis__title">
          Rincian Penggunaan Pinjaman
        </h3>
        <p className="loan-usage-analysis__subtitle">
          Tujuan pinjaman dan rata-rata hutang per kategori (hanya responden dengan pinjaman)
        </p>
      </div>

      {totalWithLoans === 0 ? (
        <div className="loan-usage-analysis__empty">
          Tidak ada data peminjam
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

          {/* Statistik jumlah peminjam dan rata-rata hutang */}
          <div className="loan-usage-analysis__stats">
            <div className="loan-stat loan-stat--with">
              <p className="loan-stat__label">Total Peminjam</p>
              <p className="loan-stat__value">{totalWithLoans}</p>
              <p className="loan-stat__meta">100%</p>
            </div>
            <div className="loan-stat loan-stat--avg">
              <p className="loan-stat__label">Rata-rata Hutang</p>
              <p className="loan-stat__value loan-stat__value--small">
                Rp {avgDebtAll.toFixed(1)}Jt
              </p>
            </div>
            <div className="loan-stat loan-stat--popular">
              <p className="loan-stat__label">Tujuan Terbanyak</p>
              <p className="loan-stat__value">{loanData[0]?.purpose}</p>
              <p className="loan-stat__meta">{loanData[0]?.percentage.toFixed(1)}%</p>
            </div>
          </div>

          {/* Insight deskriptif, netral */}
          <div className="loan-usage-analysis__insight">
            <p className="loan-usage-analysis__insight-text">
              💰 Data menunjukkan bahwa <strong>{loanData[0]?.purpose}</strong> merupakan tujuan pinjaman paling banyak diambil oleh responden dengan pinjaman, sekitar {loanData[0]?.percentage.toFixed(1)}%. 
              Rata-rata hutang di kategori ini yaitu sekitar Rp {loanData[0]?.avgDebt.toFixed(1)} juta per peminjam.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default LoanUsageAnalysis;
