import { type FC, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import type { FinancialProfileData } from '../../../services/dataTypes';
import '../../../styles/components/behaviorwellbeing/ewallet-spending.css';

interface EWalletSpendingProps {
  profileData: FinancialProfileData[];
}

const EWalletSpending: FC<EWalletSpendingProps> = ({ profileData }) => {
  const formatLabel = (label: string): string => {
    if (label.includes('< Rp500')) return '< 500rb';
    if (label.includes('500.001') && label.includes('1.000.000')) return '500 rb - 1 Jt';
    if (label.includes('1.000.001') && label.includes('3.000.000')) return '1 Jt - 3 Jt';
    if (label.includes('> Rp3.000.000')) return '> 3 Jt';
    return label;
  };

  const spendingDistribution = useMemo(() => {
    const categories: Record<string, number> = {};

    profileData.forEach(p => {
      const spending = p.ewallet_spending || 'Tidak diketahui';
      categories[spending] = (categories[spending] || 0) + 1;
    });

    const order = [
      '< Rp500.000',
      'Rp500.001 - Rp1.000.000',
      'Rp1.000.001 - Rp3.000.000',
      '> Rp3.000.000',
      'Tidak diketahui'
    ];

    // Sort by value descending for proper reporting
    return order
      .filter(cat => categories[cat])
      .map(category => ({
        name: formatLabel(category),
        raw: category,
        fullName: category,
        value: categories[category],
        percentage: (categories[category] / profileData.length) * 100
      }))
      .sort((a, b) => b.value - a.value);
  }, [profileData]);

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];

  // Dapatkan data untuk pengguna tinggi (> 1 Jt)
  const highSpenders = useMemo(() => {
    return spendingDistribution.filter(
      d => d.raw === 'Rp1.000.001 - Rp3.000.000' || d.raw === '> Rp3.000.000'
    );
  }, [spendingDistribution]);

  // Fallback: paling rendah selain "Tidak diketahui"
  const smallestGroup = useMemo(() => {
    return spendingDistribution
      .filter(d => d.raw !== 'Tidak diketahui')
      .reduce((min, d) => d.value < min.value ? d : min, spendingDistribution[0]);
  }, [spendingDistribution]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="ewallet-tooltip">
          <p className="ewallet-tooltip__title">{data.payload.fullName}</p>
          <p className="ewallet-tooltip__count">Jumlah: {data.value}</p>
          <p className="ewallet-tooltip__percentage">Persentase: {data.payload.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (entry: any) => {
    return `${entry.percentage.toFixed(0)}%`;
  };

  return (
    <div className="ewallet-spending">
      <div className="ewallet-spending__header">
        <h3 className="ewallet-spending__title">Distribusi Pengeluaran E-Wallet</h3>
        <p className="ewallet-spending__subtitle">
          Kebiasaan pembayaran digital bulanan GenZ
        </p>
      </div>

      {profileData.length === 0 ? (
        <div className="ewallet-spending__empty">
          Tidak ada data
        </div>
      ) : (
        <>
          <div className="ewallet-spending__chart">
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
          </div>

          {/* Ringkasan Statistik */}
          <div className="ewallet-spending__stats">
            {/* Statistik: Paling Umum */}
            <div className="ewallet-stat ewallet-stat--common">
              <p className="ewallet-stat__label">Paling Umum</p>
              <p className="ewallet-stat__category">{spendingDistribution[0]?.name}</p>
              <p className="ewallet-stat__value">
                {spendingDistribution[0]?.percentage.toFixed(1)}%
              </p>
            </div>
            {/* Statistik: Pengguna Tinggi atau fallback terkecil */}
            <div className="ewallet-stat ewallet-stat--high">
              <p className="ewallet-stat__label">
                {highSpenders.length > 0
                  ? 'Pengguna Tinggi (>1 Jt)'
                  : 'Paling Rendah'}
              </p>
              <p className="ewallet-stat__category">
                {highSpenders.length > 0
                  ? highSpenders.map(d => d.name).join(', ')
                  : smallestGroup?.name || '-'}
              </p>
              <p className="ewallet-stat__value">
                {highSpenders.length > 0
                  ? highSpenders.reduce((sum, d) => sum + d.percentage, 0).toFixed(1)
                  : smallestGroup?.percentage?.toFixed(1) || '0.0'
                }%
              </p>
            </div>
          </div>

          {/* Insight (Deskriptif, netral) */}
          <div className="ewallet-spending__insight">
            <p className="ewallet-spending__insight-text">
              💳 Data menunjukkan bahwa {spendingDistribution[0]?.percentage > 40 ? 'mayoritas' : 'sebagian besar'} GenZ menghabiskan sekitar {spendingDistribution[0]?.name} setiap bulan melalui e-wallet, 
              mengindikasikan pola penggunaan pembayaran digital yang signifikan dalam kelompok ini.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default EWalletSpending;
