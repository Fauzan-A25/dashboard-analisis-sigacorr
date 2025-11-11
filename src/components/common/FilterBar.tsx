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
  { value: '<2M', label: '< Rp2M', pattern: /< Rp2\.000\.000/ },
  { value: '2M-4M', label: 'Rp2M - Rp4M', pattern: /Rp2\.000\.001.*Rp4\.000\.000/ },
  { value: '4M-6M', label: 'Rp4M - Rp6M', pattern: /Rp4\.000\.001.*Rp6\.000\.000/ },
  { value: '6M-10M', label: 'Rp6M - Rp10M', pattern: /Rp6\.000\.001.*Rp10\.000\.000/ },
  { value: '10M-15M', label: 'Rp10M - Rp15M', pattern: /Rp10\.000\.001.*Rp15\.000\.000/ },
  { value: '>15M', label: '> Rp15M', pattern: /> Rp15\.000\.000/ },
] as const;

const AGE_GROUP_LABELS: Record<string, string> = {
  '13-17': '13-17 years',
  '18-20': '18-20 years',
  '21-23': '21-23 years',
  '24-25': '24-25 years',
  '>25': 'Above 25 years',
};

const FilterBar: FC<FilterBarProps> = ({ 
  filters, 
  onFilterChange, 
  profileData = [],
  surveyData = []
}) => {
  
  // OPTIMIZE: Use useMemo to prevent recalculation on every render
  const filterOptions = useMemo(() => {
    console.log('🔄 Recalculating filter options...');
    
    // COMBINE provinces from BOTH datasets
    const surveyProvinces = surveyData
      .slice(0, 500) // Limit to prevent performance issues
      .map((s: any) => s['Province of Origin'] || s.province)
      .filter((val): val is string => Boolean(val));
    
    const profileProvinces = profileData
      .slice(0, 500) // Limit to prevent performance issues
      .map(p => p.province)
      .filter((val): val is string => Boolean(val));
    
    const provinces = uniq([...surveyProvinces, ...profileProvinces]).sort();

    // COMBINE education levels
    const surveyEducation = surveyData
      .slice(0, 500)
      .map((s: any) => s['Last Education'] || s.education_level)
      .filter((val): val is string => Boolean(val));
    
    const profileEducation = profileData
      .slice(0, 500)
      .map(p => p.education_level)
      .filter((val): val is string => Boolean(val));
    
    const educationLevels = uniq([...surveyEducation, ...profileEducation]).sort();

    // Age groups
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

    // Income buckets
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
  }, [profileData.length, surveyData.length]); // Only recalc when data length changes

  const filterFields = [
    {
      key: 'province' as const,
      label: 'Province',
      placeholder: 'All Provinces',
      options: [
        { value: '', label: 'All Provinces' },
        ...filterOptions.provinces.map(p => ({ value: p, label: p }))
      ],
    },
    {
      key: 'education' as const,
      label: 'Education',
      placeholder: 'All Levels',
      options: [
        { value: '', label: 'All Levels' },
        ...filterOptions.educationLevels.map(e => ({ value: e, label: e }))
      ],
    },
    {
      key: 'income' as const,
      label: 'Income',
      placeholder: 'All Income Levels',
      options: [
        { value: '', label: 'All Income Levels' },
        ...filterOptions.availableIncomeBuckets.map(b => ({ value: b.value, label: b.label }))
      ],
    },
    {
      key: 'ageGroup' as const,
      label: 'Age Group',
      placeholder: 'All Ages',
      options: [
        { value: '', label: 'All Ages' },
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
