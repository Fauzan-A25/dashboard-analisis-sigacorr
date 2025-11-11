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
import { calculateFinancialLiteracyScore } from '../metrics';

interface LiteracyByDemographicsProps {
  surveyData: any[];
}

const LiteracyByDemographics: FC<LiteracyByDemographicsProps> = ({ surveyData }) => {
  
  /**
   * Calculate literacy by age group
   */
  const byAgeGroup = useMemo(() => {
    const groups: Record<string, number[]> = {};
    
    surveyData.forEach(row => {
      const birthYear = row['Year of Birth'] || row.birth_year;
      if (!birthYear) return;
      
      const age = 2025 - birthYear;
      let ageGroup = 'Unknown';
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
    
    return Object.entries(groups).map(([ageGroup, scores]) => ({
      group: ageGroup,
      score: scores.reduce((sum, s) => sum + s, 0) / scores.length,
      count: scores.length
    })).sort((a, b) => {
      const order = ['18-20', '21-23', '24-25', '>25', 'Unknown'];
      return order.indexOf(a.group) - order.indexOf(b.group);
    });
  }, [surveyData]);

  /**
   * Calculate literacy by education level
   */
  const byEducation = useMemo(() => {
    const groups: Record<string, number[]> = {};
    
    surveyData.forEach(row => {
      const education = row['Last Education'] || row.education_level || 'Unknown';
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
                       .replace('Bachelor (S1)/Diploma IV', 'Bachelor'),
        score: scores.reduce((sum, s) => sum + s, 0) / scores.length,
        count: scores.length
      }))
      .sort((a, b) => b.score - a.score);
  }, [surveyData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold mb-1">{label}</p>
          <p className="text-blue-400 text-sm">Avg Literacy: {data.score.toFixed(2)}/4</p>
          <p className="text-gray-400 text-xs mt-1">Sample: {data.count} respondents</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          Literacy by Demographics
        </h3>
        <p className="text-sm text-gray-400">
          Compare financial literacy across different demographic groups
        </p>
      </div>

      {surveyData.length === 0 ? (
        <div className="h-[400px] flex items-center justify-center text-gray-500">
          No data available
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* By Age Group */}
          <div>
            <h4 className="text-sm font-semibold text-blue-400 mb-3">By Age Group</h4>
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
                  label={{ value: 'Literacy Score', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
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

          {/* By Education Level */}
          <div>
            <h4 className="text-sm font-semibold text-green-400 mb-3">By Education Level</h4>
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
                  label={{ value: 'Literacy Score', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
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
      )}

      {/* Insights */}
      {surveyData.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              📊 <strong>Age Insight:</strong> {byAgeGroup[0]?.group} group scores 
              {' '}{byAgeGroup[0]?.score > 2.5 ? 'highest' : 'lowest'} with {byAgeGroup[0]?.score.toFixed(2)}/4
            </p>
          </div>
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-300">
              🎓 <strong>Education Insight:</strong> {byEducation[0]?.group} shows highest literacy 
              ({byEducation[0]?.score.toFixed(2)}/4)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiteracyByDemographics;
