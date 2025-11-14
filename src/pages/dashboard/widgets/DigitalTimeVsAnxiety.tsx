import { type FC, useMemo } from 'react';
import {
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';
import type { FinancialProfileData } from '../../../services/dataTypes';
import '../../../styles/components/dashboard/digital-time-anxiety.css';

interface DigitalTimeVsAnxietyProps {
  profileData: FinancialProfileData[];
}

const DigitalTimeVsAnxiety: FC<DigitalTimeVsAnxietyProps> = ({ profileData }) => {
  
  const chartData = useMemo(() => {
    return profileData
      .filter(p => 
        typeof p.digital_time_spent_per_day === 'number' && 
        typeof p.financial_anxiety_score === 'number' &&
        p.digital_time_spent_per_day > 0
      )
      .map(p => ({
        time: p.digital_time_spent_per_day || 0,
        anxiety: p.financial_anxiety_score || 0,
        province: p.province || 'Tidak diketahui',
        ageGroup: p.birth_year ? (2025 - p.birth_year <= 23 ? 'Muda (≤23)' : 'Dewasa (>23)') : 'Tidak diketahui'
      }));
  }, [profileData]);

  const correlation = useMemo(() => {
    if (chartData.length === 0) return 0;
    
    const n = chartData.length;
    const sumX = chartData.reduce((sum, d) => sum + d.time, 0);
    const sumY = chartData.reduce((sum, d) => sum + d.anxiety, 0);
    const sumXY = chartData.reduce((sum, d) => sum + d.time * d.anxiety, 0);
    const sumX2 = chartData.reduce((sum, d) => sum + d.time * d.time, 0);
    const sumY2 = chartData.reduce((sum, d) => sum + d.anxiety * d.anxiety, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }, [chartData]);

  const trendlineData = useMemo(() => {
    if (chartData.length === 0) return [];
    
    const n = chartData.length;
    const sumX = chartData.reduce((sum, d) => sum + d.time, 0);
    const sumY = chartData.reduce((sum, d) => sum + d.anxiety, 0);
    const sumXY = chartData.reduce((sum, d) => sum + d.time * d.anxiety, 0);
    const sumX2 = chartData.reduce((sum, d) => sum + d.time * d.time, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const minX = Math.min(...chartData.map(d => d.time));
    const maxX = Math.max(...chartData.map(d => d.time));
    
    return [
      { time: minX, anxiety: slope * minX + intercept },
      { time: maxX, anxiety: slope * maxX + intercept }
    ];
  }, [chartData]);

  const groupedData = useMemo(() => {
    const groups: Record<string, typeof chartData> = {};
    chartData.forEach(d => {
      if (!groups[d.ageGroup]) groups[d.ageGroup] = [];
      groups[d.ageGroup].push(d);
    });
    return groups;
  }, [chartData]);

  const ageColors: Record<string, string> = {
    'Muda (≤23)': '#3b82f6',
    'Dewasa (>23)': '#f59e0b',
    'Tidak diketahui': '#6b7280'
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="digital-tooltip">
          <p className="digital-tooltip__title">{data.ageGroup}</p>
          <p className="digital-tooltip__time">Waktu Digital: {data.time.toFixed(1)} jam/hari</p>
          <p className="digital-tooltip__anxiety">Skor Kecemasan: {data.anxiety}/5</p>
          <p className="digital-tooltip__location">{data.province}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="digital-time-anxiety">
      <div className="digital-time-anxiety__header">
        <h3 className="digital-time-anxiety__title">
          Waktu Digital vs Kecemasan Finansial
        </h3>
        <p className="digital-time-anxiety__subtitle">
          Dampak penggunaan perangkat digital terhadap tingkat stres keuangan
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="digital-time-anxiety__empty">
          Tidak ada data
        </div>
      ) : (
        <>
          <div className="digital-time-anxiety__chart">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="number" 
                  dataKey="time" 
                  stroke="#9ca3af"
                  label={{ 
                    value: 'Waktu Digital (jam/hari)', 
                    position: 'bottom',
                    offset: 40,
                    style: { fill: '#9ca3af' }
                  }}
                />
                <YAxis 
                  type="number" 
                  dataKey="anxiety" 
                  domain={[0, 5]}
                  stroke="#9ca3af"
                  label={{ 
                    value: 'Skor Kecemasan Finansial', 
                    angle: -90, 
                    position: 'insideLeft',
                    offset: -40,
                    style: { fill: '#9ca3af' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />

                {Object.entries(groupedData).map(([ageGroup, data]) => (
                  <Scatter
                    key={ageGroup}
                    name={ageGroup}
                    data={data}
                    fill={ageColors[ageGroup]}
                    fillOpacity={0.6}
                  />
                ))}

                <Line 
                  data={trendlineData}
                  type="monotone"
                  dataKey="anxiety"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="Trend"
                  strokeDasharray="5 5"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="digital-time-anxiety__stats">
            <div className="digital-stat digital-stat--correlation">
              <p className="digital-stat__label">Korelasi (r)</p>
              <p className="digital-stat__value">
                {correlation.toFixed(3)}
              </p>
            </div>
            <div className="digital-stat digital-stat--time">
              <p className="digital-stat__label">Rata-rata Waktu Digital</p>
              <p className="digital-stat__value">
                {(chartData.reduce((sum, d) => sum + d.time, 0) / chartData.length).toFixed(1)} jam
              </p>
            </div>
            <div className="digital-stat digital-stat--anxiety">
              <p className="digital-stat__label">Rata-rata Kecemasan</p>
              <p className="digital-stat__value">
                {(chartData.reduce((sum, d) => sum + d.anxiety, 0) / chartData.length).toFixed(1)}/5
              </p>
            </div>
          </div>

          <div className="digital-time-anxiety__insight">
            <p className="digital-time-anxiety__insight-text">
              ⚠️ <strong>Temuan:</strong> Korelasi sebesar {correlation.toFixed(3)} menunjukkan bahwa peningkatan waktu digital 
              berkaitan dengan meningkatnya kecemasan finansial di kalangan GenZ.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default DigitalTimeVsAnxiety;
