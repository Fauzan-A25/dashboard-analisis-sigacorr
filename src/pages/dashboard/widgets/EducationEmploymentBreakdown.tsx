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
import type { FinancialProfileData } from '../../../services/dataTypes';
import '../../../styles/components/dashboard/education-employment-breakdown.css';

interface EducationEmploymentBreakdownProps {
  profileData: FinancialProfileData[];
}

const EducationEmploymentBreakdown: FC<EducationEmploymentBreakdownProps> = ({ profileData }) => {

  const chartData = useMemo(() => {
    const breakdown: Record<string, Record<string, number>> = {};

    profileData.forEach(p => {
      const edu = p.education_level || 'Tidak diketahui';
      const emp = p.employment_status || 'Tidak diketahui';

      if (!breakdown[edu]) breakdown[edu] = {};
      breakdown[edu][emp] = (breakdown[edu][emp] || 0) + 1;
    });

    return Object.entries(breakdown)
      .map(([education, employmentCounts]) => ({
        education: education.replace('Bachelor (S1)/Diploma IV', 'Sarjana/D-IV')
                           .replace('Senior High School', 'SMA')
                           .replace('Junior High School', 'SMP')
                           .replace('Elementary School', 'SD')
                           .replace('Diploma I/II/III', 'Diploma'),
        fullEducation: education,
        ...employmentCounts,
        total: Object.values(employmentCounts).reduce((sum, count) => sum + count, 0)
      }))
      .sort((a, b) => b.total - a.total);
  }, [profileData]);

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
        <div className="edu-employment-tooltip">
          <p className="edu-employment-tooltip__title">{label}</p>
          {payload
            .sort((a: any, b: any) => b.value - a.value)
            .map((entry: any, index: number) => (
              <div key={index} className="edu-employment-tooltip__item">
                <div className="edu-employment-tooltip__label">
                  <div 
                    className="edu-employment-tooltip__dot" 
                    style={{ backgroundColor: entry.fill }}
                  />
                  <span className="edu-employment-tooltip__name">{entry.name}</span>
                </div>
                <span className="edu-employment-tooltip__value" style={{ color: entry.fill }}>
                  {entry.value} ({((entry.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
          ))}
          <div className="edu-employment-tooltip__footer">
            <p className="edu-employment-tooltip__total">Total: {total}</p>
          </div>
        </div>
      );
    }
    return null;
  };

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

  const mostCommon = chartData[0];
  const studentPercentage = (stats.totalStudents / profileData.length) * 100;

  return (
    <div className="edu-employment-breakdown">
      <div className="edu-employment-breakdown__header">
        <h3 className="edu-employment-breakdown__title">
          Rincian Pendidikan & Status Pekerjaan
        </h3>
        <p className="edu-employment-breakdown__subtitle">
          Distribusi status pekerjaan berdasarkan tingkat pendidikan
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="edu-employment-breakdown__empty">
          Tidak ada data
        </div>
      ) : (
        <>
          <div className="edu-employment-breakdown__chart">
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
                    value: 'Jumlah Responden', 
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
          </div>

          <div className="edu-employment-breakdown__stats">
            <div className="edu-stat edu-stat--students">
              <p className="edu-stat__label">Mahasiswa</p>
              <p className="edu-stat__value">
                {stats.totalStudents}
              </p>
              <p className="edu-stat__meta">
                {studentPercentage.toFixed(1)}% masih bersekolah
              </p>
            </div>
            <div className="edu-stat edu-stat--common">
              <p className="edu-stat__label">Paling Umum</p>
              <p className="edu-stat__value edu-stat__value--small">
                {mostCommon?.fullEducation || 'N/A'}
              </p>
              <p className="edu-stat__meta">
                {mostCommon?.total || 0} responden ({((mostCommon?.total || 0) / profileData.length * 100).toFixed(1)}%)
              </p>
            </div>
            <div className="edu-stat edu-stat--working">
              <p className="edu-stat__label">Bekerja</p>
              <p className="edu-stat__value">
                {stats.totalWorking}
              </p>
              <p className="edu-stat__meta">
                {((stats.totalWorking / profileData.length) * 100).toFixed(1)}% bekerja
              </p>
            </div>
          </div>

          <div className="edu-employment-breakdown__insights">
            <div className="edu-insight edu-insight--education">
              <p className="edu-insight__text">
                📚 <strong>Insight #3:</strong> {studentPercentage.toFixed(0)}% adalah mahasiswa, 
                menunjukkan sebagian besar GenZ berusia sekolah atau tahap awal karier - saat tepat untuk program edukasi keuangan.
              </p>
            </div>
            <div className="edu-insight edu-insight--career">
              <p className="edu-insight__text">
                💼 <strong>Insight #4:</strong> Dengan {stats.totalSMA} dari latar belakang SMA 
                ({((stats.totalSMA / profileData.length) * 100).toFixed(0)}%), 
                demografis ini memerlukan inisiatif literasi keuangan yang ditargetkan untuk stabilitas masa depan.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EducationEmploymentBreakdown;
