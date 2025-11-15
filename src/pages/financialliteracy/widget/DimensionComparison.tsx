import { type FC, useMemo, useState } from 'react';
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
import CustomSelect from '../../../components/common/CustomSelect';

interface DimensionComparisonProps {
  surveyData: any[];
}

const DimensionComparison: FC<DimensionComparisonProps> = ({ surveyData }) => {
  const questionCols = useMemo(() => (
    surveyData.length > 0 ? Object.keys(surveyData[0]).slice(9, 57) : []
  ), [surveyData]);

  const educationLevels = useMemo(() => {
    const eduSet = new Set<string>();
    surveyData.forEach(row => {
      if (row['Last Education'] != null && row['Last Education'].toString().trim() !== '') {
        eduSet.add(row['Last Education'].toString().trim());
      }
    });
    return Array.from(eduSet);
  }, [surveyData]);

  const [edu1, setEdu1] = useState(educationLevels[0] || '');
  const [edu2, setEdu2] = useState(educationLevels.length > 1 ? educationLevels[1] : '');

  const groups: Record<string, any[]> = {};
  educationLevels.forEach(edu => { groups[edu] = []; });
  surveyData.forEach(row => {
    const edu = row['Last Education'] ? row['Last Education'].toString().trim() : 'Unknown';
    if (!(edu in groups)) { groups[edu] = []; }
    groups[edu].push(row);
  });

  const calculateDimensions = (data: any[]) => {
    const calcDim = (startQ: number, endQ: number) => {
      const questionCount = endQ - startQ + 1;
      if (data.length === 0) return 0;
      const total = data.reduce((acc, row) => {
        const sum = Array.from({ length: questionCount }, (_, i) => {
          const key = questionCols[startQ - 1 + i];
          const val = row[key];
          return val && !isNaN(val) ? Number(val) : 0;
        }).reduce((a, b) => a + b, 0);
        return acc + sum;
      }, 0);
      const avg = total / (data.length * questionCount);
      return ((avg - 1) / 3) * 25; // normalisasi 0-25
    };

    return {
      'Pengetahuan Finansial': calcDim(1, 9),
      'Literasi Digital': calcDim(10, 18),
      'Perilaku Finansial': calcDim(19, 29),
      'Pengambilan Keputusan': calcDim(30, 39),
      'Kesejahteraan': calcDim(40, 48)
    };
  };

  const scoresEdu1 = edu1 ? calculateDimensions(groups[edu1]) : {};
  const scoresEdu2 = edu2 ? calculateDimensions(groups[edu2]) : {};

  const comparisonData = educationLevels.length >= 2 ? Object.keys(scoresEdu1).map(dimension => ({
    dimension,
    [edu1]: scoresEdu1[dimension as keyof typeof scoresEdu1] || 0,
    [edu2]: scoresEdu2[dimension as keyof typeof scoresEdu2] || 0
  })) : [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="dimension-tooltip">
          <p className="dimension-tooltip__title">{payload[0].payload.dimension}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} style={{ color: entry.stroke }} className="dimension-tooltip__item">
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
        <h3 className="dimension-comparison__title">Perbandingan Dimensi Menurut Pendidikan</h3>
        <p className="dimension-comparison__subtitle">
          Perbandingan 5 dimensi literasi keuangan berdasarkan tingkat pendidikan
        </p>
      </div>

      <div className="dimension-comparison__controls" style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <label>
            <CustomSelect
              id="edu1-select"
              label="Pendidikan 1"
              value={edu1}
              onChange={(val) => {
                setEdu1(val);
                if (val === edu2) {
                  const newEdu2 = educationLevels.find(el => el !== val) || '';
                  setEdu2(newEdu2);
                }
              }}
              options={educationLevels.map(lvl => ({ value: lvl, label: lvl }))}
              placeholder="Pilih Pendidikan 1"
            />
          </label>
        </div>
        <div style={{ flex: 1 }}>
          <label>
            <CustomSelect
              id="edu2-select"
              label="Pendidikan 2"
              value={edu2}
              onChange={(val) => setEdu2(val)}
              options={educationLevels.filter(lvl => lvl !== edu1).map(lvl => ({ value: lvl, label: lvl }))}
              placeholder="Pilih Pendidikan 2"
            />
          </label>
        </div>
      </div>

      <div className="dimension-comparison__chart">
        {surveyData.length === 0 ? (
          <div className="dimension-comparison__empty">Tidak ada data</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={comparisonData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="dimension" stroke="#9ca3af" />
              <PolarRadiusAxis angle={90} domain={[0, 25]} stroke="#9ca3af" />
              <Radar name={edu1} dataKey={edu1} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name={edu2} dataKey={edu2} stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '16px' }} iconType="circle" />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default DimensionComparison;
