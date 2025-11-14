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
import '../../../styles/components/financialliteracy/question-performance.css';

interface QuestionPerformanceProps {
  surveyData: any[];
}

const QuestionPerformance: FC<QuestionPerformanceProps> = ({ surveyData }) => {

  const questionScores = useMemo(() => {
    if (surveyData.length === 0) return [];

    const scores = [];
    for (let i = 1; i <= 48; i++) {
      const qKey = `Q${i}`;
      const total = surveyData.reduce((sum, row) => sum + (row[qKey] || 0), 0);
      const avg = total / surveyData.length;

      let dimension = '';
      if (i <= 9) dimension = 'Pengetahuan Finansial';
      else if (i <= 18) dimension = 'Literasi Digital';
      else if (i <= 29) dimension = 'Perilaku Finansial';
      else if (i <= 39) dimension = 'Pengambilan Keputusan';
      else dimension = 'Kesejahteraan';

      scores.push({
        question: qKey,
        score: avg,
        dimension,
        percentage: (avg / 4) * 100
      });
    }

    return scores.sort((a, b) => a.score - b.score);
  }, [surveyData]);

  const worstQuestions = questionScores.slice(0, 10);
  const bestQuestions = questionScores.slice(-10).reverse();

  const dimensionColors: Record<string, string> = {
    'Pengetahuan Finansial': '#3b82f6',
    'Literasi Digital': '#10b981',
    'Perilaku Finansial': '#f59e0b',
    'Pengambilan Keputusan': '#8b5cf6',
    'Kesejahteraan': '#ec4899'
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="question-performance-tooltip">
          <p className="question-performance-tooltip__title">{data.question}</p>
          <p className="question-performance-tooltip__average">Rata-rata: {data.score.toFixed(2)}/4</p>
          <p className="question-performance-tooltip__percentage">Persentase: {data.percentage.toFixed(1)}%</p>
          <p className="question-performance-tooltip__dimension">{data.dimension}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="question-performance">
      <div className="question-performance__header">
        <h3 className="question-performance__title">
          Analisis Performa Pertanyaan
        </h3>
        <p className="question-performance__subtitle">
          10 Pertanyaan dengan Performa Terendah dan Tertinggi (Q1-Q48)
        </p>
      </div>

      {surveyData.length === 0 ? (
        <div className="question-performance__empty">
          Tidak ada data
        </div>
      ) : (
        <div className="question-performance__charts">

          {/* 10 Pertanyaan Terendah */}
          <div className="question-performance-section">
            <h4 className="question-performance-section__title question-performance-section__title--worst">
              <span className="question-performance-section__icon">⚠️</span>
              Pertanyaan dengan Skor Terendah
            </h4>
            <div className="question-performance-section__chart">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={worstQuestions}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    type="number"
                    domain={[0,4]}
                    stroke="#9ca3af"
                    label={{ value: 'Rata-rata Skor', position: 'insideBottom', offset: -5, style: { fill: '#9ca3af' } }}
                  />
                  <YAxis
                    type="category"
                    dataKey="question"
                    stroke="#9ca3af"
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" radius={[0,4,4,0]}>
                    {worstQuestions.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={dimensionColors[entry.dimension] || '#6b7280'}
                        opacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 10 Pertanyaan Tertinggi */}
          <div className="question-performance-section">
            <h4 className="question-performance-section__title question-performance-section__title--best">
              <span className="question-performance-section__icon">✅</span>
              Pertanyaan dengan Skor Tertinggi
            </h4>
            <div className="question-performance-section__chart">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={bestQuestions}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    type="number"
                    domain={[0,4]}
                    stroke="#9ca3af"
                    label={{ value: 'Rata-rata Skor', position: 'insideBottom', offset: -5, style: { fill: '#9ca3af' } }}
                  />
                  <YAxis
                    type="category"
                    dataKey="question"
                    stroke="#9ca3af"
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" radius={[0,4,4,0]}>
                    {bestQuestions.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={dimensionColors[entry.dimension] || '#6b7280'}
                        opacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Insight */}
      {surveyData.length > 0 && (
        <div className="question-performance__insight">
          <p className="question-performance__insight-text">
            🎯 <strong>Area Fokus:</strong> Pertanyaan {worstQuestions[0]?.question} sampai {worstQuestions[2]?.question} memiliki skor terendah (rata-rata {worstQuestions[0]?.score.toFixed(2)}/4),
            menunjukkan ada kesenjangan pengetahuan pada domain {' '}{worstQuestions[0]?.dimension}.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionPerformance;
