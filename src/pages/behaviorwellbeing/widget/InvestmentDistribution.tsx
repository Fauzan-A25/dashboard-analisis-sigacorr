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
import '../../../styles/components/behaviorwellbeing/investment-distribution.css';

interface InvestmentDistributionProps {
  profileData: FinancialProfileData[];
}

const InvestmentDistribution: FC<InvestmentDistributionProps> = ({ profileData }) => {
  const investmentData = useMemo(() => {
    const types: Record<string, number> = {};

    profileData.forEach(p => {
      const type = p.investment_type || 'Tidak Berinvestasi';
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
    'Tidak Berinvestasi': '#6b7280',
    'Tidak Diketahui': '#9ca3af'
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="investment-tooltip">
          <p className="investment-tooltip__title">{data.type}</p>
          <p className="investment-tooltip__count">Jumlah: {data.count}</p>
          <p className="investment-tooltip__percentage">Persentase: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const investors = investmentData.filter(d => d.type !== 'Tidak Berinvestasi').reduce((sum, d) => sum + d.count, 0);
  const nonInvestors = investmentData.find(d => d.type === 'Tidak Berinvestasi')?.count || 0;

  return (
    <div className="investment-distribution">
      <div className="investment-distribution__header">
        <h3 className="investment-distribution__title">
          Distribusi Jenis Investasi
        </h3>
        <p className="investment-distribution__subtitle">
          Preferensi dan adopsi investasi GenZ
        </p>
      </div>

      {profileData.length === 0 ? (
        <div className="investment-distribution__empty">
          Tidak ada data
        </div>
      ) : (
        <>
          <div className="investment-distribution__chart">
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
                  label={{ value: 'Jumlah', position: 'insideBottom', offset: -10, style: { fill: '#9ca3af' } }}
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
          </div>

          {/* Statistik */}
          <div className="investment-distribution__stats">
            <div className="investment-stat investment-stat--active">
              <p className="investment-stat__label">Investor Aktif</p>
              <p className="investment-stat__value">{investors}</p>
              <p className="investment-stat__meta">{((investors / profileData.length) * 100).toFixed(1)}%</p>
            </div>
            <div className="investment-stat investment-stat--none">
              <p className="investment-stat__label">Tidak Berinvestasi</p>
              <p className="investment-stat__value">{nonInvestors}</p>
              <p className="investment-stat__meta">{((nonInvestors / profileData.length) * 100).toFixed(1)}%</p>
            </div>
            <div className="investment-stat investment-stat--popular">
              <p className="investment-stat__label">Paling Populer</p>
              <p className="investment-stat__type">{investmentData[0]?.type}</p>
              <p className="investment-stat__meta">{investmentData[0]?.percentage.toFixed(1)}%</p>
            </div>
          </div>

          {/* Insight deskriptif, umum */}
          <div className="investment-distribution__insight">
            <p className="investment-distribution__insight-text">
              📈 Data menunjukkan bahwa <strong>{investmentData[0]?.type}</strong> merupakan jenis investasi paling populer di kalangan responden GenZ dengan pangsa sekitar {investmentData[0]?.percentage.toFixed(1)}%. 
              Ini mencerminkan variasi preferensi investasi di antara kelompok tersebut.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default InvestmentDistribution;
