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
import '../../../styles/components/behaviorwellbeing/savings-rate-analysis.css';

interface SavingsRateAnalysisProps {
  profileData: FinancialProfileData[];
}

const SavingsRateAnalysis: FC<SavingsRateAnalysisProps> = ({ profileData }) => {
  const parseAmount = (value: any): number => {
    if (!value) return 0;
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
      'Defisit': 0,
      'Rendah (0-10%)': 0,
      'Sedang (10-30%)': 0,
      'Tinggi (>30%)': 0
    };
    profileData.forEach(p => {
      const income = parseAmount(p.avg_monthly_income);
      const expense = parseAmount(p.avg_monthly_expense);
      if (income === 0) return;
      const savingsRate = ((income - expense) / income) * 100;
      if (savingsRate < 0) categories['Defisit']++;
      else if (savingsRate <= 10) categories['Rendah (0-10%)']++;
      else if (savingsRate <= 30) categories['Sedang (10-30%)']++;
      else categories['Tinggi (>30%)']++;
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
        <div className="savings-rate-tooltip">
          <p className="savings-rate-tooltip__title">{data.name}</p>
          <p className="savings-rate-tooltip__count">Jumlah: {data.value}</p>
          <p className="savings-rate-tooltip__percentage">{data.payload.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = (entry: any) => {
    return `${entry.percentage.toFixed(0)}%`;
  };

  const healthySavers = savingsDistribution.slice(-2).reduce((sum, d) => sum + d.value, 0);
  const atRisk = savingsDistribution[0].value;

  return (
    <div className="savings-rate-analysis">
      <div className="savings-rate-analysis__header">
        <h3 className="savings-rate-analysis__title">
          Distribusi Tingkat Tabungan
        </h3>
        <p className="savings-rate-analysis__subtitle">
          Analisis bantalan keuangan: (Pendapatan - Pengeluaran) / Pendapatan
        </p>
      </div>

      {profileData.length === 0 ? (
        <div className="savings-rate-analysis__empty">
          Tidak ada data
        </div>
      ) : (
        <>
          <div className="savings-rate-analysis__chart">
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
          </div>

          <div className="savings-rate-analysis__stats">
            <div className="savings-stat savings-stat--healthy">
              <p className="savings-stat__label">Penabung Sehat</p>
              <p className="savings-stat__value">{healthySavers}</p>
              <p className="savings-stat__meta">{((healthySavers / profileData.length) * 100).toFixed(1)}%</p>
            </div>
            <div className="savings-stat savings-stat--risk">
              <p className="savings-stat__label">Defisit (Berisiko)</p>
              <p className="savings-stat__value">{atRisk}</p>
              <p className="savings-stat__meta">{((atRisk / profileData.length) * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div className="savings-rate-analysis__insight">
            <p className="savings-rate-analysis__insight-text">
              💰 Data menunjukkan bahwa <strong>{((atRisk / profileData.length) * 100).toFixed(0)}%</strong> responden memiliki pengeluaran yang lebih besar dari pendapatan (kategori defisit).
              Sementara itu, <strong>{((healthySavers / profileData.length) * 100).toFixed(0)}%</strong> responden menabung lebih dari 10% dari pendapatannya.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default SavingsRateAnalysis;
