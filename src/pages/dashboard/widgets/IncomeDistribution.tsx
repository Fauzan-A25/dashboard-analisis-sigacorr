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
import type { FinancialProfileData } from '../../../services/dataTypes';
import '../../../styles/components/behaviorwellbeing/income-vs-expenditure.css';

interface IncomeVsExpenditureProps {
  profileData: FinancialProfileData[];
}

const IncomeVsExpenditure: FC<IncomeVsExpenditureProps> = ({ profileData }) => {

  const parseIncomeRange = (str: string | number | undefined): number => {
    if (typeof str === 'number') return str;
    if (!str) return 0;

    const strVal = String(str).trim();
    if (!strVal) return 0;

    if (strVal.includes('<')) {
      const match = strVal.match(/\d[\d.]+/);
      return match ? parseInt(match[0].replace(/\./g, '')) / 2 : 0;
    }

    if (strVal.includes('>')) {
      const match = strVal.match(/\d[\d.]+/);
      return match ? parseInt(match[0].replace(/\./g, '')) * 1.2 : 20000000;
    }

    const matches = strVal.match(/\d[\d.]+/g);
    if (!matches) return 0;

    if (matches.length >= 2) {
      const low = parseInt(matches[0].replace(/\./g, ''));
      const high = parseInt(matches[1].replace(/\./g, ''));
      return (low + high) / 2;
    }

    return parseInt(matches[0].replace(/\./g, ''));
  };

  const chartData = useMemo(() => {
    const data = profileData
      .filter(p => p.avg_monthly_income && p.avg_monthly_expense)
      .map(p => {
        const income = parseIncomeRange(p.avg_monthly_income);
        const expense = parseIncomeRange(p.avg_monthly_expense);

        return {
          income: income / 1000000, // dalam jutaan
          expense: expense / 1000000,
          education: p.education_level || 'Tidak diketahui',
          province: p.province || 'Tidak diketahui',
          gender: p.gender || 'Tidak diketahui',
          employmentStatus: p.employment_status || 'Tidak diketahui'
        };
      })
      .filter(d => d.income > 0 && d.expense > 0);

    console.log(`📊 Pendapatan vs Pengeluaran: ${data.length} data valid`);
    return data;
  }, [profileData]);

  const educationColors: Record<string, string> = {
    'Elementary School': '#ef4444',
    'Junior High School': '#f59e0b',
    'Senior High School': '#3b82f6',
    'Diploma I/II/III': '#8b5cf6',
    'Bachelor (S1)/Diploma IV': '#10b981',
    'Postgraduate': '#ec4899',
    'Tidak diketahui': '#6b7280'
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="income-expense-tooltip">
          <p className="income-expense-tooltip__title">{data.education}</p>
          <p className="income-expense-tooltip__income">Pendapatan: Rp {data.income.toFixed(2)}Jt</p>
          <p className="income-expense-tooltip__expense">Pengeluaran: Rp {data.expense.toFixed(2)}Jt</p>
          <p className="income-expense-tooltip__location">{data.province}</p>
          <p className="income-expense-tooltip__meta">{data.gender} • {data.employmentStatus}</p>
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
    <div className="income-vs-expenditure">
      <div className="income-vs-expenditure__header">
        <h3 className="income-vs-expenditure__title">Pola Pendapatan vs Pengeluaran</h3>
        <p className="income-vs-expenditure__subtitle">Perilaku pengeluaran GenZ berdasarkan tingkat pendapatan</p>
      </div>

      {chartData.length === 0 ? (
        <div className="income-vs-expenditure__empty">
          Data tidak tersedia untuk filter yang dipilih
        </div>
      ) : (
        <>
          <div className="income-vs-expenditure__chart">
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  type="number"
                  dataKey="income"
                  name="Pendapatan Bulanan"
                  stroke="#9ca3af"
                  domain={[0, 'auto']}
                  label={{ value: 'Pendapatan Bulanan (Juta Rp)', position: 'bottom', offset: 40, style: { fill: '#9ca3af' } }}
                />
                <YAxis
                  type="number"
                  dataKey="expense"
                  name="Pengeluaran Bulanan"
                  stroke="#9ca3af"
                  domain={[0, 'auto']}
                  label={{ value: 'Pengeluaran Bulanan (Juta Rp)', angle: -90, position: 'insideLeft', offset: -40, style: { fill: '#9ca3af' } }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

                {avgIncome > 0 && (
                  <ReferenceLine x={avgIncome} stroke="#3b82f6" strokeDasharray="5 5" opacity={0.5} label={{ value: 'Rata-rata Pendapatan', position: 'top', fill: '#3b82f6', fontSize: 12 }} />
                )}
                {avgExpense > 0 && (
                  <ReferenceLine y={avgExpense} stroke="#10b981" strokeDasharray="5 5" opacity={0.5} label={{ value: 'Rata-rata Pengeluaran', position: 'right', fill: '#10b981', fontSize: 12 }} />
                )}

                {Object.entries(groupedData).map(([education, data]) => (
                  <Scatter key={education} name={education} data={data} fill={educationColors[education] || '#6b7280'} fillOpacity={0.7} shape="circle" />
                ))}

                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="income-vs-expenditure__stats">
            <div className="income-stat income-stat--income">
              <p className="income-stat__label">Rata-rata Pendapatan</p>
              <p className="income-stat__value">Rp {avgIncome.toFixed(1)}Jt</p>
            </div>
            <div className="income-stat income-stat--expense">
              <p className="income-stat__label">Rata-rata Pengeluaran</p>
              <p className="income-stat__value">Rp {avgExpense.toFixed(1)}Jt</p>
            </div>
            <div className="income-stat income-stat--sample">
              <p className="income-stat__label">Ukuran Sampel</p>
              <p className="income-stat__value">{chartData.length}</p>
            </div>
          </div>

          <div className="income-vs-expenditure__insight">
            <p className="income-vs-expenditure__insight-text">
              💡 <strong>Insight:</strong> Responden berpendapatan rendah sering memiliki pengeluaran yang tinggi dibandingkan pendapatan,
              sedangkan kelompok berpendapatan tinggi menunjukkan pola pengeluaran yang lebih moderat.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default IncomeVsExpenditure;
