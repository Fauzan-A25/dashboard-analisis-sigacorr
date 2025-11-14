import { type FC, useMemo, useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import { calculateFinancialLiteracyScore } from '../../dashboard/metrics';
import '../../../styles/components/regionalanalysis/urbanization-impact.css';

interface UrbanizationImpactProps {
  surveyData: any[];
  regionalData: any[];
}

const UrbanizationImpact: FC<UrbanizationImpactProps> = ({ surveyData, regionalData }) => {

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const { urbanizationData, stats } = useMemo(() => {
    const normalize = (s: any) => String(s || '').trim().toLowerCase();

    const urbanizationMap: Record<string, number> = {};
    regionalData.forEach(region => {
      const provinsiKey = normalize(region.province);
      const pct = typeof region.urbanization_percent === 'number' ? region.urbanization_percent : Number(region.urbanization_percent) || 0;
      urbanizationMap[provinsiKey] = pct;
    });

    const groups: Record<string, { scores: number[], urban: number[] }> = {
      'Rural (<30%)': { scores: [], urban: [] },
      'Semi-Urban (30-50%)': { scores: [], urban: [] },
      'Urban (50-70%)': { scores: [], urban: [] },
      'Highly Urban (>70%)': { scores: [], urban: [] }
    };

    surveyData.forEach(row => {
      const province = row['Province of Origin'] || row.province;
      if (!province) return;

      const normalizedName = normalize(province);
      const urbanization = urbanizationMap[normalizedName];

      if (urbanization === undefined || urbanization === null) return;

      const score = calculateFinancialLiteracyScore(row);
      if (score === 0) return;

      let category = '';
      if (urbanization < 30) category = 'Rural (<30%)';
      else if (urbanization < 50) category = 'Semi-Urban (30-50%)';
      else if (urbanization < 70) category = 'Urban (50-70%)';
      else category = 'Highly Urban (>70%)';

      groups[category].scores.push(score);
      groups[category].urban.push(urbanization);
    });

    const data = Object.entries(groups)
      .map(([category, data]) => ({
        category,
        shortCategory: category.split(' ')[0],
        literacy: data.scores.length > 0
          ? data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length
          : 0,
        avgUrbanization: data.urban.length > 0
          ? data.urban.reduce((sum, u) => sum + u, 0) / data.urban.length
          : 0,
        count: data.scores.length
      }))
      .filter(d => d.count > 0);

    const avgLiteracy = data.length > 0
      ? data.reduce((sum, d) => sum + d.literacy, 0) / data.length
      : 0;

    const highest = data.reduce((max, d) => d.literacy > max.literacy ? d : max, data[0] || { literacy: 0, category: '' });
    const lowest = data.reduce((min, d) => d.literacy < min.literacy ? d : min, data[0] || { literacy: 0, category: '' });

    return {
      urbanizationData: data,
      stats: {
        avgLiteracy,
        highest,
        lowest,
        totalRespondents: data.reduce((sum, d) => sum + d.count, 0)
      }
    };
  }, [surveyData, regionalData]);

  const axisColor = isDarkMode ? '#94a3b8' : '#475569';
  const gridColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(100,116,139,0.2)';
  const labelColor = isDarkMode ? '#e2e8f0' : '#1e293b';
  const axisLineColor = isDarkMode ? '#374151' : '#cbd5e1';

  const getBarColor = (literacy: number) => {
    if (literacy >= 3.5) return '#10b981';
    if (literacy >= 3.0) return '#3b82f6';
    if (literacy >= 2.5) return '#f59e0b';
    return '#ef4444';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="urbanization-impact-tooltip">
          <div className="urbanization-impact-tooltip__title">
            🏙️ {data.category}
          </div>

          <div className="urbanization-impact-tooltip__content">
            <div className="urbanization-impact-tooltip__row">
              <span className="urbanization-impact-tooltip__label">📚 Literasi:</span>
              <strong className="urbanization-impact-tooltip__literacy" style={{ color: getBarColor(data.literacy) }}>
                {data.literacy.toFixed(2)}/4
              </strong>
            </div>

            <div className="urbanization-impact-tooltip__row">
              <span className="urbanization-impact-tooltip__label">🏙️ Urbanisasi:</span>
              <strong className="urbanization-impact-tooltip__urbanization">{data.avgUrbanization.toFixed(1)}%</strong>
            </div>

            <div className="urbanization-impact-tooltip__row urbanization-impact-tooltip__row--divider">
              <span className="urbanization-impact-tooltip__label">👥 Responden:</span>
              <strong className="urbanization-impact-tooltip__count-value">{data.count} orang</strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="urbanization-impact">
      <div className="urbanization-impact__header">
        <div className="urbanization-impact__header-row">
          <span className="urbanization-impact__icon">🏙️</span>
          <h3 className="urbanization-impact__title">
            Dampak Urbanisasi terhadap Literasi Keuangan
          </h3>
        </div>
        <p className="urbanization-impact__subtitle">
          Perbandingan tingkat literasi berdasarkan level urbanisasi wilayah
        </p>
      </div>

      {urbanizationData.length === 0 ? (
        <div className="urbanization-impact__empty">
          <div className="urbanization-impact__empty-icon">🏙️</div>
          <p className="urbanization-impact__empty-text">Data urbanisasi tidak tersedia</p>
        </div>
      ) : (
        <>
          <div className="urbanization-impact__stats">
            <div className="urbanization-impact-stat urbanization-impact-stat--avg">
              <div className="urbanization-impact-stat__label">
                RATA-RATA LITERASI
              </div>
              <div className="urbanization-impact-stat__value">
                {stats.avgLiteracy.toFixed(2)}/4
              </div>
            </div>

            <div className="urbanization-impact-stat urbanization-impact-stat--high">
              <div className="urbanization-impact-stat__label">
                TERTINGGI
              </div>
              <div className="urbanization-impact-stat__value">
                {stats.highest.shortCategory}
                <div className="urbanization-impact-stat__subvalue">
                  {stats.highest.literacy.toFixed(2)}/4
                </div>
              </div>
            </div>

            <div className="urbanization-impact-stat urbanization-impact-stat--low">
              <div className="urbanization-impact-stat__label">
                TERENDAH
              </div>
              <div className="urbanization-impact-stat__value">
                {stats.lowest.shortCategory}
                <div className="urbanization-impact-stat__subvalue">
                  {stats.lowest.literacy.toFixed(2)}/4
                </div>
              </div>
            </div>

            <div className="urbanization-impact-stat urbanization-impact-stat--count">
              <div className="urbanization-impact-stat__label">
                TOTAL RESPONDEN
              </div>
              <div className="urbanization-impact-stat__value">
                {stats.totalRespondents}
              </div>
            </div>
          </div>

          <div className="urbanization-impact__chart">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={urbanizationData}
                margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridColor}
                  vertical={false}
                />
                <XAxis
                  dataKey="shortCategory"
                  stroke={axisColor}
                  tick={{ fill: axisColor, fontSize: 13 }}
                  tickLine={false}
                  axisLine={{ stroke: axisLineColor }}
                />
                <YAxis
                  domain={[0, 4]}
                  stroke={axisColor}
                  tick={{ fill: axisColor, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: axisLineColor }}
                  ticks={[0, 1, 2, 3, 4]}
                  label={{
                    value: 'Skor Literasi',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: labelColor, fontWeight: '600' }
                  }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: isDarkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar
                  dataKey="literacy"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={80}
                >
                  {urbanizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.literacy)} />
                  ))}
                  <LabelList
                    dataKey="literacy"
                    position="top"
                    formatter={(value: number) => value.toFixed(2)}
                    style={{ fill: labelColor, fontSize: '12px', fontWeight: 'bold' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="urbanization-impact__insight">
            <span className="urbanization-impact__insight-icon">💡</span>
            <p className="urbanization-impact__insight-text">
              {urbanizationData.length > 1 && stats.highest.literacy > stats.lowest.literacy ? (
                <>
                  <strong>Keunggulan Urban:</strong> Wilayah {stats.highest.shortCategory.toLowerCase()} menunjukkan literasi{' '}
                  <strong className="urbanization-impact__insight-highlight">
                    {((stats.highest.literacy - stats.lowest.literacy) / stats.lowest.literacy * 100).toFixed(0)}% lebih tinggi
                  </strong>{' '}
                  dibanding wilayah {stats.lowest.shortCategory.toLowerCase()}. Tingkat urbanisasi berkorelasi positif dengan literasi keuangan.
                </>
              ) : (
                'Tingkat urbanisasi menunjukkan dampak positif terhadap literasi keuangan masyarakat.'
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default UrbanizationImpact;
