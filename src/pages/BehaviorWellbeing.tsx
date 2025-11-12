import { type FC, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import FilterBar from '../components/common/FilterBar';
import { exportMultipleCSV } from '../utils/ExportToCSV';

// Reused widgets
import IncomeVsExpenditure from '../dashboard/widgets/IncomeVsExpenditure';
import DigitalTimeVsAnxiety from '../dashboard/widgets/DigitalTimeVsAnxiety';

// NEW Behavior widgets
import BehaviorScoreCard from '../dashboard/widgets/BehaviorScoreCard';
import EWalletSpending from '../dashboard/widgets/EWalletSpending';
import AnxietyHeatmap from '../dashboard/widgets/AnxietyHeatmap';
import LoanUsageAnalysis from '../dashboard/widgets/LoanUsageAnalysis';
import DebtToIncomeRatio from '../dashboard/widgets/DebtToIncomeRatio';
import InvestmentDistribution from '../dashboard/widgets/InvestmentDistribution';
import SavingsRateAnalysis from '../dashboard/widgets/SavingsRateAnalysis';
import FintechAppUsage from '../dashboard/widgets/FintechAppUsage';

const INCOME_BUCKETS = [
  { value: '<2M', label: '< Rp2M', pattern: /< Rp2\.000\.000/ },
  { value: '2M-4M', label: 'Rp2M - Rp4M', pattern: /Rp2\.000\.001.*Rp4\.000\.000/ },
  { value: '4M-6M', label: 'Rp4M - Rp6M', pattern: /Rp4\.000\.001.*Rp6\.000\.000/ },
  { value: '6M-10M', label: 'Rp6M - Rp10M', pattern: /Rp6\.000\.001.*Rp10\.000\.000/ },
  { value: '10M-15M', label: 'Rp10M - Rp15M', pattern: /Rp10\.000\.001.*Rp15\.000\.000/ },
  { value: '>15M', label: '> Rp15M', pattern: /> Rp15\.000\.000/ },
] as const;

const getAgeGroup = (birthYear: number): string => {
  const age = 2025 - birthYear;
  if (age <= 17) return '13-17';
  if (age <= 20) return '18-20';
  if (age <= 23) return '21-23';
  if (age <= 25) return '24-25';
  return '>25';
};

const BehaviorWellbeing: FC = () => {
  const { initialize, surveyData, profileData, isLoading, error } = useStore();
  
  const [filters, setFilters] = useState({
    province: '',
    education: '',
    income: '',
    ageGroup: ''
  });
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter Profile Data (Behavior page uses PROFILE data)
  const filteredProfileData = profileData.filter((profile) => {
    const incomeStr = String(profile.avg_monthly_income_raw || profile.avg_monthly_income || '');
    
    let incomeMatch = true;
    if (filters.income) {
      const bucket = INCOME_BUCKETS.find(b => b.value === filters.income);
      incomeMatch = bucket ? bucket.pattern.test(incomeStr) : true;
    }
    
    return (
      (!filters.province || profile.province === filters.province) &&
      (!filters.education || profile.education_level === filters.education) &&
      incomeMatch &&
      (!filters.ageGroup || (typeof profile.birth_year === 'number' && getAgeGroup(profile.birth_year) === filters.ageGroup))
    );
  });

  // Also filter survey data for behavior score
  const filteredSurveyData = surveyData.filter((row) => {
    const province = row['Province of Origin'] || row.province;
    const education = row['Last Education'] || row.education_level;
    const birthYear = row['Year of Birth'] || row.birth_year;
    
    return (
      (!filters.province || province === filters.province) &&
      (!filters.education || education === filters.education) &&
      (!filters.ageGroup || (typeof birthYear === 'number' && getAgeGroup(birthYear) === filters.ageGroup))
    );
  });

  const handleCustomExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const activeFilters = Object.entries(filters)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join('_');
    
    const filterSuffix = activeFilters ? `_filtered_by_${activeFilters}` : '';
    
    exportMultipleCSV([
      {
        data: filteredProfileData,
        filename: `behavior_wellbeing_profile${filterSuffix}_${timestamp}.csv`
      }
    ]);
  };

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const handleDropdownOpen = () => setIsDropdownOpen(true);
    const handleDropdownClose = () => setIsDropdownOpen(false);

    document.addEventListener('dropdown-opened', handleDropdownOpen);
    document.addEventListener('dropdown-closed', handleDropdownClose);

    return () => {
      document.removeEventListener('dropdown-opened', handleDropdownOpen);
      document.removeEventListener('dropdown-closed', handleDropdownClose);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0F1E] to-[#1A1F3E] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white text-lg">Loading behavior & well-being data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0F1E] to-[#1A1F3E] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl font-bold mb-2">Error Loading Data</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1E] to-[#1A1F3E]">
      <Sidebar />
      <Header 
        title="Behavior & Well-being Analysis"
        subtitle="Financial habits, spending patterns, and stress factors"
        totalRespondents={filteredProfileData.length}
        onExport={handleCustomExport}
      />

      <main className="ml-[280px] pt-[70px] p-8 relative">
        
        {/* Backdrop Blur */}
        {isDropdownOpen && (
          <>
            <div 
              className="fixed bg-transparent z-[9999]"
              style={{ 
                marginLeft: '280px', 
                marginTop: '70px',
                left: 0,
                right: 0,
                height: '140px',
                pointerEvents: 'none'
              }}
              aria-hidden="true"
            />
            <div 
              className="fixed bg-black/40 backdrop-blur-sm z-[9998]"
              style={{ 
                marginLeft: '280px', 
                marginTop: 'calc(70px + 140px)',
                left: 0,
                right: 0,
                bottom: 0
              }}
              aria-hidden="true"
            />
          </>
        )}
        
        {/* Filter Bar */}
        <div className="glass-panel p-4 mb-6 relative z-[10000]">
          <FilterBar 
            filters={filters}
            onFilterChange={setFilters}
            profileData={profileData}
            surveyData={surveyData}
          />
        </div>

        {/* Data Info */}
        <div className="glass-panel p-4 mb-6 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-6">
              <div>
                <span className="text-sm text-gray-400">Profile Respondents:</span>
                <span className="ml-2 text-lg font-semibold text-blue-400">
                  {filteredProfileData.length} / {profileData.length}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              ℹ️ Behavioral and financial well-being data from profile responses
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`relative z-1 transition-opacity duration-200 ${isDropdownOpen ? 'pointer-events-none opacity-70' : ''}`}>
          
          {/* Row 1: Overview Score Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <BehaviorScoreCard surveyData={filteredSurveyData} />
          </div>

          {/* Row 2: Spending Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <IncomeVsExpenditure profileData={filteredProfileData} />
            <EWalletSpending profileData={filteredProfileData} />
          </div>

          {/* Row 3: Financial Well-being */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <AnxietyHeatmap profileData={filteredProfileData} />
            <DigitalTimeVsAnxiety profileData={filteredProfileData} />
          </div>

          {/* Row 4: Debt Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <LoanUsageAnalysis profileData={filteredProfileData} />
            <DebtToIncomeRatio profileData={filteredProfileData} />
          </div>

          {/* Row 5: Investment & Savings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <InvestmentDistribution profileData={filteredProfileData} />
            <SavingsRateAnalysis profileData={filteredProfileData} />
          </div>

          {/* Row 6: Digital Behavior */}
          <div className="mb-6">
            <FintechAppUsage profileData={filteredProfileData} />
          </div>

          {/* No Data Message */}
          {filteredProfileData.length === 0 && (
            <div className="glass-panel p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Data Found</h3>
              <p className="text-gray-400 mb-4">
                No respondents match the selected filters.
              </p>
              <button
                onClick={() => setFilters({ province: '', education: '', income: '', ageGroup: '' })}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BehaviorWellbeing;
