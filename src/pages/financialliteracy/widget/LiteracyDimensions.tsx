import { type FC, useMemo } from 'react';
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
import '../../../styles/components/financialliteracy/literacy-dimensions.css';

interface Props {
  data: any[];
}

const LiteracyDimensions: FC<Props> = ({ data = [] }) => {

  const calculateDimensionScore = (dataset: any[], startQ: number, endQ: number) => {
    const questionCount = endQ - startQ + 1;
    if (!dataset || dataset.length === 0) return 0;

    const total = dataset.reduce((acc, row) => {
      const sum = Array.from({ length: questionCount }, (_, i) => row[`Q${startQ + i}`] || 0)
        .reduce((a, b) => a + b, 0);
      return acc + sum;
    }, 0);

    const avgLikert = total / (dataset.length * questionCount);
    return ((avgLikert - 1) / 3) * 25;
  };

  const dimensionsData = useMemo(() => {
    const dims = {
      'Pengetahuan Finansial': calculateDimensionScore(data, 1, 9),
      'Literasi Digital': calculateDimensionScore(data, 10, 18),
      'Perilaku Finansial': calculateDimensionScore(data, 19, 29),
      'Pengambilan Keputusan': calculateDimensionScore(data, 30, 39),
      'Kesejahteraan': calculateDimensionScore(data, 40, 48),
    };

    return Object.entries(dims).map(([name, value]) => ({
      name,
      value: Math.round(value * 10) / 10,
      fullValue: value
    }));
  }, [data]);

  const dimensionColors: Record<string, string> = {
    'Pengetahuan Finansial': '#3b82f6',
    'Literasi Digital': '#10b981',
    'Perilaku Finansial': '#f59e0b',
    'Pengambilan Keputusan': '#8b5cf6',
    'Kesejahteraan': '#ec4899',
  };

  const highest = useMemo(() => {
    return dimensionsData.reduce((max, d) => d.value > max.value ? d : max, dimensionsData[0]);
  }, [dimensionsData]);

  const lowest = useMemo(() => {
    return dimensionsData.reduce((min, d) => d.value < min.value ? d : min, dimensionsData[0]);
  }, [dimensionsData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="literacy-dimensions-tooltip">
          <p className="literacy-dimensions-tooltip__title">{data.name}</p>
          <p className="literacy-dimensions-tooltip__value">{data.value}/25</p>
          <p className="literacy-dimensions-tooltip__percentage">
            {((data.value / 25) * 100).toFixed(1)}% dari maksimum
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="literacy-dimensions">
      <div className="literacy-dimensions__header">
        <h3 className="literacy-dimensions__title">
          Dimensi Literasi Keuangan
        </h3>
        <p className="literacy-dimensions__subtitle">
          Lima dimensi kunci kinerja literasi keuangan
        </p>
      </div>

      {data.length === 0 ? (
        <div className="literacy-dimensions__empty">
          Tidak ada data
        </div>
      ) : (
        <>
          <div className="literacy-dimensions__chart">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={dimensionsData}
                margin={{ top: 20, right: 20, bottom: 80, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  domain={[0, 25]}
                  ticks={[0, 5, 10, 15, 20, 25]}
                  stroke="#9ca3af"
                  label={{
                    value: 'Skor (dari 25)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: '#9ca3af', fontSize: 12 }
                  }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                >
                  {dimensionsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={dimensionColors[entry.name] || '#6b7280'}
                    />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="top"
                    style={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="literacy-dimensions__stats">
            <div className="literacy-dimension-stat literacy-dimension-stat--highest">
              <p className="literacy-dimension-stat__label">Tertinggi</p>
              <p className="literacy-dimension-stat__name">{highest.name}</p>
              <p className="literacy-dimension-stat__value">{highest.value}/25</p>
            </div>
            <div className="literacy-dimension-stat literacy-dimension-stat--lowest">
              <p className="literacy-dimension-stat__label">Terendah</p>
              <p className="literacy-dimension-stat__name">{lowest.name}</p>
              <p className="literacy-dimension-stat__value">{lowest.value}/25</p>
            </div>
            <div className="literacy-dimension-stat literacy-dimension-stat--average">
              <p className="literacy-dimension-stat__label">Rata-rata</p>
              <p className="literacy-dimension-stat__value literacy-dimension-stat__value--large">
                {(dimensionsData.reduce((sum, d) => sum + d.value, 0) / dimensionsData.length).toFixed(1)}/25
              </p>
              <p className="literacy-dimension-stat__meta">Dari semua dimensi</p>
            </div>
          </div>

          <div className="literacy-dimensions__insight">
            <p className="literacy-dimensions__insight-text">
              💡 <strong>Insight:</strong> {highest.name} menunjukkan performa terbaik 
              ({((highest.value / 25) * 100).toFixed(0)}%), sementara {lowest.name} 
              ({((lowest.value / 25) * 100).toFixed(0)}%) perlu perbaikan di kalangan responden GenZ.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default LiteracyDimensions;
