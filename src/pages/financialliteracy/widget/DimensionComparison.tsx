import { type FC, useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import '../../../styles/components/financialliteracy/dimension-comparison.css';

interface DimensionComparisonProps {
  surveyData: any[];
}

const DimensionComparison: FC<DimensionComparisonProps> = ({ surveyData }) => {

  const comparisonData = useMemo(() => {
    if (surveyData.length === 0) return [];

    const calculateDimensions = (data: any[]) => {
      const calcDim = (startQ: number, endQ: number) => {
        const questionCount = endQ - startQ + 1;
        if (data.length === 0) return 0;
        const total = data.reduce((acc, row) => {
          const sum = Array.from({ length: questionCount }, (_, i) => row[`Q${startQ + i}`] || 0)
            .reduce((a, b) => a + b, 0);
          return acc + sum;
        }, 0);
        const avg = total / (data.length * questionCount);
        return ((avg - 1) / 3) * 25; // Normalisasi ke 0-25
      };

      return {
        'Pengetahuan Finansial': calcDim(1, 9),
        'Literasi Digital': calcDim(10, 18),
        'Perilaku Finansial': calcDim(19, 29),
        'Pengambilan Keputusan': calcDim(30, 39),
        'Kesejahteraan': calcDim(40, 48)
      };
    };

    // Kelompokkan berdasarkan tingkat pendidikan
    const groups: Record<string, any[]> = {
      'SMA': [],
      'Sarjana': [],
      'Lainnya': []
    };

    surveyData.forEach(row => {
      const edu = row['Last Education'] || row.education_level || '';
      if (edu.includes('Senior High School') || edu.includes('SMA')) {
        groups['SMA'].push(row);
      } else if (edu.includes('Bachelor') || edu.includes('S1')) {
        groups['Sarjana'].push(row);
      } else {
        groups['Lainnya'].push(row);
      }
    });

    const smaScores = calculateDimensions(groups['SMA']);
    const bachelorScores = calculateDimensions(groups['Sarjana']);

    return Object.keys(smaScores).map(dimension => ({
      dimension,
      'SMA': smaScores[dimension as keyof typeof smaScores],
      'Sarjana': bachelorScores[dimension as keyof typeof bachelorScores]
    }));
  }, [surveyData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="dimension-tooltip">
          <p className="dimension-tooltip__title">{payload[0].payload.dimension}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="dimension-tooltip__item" style={{ color: entry.stroke }}>
              {entry.name}: {entry.value.toFixed(1)}/25
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dimension-comparison">
      <div className="dimension-comparison__header">
        <h3 className="dimension-comparison__title">
          Perbandingan Dimensi Menurut Pendidikan
        </h3>
        <p className="dimension-comparison__subtitle">
          Perbandingan 5 dimensi literasi keuangan berdasarkan tingkat pendidikan
        </p>
      </div>

      {surveyData.length === 0 ? (
        <div className="dimension-comparison__empty">
          Tidak ada data
        </div>
      ) : (
        <>
          <div className="dimension-comparison__chart">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={comparisonData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis 
                  dataKey="dimension" 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 25]}
                  stroke="#9ca3af"
                />
                <Radar 
                  name="SMA" 
                  dataKey="SMA" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar 
                  name="Sarjana" 
                  dataKey="Sarjana" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="dimension-comparison__insight">
            <p className="dimension-comparison__insight-text">
              🎯 <strong>Perbandingan:</strong> Pemegang gelar sarjana secara konsisten memiliki skor lebih tinggi 
              dibanding lulusan SMA di semua dimensi, dengan perbedaan terbesar pada Pengetahuan Finansial dan Pengambilan Keputusan.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default DimensionComparison;
