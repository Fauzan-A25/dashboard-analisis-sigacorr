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
import { 
  calculateFinancialLiteracyScore, 
  calculateDigitalAdoptionScore 
} from '../metrics';
import '../../../styles/components/dashboard/literacy-vs-fintech-correlation.css';

interface LiteracyVsFintechCorrelationProps {
  surveyData: any[];
}

const LiteracyVsFintechCorrelation: FC<LiteracyVsFintechCorrelationProps> = ({ surveyData }) => {

  const chartData = useMemo(() => {
    console.log(`📊 Memproses ${surveyData.length} data survei untuk korelasi...`);

    const data = surveyData
      .map(row => {
        const literacyScore = calculateFinancialLiteracyScore(row);
        const fintechScore = calculateDigitalAdoptionScore(row);
        const birthYear = row['Year of Birth'] || row.birth_year;
        const age = birthYear ? 2025 - birthYear : null;

        let ageGroup = 'Tidak diketahui';
        if (age !== null) {
          if (age <= 20) ageGroup = '18-20';
          else if (age <= 23) ageGroup = '21-23';
          else if (age <= 25) ageGroup = '24-25';
          else ageGroup = '>25';
        }

        return {
          literacy: literacyScore,
          fintech: fintechScore,
          ageGroup,
          isValid: literacyScore > 0 && fintechScore > 0 && !isNaN(literacyScore) && !isNaN(fintechScore)
        };
      })
      .filter(d => d.isValid);

    console.log(`✅ Data valid: ${data.length}`);
    console.log('Contoh:', data.slice(0, 3));

    return data;
  }, [surveyData]);

  const correlation = useMemo(() => {
    if (chartData.length < 2) {
      console.warn('⚠️ Data tidak cukup untuk analisis korelasi');
      return 0;
    }

    const n = chartData.length;
    const sumX = chartData.reduce((sum, d) => sum + d.literacy, 0);
    const sumY = chartData.reduce((sum, d) => sum + d.fintech, 0);
    const sumXY = chartData.reduce((sum, d) => sum + d.literacy * d.fintech, 0);
    const sumX2 = chartData.reduce((sum, d) => sum + d.literacy * d.literacy, 0);
    const sumY2 = chartData.reduce((sum, d) => sum + d.fintech * d.fintech, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0 || isNaN(denominator)) {
      console.warn('⚠️ Penyebut korelasi tidak valid');
      return 0;
    }

    const result = numerator / denominator;
    console.log(`📈 Korelasi: ${result.toFixed(3)}`);
    return result;
  }, [chartData]);

  const trendlineData = useMemo(() => {
    if (chartData.length < 2) return [];

    const n = chartData.length;
    const sumX = chartData.reduce((sum, d) => sum + d.literacy, 0);
    const sumY = chartData.reduce((sum, d) => sum + d.fintech, 0);
    const sumXY = chartData.reduce((sum, d) => sum + d.literacy * d.fintech, 0);
    const sumX2 = chartData.reduce((sum, d) => sum + d.literacy * d.literacy, 0);

    const denominator = (n * sumX2 - sumX * sumX);
    if (denominator === 0) return [];

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    const minX = Math.min(...chartData.map(d => d.literacy));
    const maxX = Math.max(...chartData.map(d => d.literacy));

    return [
      { literacy: minX, fintech: slope * minX + intercept },
      { literacy: maxX, fintech: slope * maxX + intercept }
    ];
  }, [chartData]);

  const ageColors: Record<string, string> = {
    '18-20': '#3b82f6',
    '21-23': '#10b981',
    '24-25': '#f59e0b',
    '>25': '#ef4444',
    'Tidak diketahui': '#6b7280'
  };

  const aggregatedData = useMemo(() => {
    const groups: Record<string, typeof chartData> = {};

    chartData.forEach(d => {
      if (!groups[d.ageGroup]) groups[d.ageGroup] = [];
      groups[d.ageGroup].push(d);
    });

    const sampledGroups: Record<string, typeof chartData> = {};
    Object.entries(groups).forEach(([ageGroup, data]) => {
      if (data.length > 300) {
        const step = Math.ceil(data.length / 300);
        sampledGroups[ageGroup] = data.filter((_, i) => i % step === 0);
      } else {
        sampledGroups[ageGroup] = data;
      }
    });

    return sampledGroups;
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="literacy-fintech-tooltip">
          <p className="literacy-fintech-tooltip__title">{data.ageGroup} tahun</p>
          <p className="literacy-fintech-tooltip__literacy">Skor Literasi: {data.literacy.toFixed(2)}/4</p>
          <p className="literacy-fintech-tooltip__fintech">Skor Fintech: {data.fintech.toFixed(2)}/4</p>
        </div>
      );
    }
    return null;
  };

  const displayedCount = Object.values(aggregatedData).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="literacy-fintech-correlation">
      <div className="literacy-fintech-correlation__header">
        <h3 className="literacy-fintech-correlation__title">
          Literasi Keuangan vs Penggunaan Fintech
        </h3>
        <p className="literacy-fintech-correlation__subtitle">
          Korelasi antara literasi dan adopsi finansial digital
        </p>
      </div>

      {chartData.length < 2 ? (
        <div className="literacy-fintech-correlation__empty">
          <div className="literacy-fintech-correlation__empty-icon">📊</div>
          <p className="literacy-fintech-correlation__empty-title">Data Tidak Cukup</p>
          <p className="literacy-fintech-correlation__empty-text">
            Dibutuhkan minimal 2 titik data untuk analisis korelasi
          </p>
          <p className="literacy-fintech-correlation__empty-count">
            Saat ini: {chartData.length} titik valid
          </p>
        </div>
      ) : (
        <>
          <div className="literacy-fintech-correlation__chart">
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart margin={{ top: 20, right: 20, bottom: 40, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="number" 
                  dataKey="literacy" 
                  domain={[0, 4]}
                  ticks={[0, 1, 2, 3, 4]}
                  stroke="#9ca3af"
                  label={{ 
                    value: 'Skor Literasi Keuangan', 
                    position: 'insideBottom',
                    offset: -5,
                    style: { fill: '#9ca3af', fontSize: 12 }
                  }}
                />
                <YAxis 
                  type="number" 
                  dataKey="fintech" 
                  domain={[0, 4]}
                  ticks={[0, 1, 2, 3, 4]}
                  stroke="#9ca3af"
                  label={{ 
                    value: 'Skor Penggunaan Fintech', 
                    angle: -90, 
                    position: 'insideLeft',
                    offset: -40,
                    style: { fill: '#9ca3af', fontSize: 12 }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {Object.entries(aggregatedData).map(([ageGroup, data]) => (
                  <Scatter
                    key={ageGroup}
                    name={ageGroup}
                    data={data}
                    fill={ageColors[ageGroup]}
                    fillOpacity={0.5}
                    shape="circle"
                    isAnimationActive={false}
                  />
                ))}
                
                {trendlineData.length > 0 && (
                  <Line 
                    data={trendlineData}
                    type="monotone"
                    dataKey="fintech"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    name="Trend"
                    strokeDasharray="5 5"
                    isAnimationActive={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="literacy-fintech-correlation__legend">
            {Object.entries(aggregatedData)
              .sort((a, b) => b[1].length - a[1].length)
              .map(([ageGroup, data]) => (
                <div key={ageGroup} className="literacy-fintech-legend-item">
                  <div 
                    className="literacy-fintech-legend-item__dot"
                    style={{ backgroundColor: ageColors[ageGroup] }}
                  />
                  <span className="literacy-fintech-legend-item__text">
                    {ageGroup} <span className="literacy-fintech-legend-item__count">({data.length})</span>
                  </span>
                </div>
            ))}
          </div>

          <div className="literacy-fintech-correlation__stats">
            <div className="literacy-fintech-stat literacy-fintech-stat--correlation">
              <p className="literacy-fintech-stat__label">Korelasi (r)</p>
              <p className="literacy-fintech-stat__value">
                {correlation.toFixed(3)}
              </p>
              <p className="literacy-fintech-stat__meta">
                {Math.abs(correlation) > 0.7 ? 'Kuat' : Math.abs(correlation) > 0.3 ? 'Sedang' : 'Lemah'}
                {correlation > 0 ? ' positif' : correlation < 0 ? ' negatif' : ''}
              </p>
            </div>
            <div className="literacy-fintech-stat literacy-fintech-stat--sample">
              <p className="literacy-fintech-stat__label">Ukuran Sampel</p>
              <p className="literacy-fintech-stat__value">
                {chartData.length}
              </p>
              <p className="literacy-fintech-stat__meta">
                Ditampilkan: {displayedCount}
              </p>
            </div>
          </div>

          <div className="literacy-fintech-correlation__insight">
            <p className="literacy-fintech-correlation__insight-text">
              💡 <strong>Insight:</strong> {
                Math.abs(correlation) > 0.5 
                  ? 'Korelasi positif yang kuat menunjukkan bahwa literasi keuangan yang lebih tinggi berujung pada penggunaan fintech yang lebih bertanggung jawab.'
                  : Math.abs(correlation) > 0.3
                  ? 'Korelasi sedang menandakan adanya hubungan antara literasi keuangan dan adopsi fintech.'
                  : 'Korelasi yang lemah menunjukkan faktor lain mungkin memengaruhi penggunaan fintech selain literasi.'
              }
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default LiteracyVsFintechCorrelation;
