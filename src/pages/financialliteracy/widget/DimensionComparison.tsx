import { type FC, useMemo, useState, useEffect } from 'react';
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
  // Validasi awal - return early jika data tidak valid
  if (!surveyData || !Array.isArray(surveyData)) {
    return (
      <div className="dimension-comparison">
        <div className="dimension-comparison__header">
          <h3 className="dimension-comparison__title">Perbandingan Dimensi Menurut Pendidikan</h3>
        </div>
        <div className="dimension-comparison__empty">Tidak ada data tersedia</div>
      </div>
    );
  }

  // Ekstrak kolom pertanyaan dengan pengecekan
  const questionCols = useMemo(() => {
    if (!surveyData || surveyData.length === 0) return [];
    
    const firstRow = surveyData[0];
    if (!firstRow || typeof firstRow !== 'object') return [];
    
    const keys = Object.keys(firstRow);
    // Pastikan slice tidak melebihi panjang array
    const startIdx = Math.min(9, keys.length);
    const endIdx = Math.min(57, keys.length);
    
    return keys.slice(startIdx, endIdx);
  }, [surveyData]);

  // Ekstrak level pendidikan unik
  const educationLevels = useMemo(() => {
    if (!surveyData || surveyData.length === 0) return [];
    
    const eduSet = new Set<string>();
    surveyData.forEach(row => {
      if (!row) return;
      
      const edu = row['Last Education'];
      if (edu != null && edu.toString().trim() !== '') {
        eduSet.add(edu.toString().trim());
      }
    });
    return Array.from(eduSet).sort();
  }, [surveyData]);

  const [edu1, setEdu1] = useState('');
  const [edu2, setEdu2] = useState('');

  // Set initial values setelah educationLevels tersedia
  useEffect(() => {
    if (educationLevels.length > 0 && !edu1) {
      setEdu1(educationLevels[0]);
    }
    if (educationLevels.length > 1 && !edu2) {
      setEdu2(educationLevels[1]);
    }
  }, [educationLevels, edu1, edu2]);

  // Kelompokkan data berdasarkan pendidikan
  const groups = useMemo(() => {
    if (!surveyData || surveyData.length === 0) return {};
    
    const grouped: Record<string, any[]> = {};
    
    educationLevels.forEach(edu => {
      grouped[edu] = [];
    });

    surveyData.forEach(row => {
      if (!row) return;
      
      const edu = row['Last Education']?.toString().trim() || 'Unknown';
      if (!grouped[edu]) {
        grouped[edu] = [];
      }
      grouped[edu].push(row);
    });

    return grouped;
  }, [surveyData, educationLevels]);

  // Fungsi untuk menghitung dimensi
  const calculateDimensions = useMemo(() => {
    return (data: any[]) => {
      const calcDim = (startQ: number, endQ: number) => {
        // Validasi data
        if (!data || !Array.isArray(data) || data.length === 0) return 0;
        if (!questionCols || questionCols.length === 0) return 0;

        const questionCount = endQ - startQ + 1;
        
        const total = data.reduce((acc, row) => {
          if (!row) return acc;
          
          const sum = Array.from({ length: questionCount }, (_, i) => {
            const keyIndex = startQ - 1 + i;
            // Pastikan index tidak melebihi panjang questionCols
            if (keyIndex >= questionCols.length) return 0;
            
            const key = questionCols[keyIndex];
            const val = row[key];
            return val != null && !isNaN(Number(val)) ? Number(val) : 0;
          }).reduce((a, b) => a + b, 0);
          
          return acc + sum;
        }, 0);

        if (data.length === 0 || questionCount === 0) return 0;
        
        const avg = total / (data.length * questionCount);
        // Normalisasi 0-25 (asumsi skala 1-4)
        return ((avg - 1) / 3) * 25;
      };

      return {
        'Pengetahuan Finansial': calcDim(1, 9),
        'Literasi Digital': calcDim(10, 18),
        'Perilaku Finansial': calcDim(19, 29),
        'Pengambilan Keputusan': calcDim(30, 39),
        'Kesejahteraan': calcDim(40, 48)
      };
    };
  }, [questionCols]);

  // Hitung skor untuk setiap pendidikan
  const scoresEdu1 = useMemo(() => {
    if (!edu1 || !groups[edu1]) return {};
    return calculateDimensions(groups[edu1]);
  }, [edu1, groups, calculateDimensions]);

  const scoresEdu2 = useMemo(() => {
    if (!edu2 || !groups[edu2]) return {};
    return calculateDimensions(groups[edu2]);
  }, [edu2, groups, calculateDimensions]);

  // Data untuk chart
  const comparisonData = useMemo(() => {
    if (educationLevels.length < 2 || !edu1 || !edu2) return [];
    
    return Object.keys(scoresEdu1).map(dimension => ({
      dimension,
      [edu1]: scoresEdu1[dimension as keyof typeof scoresEdu1] || 0,
      [edu2]: scoresEdu2[dimension as keyof typeof scoresEdu2] || 0
    }));
  }, [educationLevels, edu1, edu2, scoresEdu1, scoresEdu2]);

  // Custom Tooltip
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

  // Handle perubahan edu1
  const handleEdu1Change = (val: string) => {
    setEdu1(val);
    if (val === edu2) {
      const newEdu2 = educationLevels.find(el => el !== val) || '';
      setEdu2(newEdu2);
    }
  };

  // Handle perubahan edu2
  const handleEdu2Change = (val: string) => {
    setEdu2(val);
  };

  return (
    <div className="dimension-comparison">
      <div className="dimension-comparison__header">
        <h3 className="dimension-comparison__title">Perbandingan Dimensi Menurut Pendidikan</h3>
        <p className="dimension-comparison__subtitle">
          Perbandingan 5 dimensi literasi keuangan berdasarkan tingkat pendidikan
        </p>
      </div>

      {educationLevels.length < 2 ? (
        <div className="dimension-comparison__empty">
          Tidak cukup data pendidikan untuk perbandingan (minimal 2 tingkat pendidikan)
        </div>
      ) : (
        <>
          <div className="dimension-comparison__controls" style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <CustomSelect
                id="edu1-select"
                label="Pendidikan 1"
                value={edu1}
                onChange={handleEdu1Change}
                options={educationLevels.map(lvl => ({ value: lvl, label: lvl }))}
                placeholder="Pilih Pendidikan 1"
              />
            </div>
            <div style={{ flex: 1 }}>
              <CustomSelect
                id="edu2-select"
                label="Pendidikan 2"
                value={edu2}
                onChange={handleEdu2Change}
                options={educationLevels.filter(lvl => lvl !== edu1).map(lvl => ({ value: lvl, label: lvl }))}
                placeholder="Pilih Pendidikan 2"
              />
            </div>
          </div>

          <div className="dimension-comparison__chart">
            {surveyData.length === 0 || comparisonData.length === 0 ? (
              <div className="dimension-comparison__empty">Tidak ada data untuk ditampilkan</div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={comparisonData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="dimension" stroke="#9ca3af" />
                  <PolarRadiusAxis angle={90} domain={[0, 25]} stroke="#9ca3af" />
                  <Radar 
                    name={edu1} 
                    dataKey={edu1} 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3} 
                  />
                  <Radar 
                    name={edu2} 
                    dataKey={edu2} 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '16px' }} iconType="circle" />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DimensionComparison;
