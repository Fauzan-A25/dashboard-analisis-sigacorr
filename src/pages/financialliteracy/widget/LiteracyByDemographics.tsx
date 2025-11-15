import { type FC, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { calculateFinancialLiteracyScore } from '../../dashboard/metrics';
import '../../../styles/components/financialliteracy/literacy-by-demographics.css';

interface LiteracyByDemographicsProps {
  surveyData: any[];
}

const LiteracyByDemographics: FC<LiteracyByDemographicsProps> = ({ surveyData }) => {
  const byAgeGroup = useMemo(() => {
    const groups: Record<string, number[]> = {};

    surveyData.forEach(row => {
      const birthYear = row['Year of Birth'] || row.birth_year;
      if (!birthYear) return;

      const age = 2025 - birthYear;
      let ageGroup = 'Tidak diketahui';
      if (age <= 20) ageGroup = '18-20';
      else if (age <= 23) ageGroup = '21-23';
      else if (age <= 25) ageGroup = '24-25';
      else ageGroup = '>25';

      const score = calculateFinancialLiteracyScore(row);
      if (score > 0) {
        if (!groups[ageGroup]) groups[ageGroup] = [];
        groups[ageGroup].push(score);
      }
    });

    return Object.entries(groups)
      .map(([ageGroup, scores]) => ({
        group: ageGroup,
        score: scores.reduce((sum, s) => sum + s, 0) / scores.length,
        count: scores.length
      }))
      .sort((a, b) => {
        const order = ['18-20', '21-23', '24-25', '>25', 'Tidak diketahui'];
        return order.indexOf(a.group) - order.indexOf(b.group);
      });
  }, [surveyData]);

  const byEducation = useMemo(() => {
    const groups: Record<string, number[]> = {};

    surveyData.forEach(row => {
      const education = row['Last Education'] || row.education_level || 'Tidak diketahui';
      const score = calculateFinancialLiteracyScore(row);

      if (score > 0) {
        if (!groups[education]) groups[education] = [];
        groups[education].push(score);
      }
    });

    return Object.entries(groups)
      .map(([education, scores]) => ({
        group: education.replace('Senior High School', 'SMA')
                          .replace('Junior High School', 'SMP')
                          .replace('Bachelor (S1)/Diploma IV', 'Sarjana'),
        score: scores.reduce((sum, s) => sum + s, 0) / scores.length,
        count: scores.length
      }))
      .sort((a, b) => b.score - a.score);
  }, [surveyData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="literacy-demo-tooltip">
          <p className="literacy-demo-tooltip__title">{label}</p>
          <p className="literacy-demo-tooltip__score">Rata-rata Literasi: {data.score.toFixed(2)}/4</p>
          <p className="literacy-demo-tooltip__count">Sampel: {data.count} responden</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="literacy-by-demographics">
      <div className="literacy-by-demographics__header">
        <h3 className="literacy-by-demographics__title">
          Literasi berdasarkan Demografi
        </h3>
        <p className="literacy-by-demographics__subtitle">
          Perbandingan literasi keuangan berdasarkan kelompok demografi
        </p>
      </div>

      {surveyData.length === 0 ? (
        <div className="literacy-by-demographics__empty">
          Tidak ada data
        </div>
      ) : (
        <div className="literacy-by-demographics__charts">
          {/* Berdasarkan Grup Umur */}
          <div className="literacy-chart-section">
            <h4 className="literacy-chart-section__title literacy-chart-section__title--age">
              Berdasarkan Grup Umur
            </h4>
            <div className="literacy-chart-section__chart">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byAgeGroup} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="group"
                    stroke="#9ca3af"
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    domain={[0, 4]}
                    stroke="#9ca3af"
                    label={{ value: 'Skor Literasi', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="score"
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Berdasarkan Tingkat Pendidikan */}
          <div className="literacy-chart-section">
            <h4 className="literacy-chart-section__title literacy-chart-section__title--education">
              Berdasarkan Tingkat Pendidikan
            </h4>
            <div className="literacy-chart-section__chart">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byEducation} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="group"
                    stroke="#9ca3af"
                    angle={-25}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis
                    domain={[0, 4]}
                    stroke="#9ca3af"
                    label={{ value: 'Skor Literasi', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="score"
                    fill="#10b981"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      {surveyData.length > 0 && (
        <div className="literacy-by-demographics__insights">
          <div className="literacy-insight literacy-insight--age">
            <p className="literacy-insight__text">
              📊 <strong>Insight Umur:</strong> Grup {byAgeGroup[0]?.group} memiliki nilai rata-rata literasi {byAgeGroup[0]?.score.toFixed(2)}/4 dengan jumlah sampel {byAgeGroup[0]?.count}.
            </p>
          </div>
          <div className="literacy-insight literacy-insight--education">
            <p className="literacy-insight__text">
              🎓 <strong>Insight Pendidikan:</strong> Kelompok {byEducation[0]?.group} memiliki skor literasi tertinggi {byEducation[0]?.score.toFixed(2)}/4 dengan {byEducation[0]?.count} responden.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiteracyByDemographics;
