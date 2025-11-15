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
      if (match) {
        const num = parseInt(match[0].replace(/\./g, ''));
        return num / 2;
      }
      return 0;
    }

    if (strVal.includes('>')) {
      const match = strVal.match(/\d[\d.]+/);
      if (match) {
        const num = parseInt(match[0].replace(/\./g, ''));
        return num * 1.2;
      }
      return 20000000;
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
    if (!profileData || profileData.length === 0) {
      console.warn('⚠️ Tidak ada data profil untuk IncomeVsExpenditure');
      return [];
    }

    const data = profileData
      .filter(p => {
        const hasIncome = p.avg_monthly_income && String(p.avg_monthly_income).trim() !== '';
        const hasExpense = p.avg_monthly_expense && String(p.avg_monthly_expense).trim() !== '';
        return hasIncome && hasExpense;
      })
      .map(p => {
        const income = parseIncomeRange(p.avg_monthly_income);
        const expense = parseIncomeRange(p.avg_monthly_expense);

        return {
          income: income / 1000000, // dalam juta
          expense: expense / 1000000,
          education: p.education_level || 'Tidak diketahui',
          province: p.province || 'Tidak diketahui',
          gender: p.gender || 'Tidak diketahui',
          employmentStatus: p.employment_status || 'Tidak diketahui'
        };
      })
      .filter(d => d.income > 0 && d.expense > 0);

    console.log(`📊 Income vs Expense: ${data.length} data valid`);
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
          <p className="income-expense-tooltip__item">
            <span className="income-expense-tooltip__label">Pendapatan:</span> Rp {data.income.toFixed(2)}Jt
          </p>
          <p className="income-expense-tooltip__item">
            <span className="income-expense-tooltip__label">Pengeluaran:</span> Rp {data.expense.toFixed(2)}Jt
          </p>
          <p className="income-expense-tooltip__location">
            {data.province} • {data.gender} • {data.employmentStatus}
          </p>
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
        <h2 className="income-vs-expenditure__title">
          Pola Pendapatan vs Pengeluaran
        </h2>
        <p className="income-vs-expenditure__subtitle">
          Perilaku pengeluaran GenZ berdasarkan tingkat pendapatan
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="income-vs-expenditure__empty">
          <p>Data tidak tersedia untuk filter yang dipilih</p>
        </div>
      ) : (
        <>
          <div className="income-vs-expenditure__chart">
            <ResponsiveContainer width="100%" height={500}>
              <ScatterChart margin={{ top: 20, right: 30, bottom: 80, left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-color)" opacity={0.2} />
                <XAxis
                  type="number"
                  dataKey="income"
                  name="Pendapatan Bulanan"
                  stroke="var(--text-tertiary)"
                  domain={[0, 'auto']}
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 13 }}
                  label={{
                    value: 'Pendapatan Bulanan (Juta)',
                    position: 'insideBottom',
                    offset: -60,
                    style: {
                      fill: 'var(--text-secondary)',
                      fontSize: 14,
                      fontWeight: 500
                    }
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="expense"
                  name="Pengeluaran Bulanan"
                  stroke="var(--text-tertiary)"
                  domain={[0, 'auto']}
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 13 }}
                  label={{
                    value: 'Pengeluaran Bulanan (Juta)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: -60,
                    style: {
                      fill: 'var(--text-secondary)',
                      fontSize: 14,
                      fontWeight: 500
                    }
                  }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

                {avgIncome > 0 && (
                  <ReferenceLine
                    x={avgIncome}
                    stroke="#3b82f6"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    opacity={0.6}
                    label={{
                      value: `Rata-rata: ${avgIncome.toFixed(1)}Jt`,
                      position: 'top',
                      fill: '#3b82f6',
                      fontSize: 12,
                      fontWeight: 600,
                      offset: 10
                    }}
                  />
                )}

                {avgExpense > 0 && (
                  <ReferenceLine
                    y={avgExpense}
                    stroke="#10b981"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    opacity={0.6}
                    label={{
                      value: `Rata-rata: ${avgExpense.toFixed(1)}Jt`,
                      position: 'insideTopRight',
                      fill: '#10b981',
                      fontSize: 12,
                      fontWeight: 600,
                      offset: 10
                    }}
                  />
                )}

                {Object.entries(groupedData).map(([education, data]) => (
                  <Scatter
                    key={education}
                    name={education}
                    data={data}
                    fill={educationColors[education] || '#6b7280'}
                    fillOpacity={0.75}
                    shape="circle"
                  />
                ))}

                <Legend
                  wrapperStyle={{
                    position: 'absolute',
                    bottom: 2,
                    left: 0,
                    right: 0,
                    margin: 'auto',
                    fontSize: 13
                  }}
                  iconType="circle"
                  iconSize={8}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="income-vs-expenditure__stats">
            <div className="income-stat income-stat--income">
              <span className="income-stat__label">Rata-rata Pendapatan</span>
              <span className="income-stat__value">Rp {avgIncome.toFixed(1)}Jt</span>
            </div>
            <div className="income-stat income-stat--expense">
              <span className="income-stat__label">Rata-rata Pengeluaran</span>
              <span className="income-stat__value">Rp {avgExpense.toFixed(1)}Jt</span>
            </div>
            <div className="income-stat income-stat--sample">
              <span className="income-stat__label">Ukuran Sampel</span>
              <span className="income-stat__value">{chartData.length}</span>
            </div>
          </div>

          <div className="income-vs-expenditure__insight">
            <span className="income-vs-expenditure__insight-icon">💡</span>
            <div className="income-vs-expenditure__insight-content">
              <strong className="income-vs-expenditure__insight-label">Insight:</strong>
              <span className="income-vs-expenditure__insight-text">
                Mayoritas responden GenZ memiliki pendapatan bulanan antara Rp2Jt-15Jt, 
                dengan pengeluaran yang berkisar antara Rp2Jt-15Jt. Kelompok pendapatan rendah cenderung memiliki rasio pengeluaran terhadap pendapatan yang lebih tinggi.
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IncomeVsExpenditure;
