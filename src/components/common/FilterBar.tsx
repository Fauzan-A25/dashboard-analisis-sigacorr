import { type FC, useMemo } from 'react';
import '../../styles/components/filter-bar.css';
import type { FinancialProfileData } from '../../services/dataTypes';
import { getAgeGroup as computeAgeGroup } from '../../utils/helpers';
import CustomSelect from './CustomSelect';

interface FilterBarProps {
  filters: {
    province: string;
    education: string;
    income: string;
    ageGroup: string;
  };
  onFilterChange: (filters: {
    province: string;
    education: string;
    income: string;
    ageGroup: string;
  }) => void;
  profileData?: FinancialProfileData[];
  surveyData?: any[];
}

const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

const INCOME_BUCKETS = [
  { value: '<2M', label: '< Rp2Jt', pattern: /< Rp2\.000\.000/ },
  { value: '2M-4M', label: 'Rp2Jt - Rp4Jt', pattern: /Rp2\.000\.001.*Rp4\.000\.000/ },
  { value: '4M-6M', label: 'Rp4Jt - Rp6Jt', pattern: /Rp4\.000\.001.*Rp6\.000\.000/ },
  { value: '6M-10M', label: 'Rp6Jt - Rp10Jt', pattern: /Rp6\.000\.001.*Rp10\.000\.000/ },
  { value: '10M-15M', label: 'Rp10Jt - Rp15Jt', pattern: /Rp10\.000\.001.*Rp15\.000\.000/ },
  { value: '>15M', label: '> Rp15Jt', pattern: /> Rp15\.000\.000/ },
] as const;

const AGE_GROUP_LABELS: Record<string, string> = {
  '13-17': '13-17 tahun',
  '18-20': '18-20 tahun',
  '21-23': '21-23 tahun',
  '24-25': '24-25 tahun',
  '>25': 'Di atas 25 tahun',
};

const FilterBar: FC<FilterBarProps> = ({ 
  filters, 
  onFilterChange, 
  profileData = [],
  surveyData = []
}) => {
  
  const filterOptions = useMemo(() => {
    console.log('🔄 Menghitung ulang opsi filter...');
    
    const surveyProvinces = surveyData
      .slice(0, 500)
      .map((s: any) => s['Province of Origin'] || s.province)
      .filter((val): val is string => Boolean(val));
    
    const profileProvinces = profileData
      .slice(0, 500)
      .map(p => p.province)
      .filter((val): val is string => Boolean(val));
    
    const provinces = uniq([...surveyProvinces, ...profileProvinces]).sort();

    const surveyEducation = surveyData
      .slice(0, 500)
      .map((s: any) => s['Last Education'] || s.education_level)
      .filter((val): val is string => Boolean(val));
    
    const profileEducation = profileData
      .slice(0, 500)
      .map(p => p.education_level)
      .filter((val): val is string => Boolean(val));
    
    const educationLevels = uniq([...surveyEducation, ...profileEducation]).sort();

    const surveyAgeGroups = surveyData
      .slice(0, 500)
      .filter((s: any) => typeof s['Year of Birth'] === 'number' || typeof s.birth_year === 'number')
      .map((s: any) => {
        const birthYear = s['Year of Birth'] || s.birth_year;
        return computeAgeGroup(birthYear);
      });
    
    const profileAgeGroups = profileData
      .slice(0, 500)
      .filter(p => typeof p.birth_year === 'number')
      .map(p => computeAgeGroup(p.birth_year!));
    
    const ageGroups = uniq([...surveyAgeGroups, ...profileAgeGroups])
      .sort((a, b) => {
        const order = ['13-17', '18-20', '21-23', '24-25', '>25'];
        return order.indexOf(a) - order.indexOf(b);
      });

    const availableIncomeBuckets = INCOME_BUCKETS.filter(bucket => {
      return profileData.slice(0, 500).some(p => {
        const incomeStr = String(p.avg_monthly_income_raw || p.avg_monthly_income || '');
        return bucket.pattern.test(incomeStr);
      });
    });

    return {
      provinces,
      educationLevels,
      ageGroups,
      availableIncomeBuckets
    };
  }, [profileData.length, surveyData.length]);

  const filterFields = [
    {
      key: 'province' as const,
      label: 'Provinsi',
      placeholder: 'Semua Provinsi',
      options: [
        { value: '', label: 'Semua Provinsi' },
        ...filterOptions.provinces.map(p => ({ value: p, label: p }))
      ],
    },
    {
      key: 'education' as const,
      label: 'Pendidikan',
      placeholder: 'Semua Tingkatan',
      options: [
        { value: '', label: 'Semua Tingkatan' },
        ...filterOptions.educationLevels.map(e => ({ value: e, label: e }))
      ],
    },
    {
      key: 'income' as const,
      label: 'Pendapatan',
      placeholder: 'Semua Tingkat Pendapatan',
      options: [
        { value: '', label: 'Semua Tingkat Pendapatan' },
        ...filterOptions.availableIncomeBuckets.map(b => ({ value: b.value, label: b.label }))
      ],
    },
    {
      key: 'ageGroup' as const,
      label: 'Kelompok Umur',
      placeholder: 'Semua Umur',
      options: [
        { value: '', label: 'Semua Umur' },
        ...filterOptions.ageGroups.map(a => ({ value: a, label: AGE_GROUP_LABELS[a] || a }))
      ],
    },
  ];

  const handleChange = (key: keyof typeof filters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="filter-bar">
      {filterFields.map((field, index) => (
        <div
          key={field.key}
          className="filter-item"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <CustomSelect
            id={`filter-${field.key}`}
            label={field.label}
            value={filters[field.key]}
            onChange={(value) => handleChange(field.key, value)}
            options={field.options}
            placeholder={field.placeholder}
          />
        </div>
      ))}
    </div>
  );
};

export default FilterBar;
