import { type FC, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import type { FinancialProfileData } from '../../../services/dataTypes';
import '../../../styles/components/behaviorwellbeing/anxiety-heatmap.css';

interface AnxietyHeatmapProps {
  profileData: FinancialProfileData[];
}

const AnxietyHeatmap: FC<AnxietyHeatmapProps> = ({ profileData }) => {

  const anxietyByAge = useMemo(() => {
    const groups: Record<string, number[]> = {};

    profileData.forEach(p => {
      if (!p.birth_year || !p.financial_anxiety_score) return;

      const age = 2025 - p.birth_year;
      let ageGroup = 'Unknown';
      if (age <= 20) ageGroup = '18-20';
      else if (age <= 23) ageGroup = '21-23';
      else if (age <= 25) ageGroup = '24-25';
      else ageGroup = '>25';

      if (!groups[ageGroup]) groups[ageGroup] = [];
      groups[ageGroup].push(p.financial_anxiety_score);
    });

    return Object.entries(groups)
      .map(([ageGroup, scores]) => ({
        group: ageGroup,
        anxiety: scores.reduce((sum, s) => sum + s, 0) / scores.length,
        count: scores.length
      }))
      .sort((a, b) => {
        const order = ['18-20', '21-23', '24-25', '>25', 'Unknown'];
        return order.indexOf(a.group) - order.indexOf(b.group);
      });
  }, [profileData]);

  const getAnxietyColor = (score: number) => {
    if (score >= 4) return '#ef4444'; // Merah - Tinggi
    if (score >= 3) return '#f59e0b'; // Oranye - Sedang
    return '#10b981'; // Hijau - Rendah
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const level = data.anxiety >= 4 ? 'Tinggi' : data.anxiety >= 3 ? 'Sedang' : 'Rendah';
      return (
        <div className="anxiety-tooltip">
          <p className="anxiety-tooltip__title">{data.group} tahun</p>
          <p className="anxiety-tooltip__score">Kecemasan: {data.anxiety.toFixed(2)}/5</p>
          <p className="anxiety-tooltip__level">Tingkat: {level}</p>
          <p className="anxiety-tooltip__count">{data.count} responden</p>
        </div>
      );
    }
    return null;
  };

  const highestAnxiety = anxietyByAge.reduce((max, curr) =>
    curr.anxiety > max.anxiety ? curr : max, anxietyByAge[0] || { group: 'N/A', anxiety: 0 }
  );

  const lowestAnxiety = anxietyByAge.reduce((min, curr) =>
    curr.anxiety < min.anxiety ? curr : min, anxietyByAge[0] || { group: 'N/A', anxiety: 0 }
  );

  return (
    <div className="anxiety-heatmap">
      <div className="anxiety-heatmap__header">
        <h3 className="anxiety-heatmap__title">
          Kecemasan Finansial berdasarkan Demografi
        </h3>
        <p className="anxiety-heatmap__subtitle">
          Tingkat stres menurut kelompok umur (skala 1-5)
        </p>
      </div>

      {profileData.length === 0 ? (
        <div className="anxiety-heatmap__empty">
          Data tidak tersedia
        </div>
      ) : (
        <>
          <div className="anxiety-heatmap__chart">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={anxietyByAge} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="group" 
                  stroke="#9ca3af"
                  label={{ value: 'Kelompok Umur', position: 'insideBottom', offset: -10, style: { fill: '#9ca3af' } }}
                />
                <YAxis 
                  domain={[0, 5]}
                  stroke="#9ca3af"
                  label={{ value: 'Skor Kecemasan', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="anxiety" radius={[8, 8, 0, 0]}>
                  {anxietyByAge.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getAnxietyColor(entry.anxiety)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Statistik */}
          <div className="anxiety-heatmap__stats">
            <div className="anxiety-stat anxiety-stat--high">
              <p className="anxiety-stat__label">Kecemasan Tertinggi</p>
              <p className="anxiety-stat__group">{highestAnxiety.group}</p>
              <p className="anxiety-stat__value">{highestAnxiety.anxiety.toFixed(1)}/5</p>
            </div>
            <div className="anxiety-stat anxiety-stat--low">
              <p className="anxiety-stat__label">Kecemasan Terendah</p>
              <p className="anxiety-stat__group">{lowestAnxiety.group}</p>
              <p className="anxiety-stat__value">{lowestAnxiety.anxiety.toFixed(1)}/5</p>
            </div>
          </div>

          {/* Insight */}
          <div className="anxiety-heatmap__insight">
            <p className="anxiety-heatmap__insight-text">
              😰 <strong>Peringatan Stres:</strong> Kelompok umur {highestAnxiety.group} menunjukkan tingkat kecemasan tertinggi 
              ({highestAnxiety.anxiety.toFixed(1)}/5), kemungkinan karena tekanan {highestAnxiety.group === '21-23' ? 'transisi karir' : 'kemandirian finansial'}.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AnxietyHeatmap;
