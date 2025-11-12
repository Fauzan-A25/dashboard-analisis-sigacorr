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
import type { FinancialProfileData } from '../../services/dataTypes';

interface FintechAppUsageProps {
  profileData: FinancialProfileData[];
}

const FintechAppUsage: FC<FintechAppUsageProps> = ({ profileData }) => {
  
  const appData = useMemo(() => {
    const apps: Record<string, number> = {};
    
    profileData.forEach(p => {
      const app = p.main_fintech_app || 'Unknown';
      apps[app] = (apps[app] || 0) + 1;
    });
    
    return Object.entries(apps)
      .map(([app, count]) => ({
        app,
        count,
        percentage: (count / profileData.length) * 100
      }))
      .sort((a, b) => b.count - a.count);
  }, [profileData]);

  const colors: Record<string, string> = {
    'GoPay': '#00AA13',
    'OVO': '#4B2995',
    'Dana': '#108EE9',
    'ShopeePay': '#EE4D2D',
    'LinkAja': '#ED1C24',
    'Unknown': '#6b7280'
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-semibold mb-1">{data.app}</p>
          <p className="text-blue-400 text-sm">Users: {data.count}</p>
          <p className="text-green-400 text-sm">Market Share: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          Main Fintech App Usage
        </h3>
        <p className="text-sm text-gray-400">
          Digital wallet preferences among GenZ respondents
        </p>
      </div>

      {profileData.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          No data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={appData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="app" 
                stroke="#9ca3af"
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#9ca3af"
                label={{ value: 'Users', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {appData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[entry.app] || '#6b7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Market Leader */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-300 mb-1">Market Leader</p>
              <p className="text-lg font-bold text-green-400">{appData[0]?.app}</p>
              <p className="text-2xl font-bold text-green-300">{appData[0]?.percentage.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300 mb-1">Runner-up</p>
              <p className="text-lg font-bold text-blue-400">{appData[1]?.app}</p>
              <p className="text-2xl font-bold text-blue-300">{appData[1]?.percentage.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-xs text-purple-300 mb-1">Total Apps</p>
              <p className="text-3xl font-bold text-purple-400">{appData.length}</p>
            </div>
          </div>

          {/* Insight */}
          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              📱 <strong>App Dominance:</strong> {appData[0]?.app} leads with {appData[0]?.percentage.toFixed(0)}% market share, 
              followed by {appData[1]?.app} at {appData[1]?.percentage.toFixed(0)}%. 
              Strong brand loyalty observed in digital payment space.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default FintechAppUsage;
