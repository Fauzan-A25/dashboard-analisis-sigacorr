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
import '../../../styles/components/behaviorwellbeing/fintech-app-usage.css';

interface FintechAppUsageProps {
  profileData: FinancialProfileData[];
}

const FintechAppUsage: FC<FintechAppUsageProps> = ({ profileData }) => {
  const appData = useMemo(() => {
    const apps: Record<string, number> = {};

    profileData.forEach(p => {
      const app = p.main_fintech_app || 'Tidak diketahui';
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
    'Tidak diketahui': '#6b7280'
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="fintech-tooltip">
          <p className="fintech-tooltip__title">{data.app}</p>
          <p className="fintech-tooltip__users">Pengguna: {data.count}</p>
          <p className="fintech-tooltip__share">Pangsa Pasar: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fintech-app-usage">
      <div className="fintech-app-usage__header">
        <h3 className="fintech-app-usage__title">
          Penggunaan Aplikasi Fintech Utama
        </h3>
        <p className="fintech-app-usage__subtitle">
          Preferensi dompet digital di antara responden GenZ
        </p>
      </div>

      {profileData.length === 0 ? (
        <div className="fintech-app-usage__empty">
          Tidak ada data
        </div>
      ) : (
        <>
          <div className="fintech-app-usage__chart">
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
                  label={{ value: 'Pengguna', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {appData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[entry.app] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pemimpin Pasar */}
          <div className="fintech-app-usage__stats">
            <div className="fintech-stat fintech-stat--leader">
              <p className="fintech-stat__label">Pemimpin Pasar</p>
              <p className="fintech-stat__app">{appData[0]?.app}</p>
              <p className="fintech-stat__value">{appData[0]?.percentage.toFixed(1)}%</p>
            </div>
            <div className="fintech-stat fintech-stat--runner">
              <p className="fintech-stat__label">Runner-up</p>
              <p className="fintech-stat__app">{appData[1]?.app}</p>
              <p className="fintech-stat__value">{appData[1]?.percentage.toFixed(1)}%</p>
            </div>
            <div className="fintech-stat fintech-stat--total">
              <p className="fintech-stat__label">Total Aplikasi</p>
              <p className="fintech-stat__value fintech-stat__value--large">{appData.length}</p>
            </div>
          </div>

          {/* Insight (Deskriptif, netral) */}
          <div className="fintech-app-usage__insight">
            <p className="fintech-app-usage__insight-text">
              📱 Data menunjukkan bahwa aplikasi <strong>{appData[0]?.app}</strong> merupakan pilihan utama dengan pangsa pasar sekitar {appData[0]?.percentage.toFixed(1)}% di antara responden GenZ, diikuti oleh <strong>{appData[1]?.app}</strong> sekitar {appData[1]?.percentage.toFixed(1)}%. 
              Variasi pilihan menunjukkan dinamika pasar dompet digital pada kelompok ini.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default FintechAppUsage;
