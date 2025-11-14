import { type FC, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ZAxis
} from 'recharts';
import type { FinancialProfileData } from '../../../services/dataTypes';
import '../../../styles/components/behaviorwellbeing/debt-to-income-ratio.css';

interface DebtToIncomeRatioProps {
  profileData: FinancialProfileData[];
}

const DebtToIncomeRatio: FC<DebtToIncomeRatioProps> = ({ profileData }) => {
  
  const parseIncome = (str: any): number => {
    if (!str) return 0;
    const strValue = typeof str === 'number' ? str.toString() : str;
    const cleaned = strValue.replace(/Rp/g, '').replace(/\s/g, '');
    if (cleaned.includes('<')) return 1;
    if (cleaned.includes('>')) return 17.5;
    const numbers = cleaned.match(/[\d.]+/g) as string[] | null;
    if (!numbers) return 0;
    const values = numbers.map((n: string) => parseFloat(n.replace(/\./g, '')) / 1000000);
    return values.length >= 2 ? (values[0] + values[1]) / 2 : values[0];
  };

  const scatterData = useMemo(() => {
    return profileData
      .map(p => {
        const income = parseIncome(p.avg_monthly_income);
        const debt = (p.outstanding_loan || 0) / 1000000;
        const ratio = income > 0 ? (debt / (income * 12)) * 100 : 0;
        
        let riskLevel = 'Sehat';
        let color = '#10b981';
        if (ratio > 50) {
          riskLevel = 'Kritis';
          color = '#ef4444';
        } else if (ratio > 30) {
          riskLevel = 'Peringatan';
          color = '#f59e0b';
        }
        
        return {
          income,
          debt,
          ratio,
          riskLevel,
          color,
          employment: p.employment_status || 'Tidak diketahui'
        };
      })
      .filter(d => d.income > 0 && d.debt > 0);
  }, [profileData]);

  const riskCategories = useMemo(() => {
    const total = scatterData.length;
    if (total === 0) {
      return {
        healthy: { count: 0, pct: 0 },
        warning: { count: 0, pct: 0 },
        critical: { count: 0, pct: 0 }
      };
    }
    
    const healthy = scatterData.filter(d => d.ratio <= 30).length;
    const warning = scatterData.filter(d => d.ratio > 30 && d.ratio <= 50).length;
    const critical = scatterData.filter(d => d.ratio > 50).length;
    
    return {
      healthy: { count: healthy, pct: (healthy / total) * 100 },
      warning: { count: warning, pct: (warning / total) * 100 },
      critical: { count: critical, pct: (critical / total) * 100 }
    };
  }, [scatterData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="debt-tooltip">
          <p className="debt-tooltip__title">{data.employment}</p>
          <p className="debt-tooltip__income">Pendapatan: Rp {data.income.toFixed(1)}Jt/bulan</p>
          <p className="debt-tooltip__debt">Hutang: Rp {data.debt.toFixed(1)}Jt</p>
          <p className="debt-tooltip__ratio" style={{ color: data.color }}>
            Rasio: {data.ratio.toFixed(1)}% - {data.riskLevel}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="debt-ratio">
      <div className="debt-ratio__header">
        <h3 className="debt-ratio__title">
          Analisis Rasio Hutang terhadap Pendapatan
        </h3>
        <p className="debt-ratio__subtitle">
          Kesehatan finansial berdasarkan beban hutang (Sehat: &lt;30%, Peringatan: 30-50%, Kritis: &gt;50%)
        </p>
      </div>

      {scatterData.length === 0 ? (
        <div className="debt-ratio__empty">
          Data hutang tidak tersedia
        </div>
      ) : (
        <>
          <div className="debt-ratio__chart">
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="number" 
                  dataKey="income" 
                  name="Pendapatan Bulanan"
                  stroke="#9ca3af"
                  domain={[0, 20]}
                  label={{ value: 'Pendapatan (Juta Rp)', position: 'insideBottom', offset: -5, style: { fill: '#9ca3af', fontSize: 11 } }}
                />
                <YAxis 
                  type="number" 
                  dataKey="debt" 
                  name="Hutang Terutang"
                  stroke="#9ca3af"
                  domain={[0, 'auto']}
                  label={{ value: 'Hutang (Juta Rp)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 11 } }}
                />
                <ZAxis range={[50, 200]} />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                
                <ReferenceLine 
                  segment={[{ x: 0, y: 0 }, { x: 20, y: 72 }]} 
                  stroke="#f59e0b" 
                  strokeDasharray="5 5"
                  label={{ value: 'Ambang Batas 30%', position: 'top', fill: '#f59e0b', fontSize: 10 }}
                />
                
                <Scatter 
                  data={scatterData} 
                  fill="#8884d8"
                  isAnimationActive={false}
                >
                  {scatterData.map((entry, index) => (
                    <circle 
                      key={`dot-${index}`} 
                      r={5} 
                      fill={entry.color}
                      opacity={0.7}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Distribusi Risiko */}
          <div className="debt-ratio__stats">
            <div className="debt-stat debt-stat--healthy">
              <p className="debt-stat__label">Sehat (&lt;30%)</p>
              <p className="debt-stat__value">{riskCategories.healthy.count}</p>
              <p className="debt-stat__percentage">{riskCategories.healthy.pct.toFixed(1)}%</p>
            </div>
            <div className="debt-stat debt-stat--warning">
              <p className="debt-stat__label">Peringatan (30-50%)</p>
              <p className="debt-stat__value">{riskCategories.warning.count}</p>
              <p className="debt-stat__percentage">{riskCategories.warning.pct.toFixed(1)}%</p>
            </div>
            <div className="debt-stat debt-stat--critical">
              <p className="debt-stat__label">Kritis (&gt;50%)</p>
              <p className="debt-stat__value">{riskCategories.critical.count}</p>
              <p className="debt-stat__percentage">{riskCategories.critical.pct.toFixed(1)}%</p>
            </div>
          </div>

          {/* Insight */}
          <div className="debt-ratio__insight">
            <p className="debt-ratio__insight-text">
              🚨 <strong>Peringatan Risiko:</strong> {riskCategories.critical.pct.toFixed(0)}% peminjam 
              berada di zona hutang kritis (&gt;50% rasio). Disarankan konseling hutang segera.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default DebtToIncomeRatio;
