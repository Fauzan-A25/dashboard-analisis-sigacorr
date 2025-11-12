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
import type { FinancialProfileData } from '../../services/dataTypes';

interface DebtToIncomeRatioProps {
  profileData: FinancialProfileData[];
}

const DebtToIncomeRatio: FC<DebtToIncomeRatioProps> = ({ profileData }) => {
  
  /**
   * Parse income range to midpoint (in millions)
   */
  const parseIncome = (str: any): number => {
    if (!str) return 0;
    
    // Convert to string if it's a number
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
        const debt = (p.outstanding_loan || 0) / 1000000; // Convert to millions
        const ratio = income > 0 ? (debt / (income * 12)) * 100 : 0; // Debt to annual income
        
        let riskLevel = 'Healthy';
        let color = '#10b981';
        if (ratio > 50) {
          riskLevel = 'Critical';
          color = '#ef4444';
        } else if (ratio > 30) {
          riskLevel = 'Warning';
          color = '#f59e0b';
        }
        
        return {
          income,
          debt,
          ratio,
          riskLevel,
          color,
          employment: p.employment_status || 'Unknown'
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
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold mb-1">{data.employment}</p>
          <p className="text-blue-400 text-sm">Income: Rp {data.income.toFixed(1)}M/month</p>
          <p className="text-red-400 text-sm">Debt: Rp {data.debt.toFixed(1)}M</p>
          <p className={`text-sm font-bold mt-1`} style={{ color: data.color }}>
            Ratio: {data.ratio.toFixed(1)}% - {data.riskLevel}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          Debt-to-Income Ratio Analysis
        </h3>
        <p className="text-sm text-gray-400">
          Financial health by debt burden (Healthy: &lt;30%, Warning: 30-50%, Critical: &gt;50%)
        </p>
      </div>

      {scatterData.length === 0 ? (
        <div className="h-[350px] flex items-center justify-center text-gray-500">
          No debt data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number" 
                dataKey="income" 
                name="Monthly Income"
                stroke="#9ca3af"
                domain={[0, 20]}
                label={{ value: 'Income (Million Rp)', position: 'insideBottom', offset: -5, style: { fill: '#9ca3af', fontSize: 11 } }}
              />
              <YAxis 
                type="number" 
                dataKey="debt" 
                name="Outstanding Debt"
                stroke="#9ca3af"
                domain={[0, 'auto']}
                label={{ value: 'Debt (Million Rp)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 11 } }}
              />
              <ZAxis range={[50, 200]} />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              
              {/* Reference line at 30% ratio */}
              <ReferenceLine 
                segment={[{ x: 0, y: 0 }, { x: 20, y: 72 }]} 
                stroke="#f59e0b" 
                strokeDasharray="5 5"
                label={{ value: '30% Threshold', position: 'top', fill: '#f59e0b', fontSize: 10 }}
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

          {/* Risk Distribution */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-300 mb-1">Healthy (&lt;30%)</p>
              <p className="text-2xl font-bold text-green-400">{riskCategories.healthy.count}</p>
              <p className="text-xs text-gray-400">{riskCategories.healthy.pct.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p className="text-xs text-orange-300 mb-1">Warning (30-50%)</p>
              <p className="text-2xl font-bold text-orange-400">{riskCategories.warning.count}</p>
              <p className="text-xs text-gray-400">{riskCategories.warning.pct.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs text-red-300 mb-1">Critical (&gt;50%)</p>
              <p className="text-2xl font-bold text-red-400">{riskCategories.critical.count}</p>
              <p className="text-xs text-gray-400">{riskCategories.critical.pct.toFixed(1)}%</p>
            </div>
          </div>

          {/* Insight */}
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-300">
              🚨 <strong>Risk Alert:</strong> {riskCategories.critical.pct.toFixed(0)}% of borrowers 
              are in critical debt zone (&gt;50% ratio). Immediate debt counseling recommended.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default DebtToIncomeRatio;
