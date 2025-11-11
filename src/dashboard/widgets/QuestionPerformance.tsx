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

interface QuestionPerformanceProps {
  surveyData: any[];
}

const QuestionPerformance: FC<QuestionPerformanceProps> = ({ surveyData }) => {
  
  /**
   * Calculate average score per question (Q1-Q48)
   */
  const questionScores = useMemo(() => {
    if (surveyData.length === 0) return [];
    
    const scores = [];
    for (let i = 1; i <= 48; i++) {
      const qKey = `Q${i}`;
      const total = surveyData.reduce((sum, row) => sum + (row[qKey] || 0), 0);
      const avg = total / surveyData.length;
      
      // Determine dimension
      let dimension = '';
      if (i <= 9) dimension = 'Financial Knowledge';
      else if (i <= 18) dimension = 'Digital Literacy';
      else if (i <= 29) dimension = 'Financial Behavior';
      else if (i <= 39) dimension = 'Decision Making';
      else dimension = 'Well-being';
      
      scores.push({
        question: qKey,
        score: avg,
        dimension,
        percentage: (avg / 4) * 100 // Convert to percentage
      });
    }
    
    return scores.sort((a, b) => a.score - b.score); // Sort by lowest first
  }, [surveyData]);

  // Get worst 10 and best 10
  const worstQuestions = questionScores.slice(0, 10);
  const bestQuestions = questionScores.slice(-10).reverse();

  const dimensionColors: Record<string, string> = {
    'Financial Knowledge': '#3b82f6',
    'Digital Literacy': '#10b981',
    'Financial Behavior': '#f59e0b',
    'Decision Making': '#8b5cf6',
    'Well-being': '#ec4899'
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold mb-1">{data.question}</p>
          <p className="text-blue-400 text-sm">Average: {data.score.toFixed(2)}/4</p>
          <p className="text-green-400 text-sm">Percentage: {data.percentage.toFixed(1)}%</p>
          <p className="text-gray-400 text-xs mt-1">{data.dimension}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          Question Performance Analysis
        </h3>
        <p className="text-sm text-gray-400">
          Best and worst performing questions (Q1-Q48)
        </p>
      </div>

      {surveyData.length === 0 ? (
        <div className="h-[400px] flex items-center justify-center text-gray-500">
          No data available
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Worst 10 Questions */}
          <div>
            <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              Lowest Scoring Questions
            </h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={worstQuestions}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="number" 
                  domain={[0, 4]}
                  stroke="#9ca3af"
                  label={{ value: 'Avg Score', position: 'insideBottom', offset: -5, style: { fill: '#9ca3af' } }}
                />
                <YAxis 
                  type="category" 
                  dataKey="question"
                  stroke="#9ca3af"
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
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

          {/* Best 10 Questions */}
          <div>
            <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
              <span className="text-xl">✅</span>
              Highest Scoring Questions
            </h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={bestQuestions}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="number" 
                  domain={[0, 4]}
                  stroke="#9ca3af"
                  label={{ value: 'Avg Score', position: 'insideBottom', offset: -5, style: { fill: '#9ca3af' } }}
                />
                <YAxis 
                  type="category" 
                  dataKey="question"
                  stroke="#9ca3af"
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
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
      )}

      {/* Insight */}
      {surveyData.length > 0 && (
        <div className="mt-6 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <p className="text-sm text-orange-300">
            🎯 <strong>Focus Area:</strong> Questions {worstQuestions[0]?.question} to {worstQuestions[2]?.question} 
            score lowest (avg {worstQuestions[0]?.score.toFixed(2)}/4), indicating knowledge gaps in 
            {' '}{worstQuestions[0]?.dimension} domain.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionPerformance;
