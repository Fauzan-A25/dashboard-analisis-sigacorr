import { type FC, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { FinancialProfileData } from '../../services/dataTypes';

interface EducationEmploymentBreakdownProps {
  profileData: FinancialProfileData[];
}

const EducationEmploymentBreakdown: FC<EducationEmploymentBreakdownProps> = ({ profileData }) => {
  
  const chartData = useMemo(() => {
    const breakdown: Record<string, Record<string, number>> = {};
    
    profileData.forEach(p => {
      const edu = p.education_level || 'Unknown';
      const emp = p.employment_status || 'Unknown';
      
      if (!breakdown[edu]) breakdown[edu] = {};
      breakdown[edu][emp] = (breakdown[edu][emp] || 0) + 1;
    });
    
    // Convert to array format and sort by total (descending)
    return Object.entries(breakdown)
      .map(([education, employmentCounts]) => ({
        education: education.replace('Bachelor (S1)/Diploma IV', 'Bachelor/D-IV') // Shorten label
                          .replace('Senior High School', 'SMA')
                          .replace('Junior High School', 'SMP')
                          .replace('Elementary School', 'SD')
                          .replace('Diploma I/II/III', 'Diploma'),
        fullEducation: education,
        ...employmentCounts,
        total: Object.values(employmentCounts).reduce((sum, count) => sum + count, 0)
      }))
      .sort((a, b) => b.total - a.total); // Sort by most common education
  }, [profileData]);

  // Get all unique employment statuses
  const employmentStatuses = useMemo(() => {
    const statuses = new Set<string>();
    chartData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'education' && key !== 'fullEducation' && key !== 'total') {
          statuses.add(key);
        }
      });
    });
    return Array.from(statuses);
  }, [chartData]);

  const statusColors: Record<string, string> = {
    'Student': '#3b82f6',
    'Private Employee': '#10b981',
    'Civil Servant/BUMN': '#8b5cf6',
    'Entrepreneur': '#f59e0b',
    'Not Working': '#6b7280',
    'Unemployed': '#ef4444',
    'Unknown': '#94a3b8'
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 p-3 rounded-lg shadow-xl max-w-xs">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload
            .sort((a: any, b: any) => b.value - a.value) // Sort by count
            .map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-3 py-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: entry.fill }}
                  />
                  <span className="text-xs text-gray-300">{entry.name}</span>
                </div>
                <span className="text-sm font-semibold" style={{ color: entry.fill }}>
                  {entry.value} ({((entry.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          <div className="border-t border-gray-700 mt-2 pt-2">
            <p className="text-xs text-gray-400">Total: {total}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalStudents = profileData.filter(p => p.employment_status === 'Student').length;
    const totalSMA = chartData.find(d => d.fullEducation === 'Senior High School')?.total || 0;
    const totalWorking = profileData.filter(p => 
      p.employment_status === 'Private Employee' || 
      p.employment_status === 'Civil Servant/BUMN' || 
      p.employment_status === 'Entrepreneur'
    ).length;
    
    return { totalStudents, totalSMA, totalWorking };
  }, [profileData, chartData]);

  // Most common education level
  const mostCommon = chartData[0]; // Already sorted by total
  const studentPercentage = (stats.totalStudents / profileData.length) * 100;

  return (
    <div className="glass-panel p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          Education & Employment Status Breakdown
        </h3>
        <p className="text-sm text-gray-400">
          Distribution of employment status across education levels
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[400px] flex items-center justify-center text-gray-500">
          No data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart 
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="education" 
                angle={-35}
                textAnchor="end"
                height={80}
                stroke="#9ca3af"
                interval={0}
                style={{ fontSize: '11px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                label={{ 
                  value: 'Number of Respondents', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: '#9ca3af', fontSize: 12 }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '15px' }}
                iconType="square"
              />
              
              {employmentStatuses.map((status) => (
                <Bar 
                  key={status}
                  dataKey={status}
                  stackId="a"
                  fill={statusColors[status] || '#6b7280'}
                  name={status}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>

          {/* Summary Stats - More Contextual */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300 mb-1">Students</p>
              <p className="text-2xl font-bold text-blue-400">
                {stats.totalStudents}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {studentPercentage.toFixed(1)}% still in school
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-xs text-purple-300 mb-1">Most Common</p>
              <p className="text-sm font-bold text-purple-400 leading-tight">
                {mostCommon?.fullEducation || 'N/A'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {mostCommon?.total || 0} respondents ({((mostCommon?.total || 0) / profileData.length * 100).toFixed(1)}%)
              </p>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-300 mb-1">Working</p>
              <p className="text-2xl font-bold text-green-400">
                {stats.totalWorking}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {((stats.totalWorking / profileData.length) * 100).toFixed(1)}% employed
              </p>
            </div>
          </div>

          {/* Enhanced Insights */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-300">
                📚 <strong>Insight #3:</strong> {studentPercentage.toFixed(0)}% are students, 
                indicating most GenZ are in school age or early career stages - prime time for 
                financial education programs.
              </p>
            </div>
            <div className="p-3 bg-pink-500/10 border border-pink-500/30 rounded-lg">
              <p className="text-sm text-pink-300">
                💼 <strong>Insight #4:</strong> With {stats.totalSMA} from SMA background 
                ({((stats.totalSMA / profileData.length) * 100).toFixed(0)}%), 
                this demographic needs targeted financial literacy initiatives for future stability.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EducationEmploymentBreakdown;
