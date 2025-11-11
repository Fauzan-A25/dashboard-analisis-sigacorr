import { type FC, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import FilterBar from '../components/common/FilterBar';
import { exportMultipleCSV } from '../utils/ExportToCSV';

// Import widgets - UPDATED
import KPIs from '../dashboard/widgets/KPIs';
import LiteracyDimensions from '../dashboard/widgets/LiteracyDimensions';
// ❌ REMOVED: DigitalAdoption, BehaviorAnalysis, IncomeDistribution

// ✨ NEW WIDGETS
import IncomeVsExpenditure from '../dashboard/widgets/IncomeVsExpenditure';
import LiteracyVsFintechCorrelation from '../dashboard/widgets/LiteracyVsFintechCorrelation';
import DigitalTimeVsAnxiety from '../dashboard/widgets/DigitalTimeVsAnxiety';
import EducationEmploymentBreakdown from '../dashboard/widgets/EducationEmploymentBreakdown';

/**
 * Income buckets matching Profile CSV format (string ranges)
 */
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

const Dashboard: FC = () => {
  const { initialize, surveyData, profileData, isLoading, error } = useStore();
  
  const [filters, setFilters] = useState({
    province: '',
    education: '',
    income: '',
    ageGroup: ''
  });
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter Survey Data
  const filteredSurveyData = surveyData.filter((row) => {
    const province = row['Province of Origin'] || row.province;
    const education = row['Last Education'] || row.education_level;
    const birthYear = row['Year of Birth'] || row.birth_year;
    
    // ✅ ONLY filter by fields that exist in SURVEY data
    return (
      (!filters.province || province === filters.province) &&
      (!filters.education || education === filters.education) &&
      (!filters.ageGroup || (typeof birthYear === 'number' && getAgeGroup(birthYear) === filters.ageGroup))
      // ✅ Income filter is IGNORED for survey data (it's Profile-only)
    );
  });

  // Filter Profile Data
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
      incomeMatch && // ✅ Only check income for Profile data
      (!filters.ageGroup || (typeof profile.birth_year === 'number' && getAgeGroup(profile.birth_year) === filters.ageGroup))
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
        data: filteredSurveyData,
        filename: `genz_survey_data${filterSuffix}_${timestamp}.csv`
      },
      {
        data: filteredProfileData,
        filename: `genz_profile_data${filterSuffix}_${timestamp}.csv`
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
          <p className="text-white text-lg">Loading dashboard data...</p>
          <p className="text-gray-400 text-sm mt-2">Parsing 2601+ respondents...</p>
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
        title="Dashboard Overview"
        subtitle="Analytics and insights from independent respondent groups"
        totalRespondents={filteredSurveyData.length + filteredProfileData.length}
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

        {/* Data Info Banner */}
        <div className="glass-panel p-4 mb-6 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-6">
              <div>
                <span className="text-sm text-gray-400">Survey Respondents:</span>
                <span className="ml-2 text-lg font-semibold text-blue-400">
                  {filteredSurveyData.length} / {surveyData.length}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-400">Profile Respondents:</span>
                <span className="ml-2 text-lg font-semibold text-green-400">
                  {filteredProfileData.length} / {profileData.length}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              ℹ️ Survey and Profile data are independent respondent groups
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className={`relative z-1 transition-opacity duration-200 ${isDropdownOpen ? 'pointer-events-none opacity-70' : ''}`}>
          
          {/* KPI Cards */}
          <KPIs surveyData={filteredSurveyData} />

          {/* NEW LAYOUT - 2x2 Grid then 2 full-width */}
          
          {/* Row 1: Income vs Expenditure + Literacy vs Fintech */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <IncomeVsExpenditure profileData={filteredProfileData} />
            <LiteracyVsFintechCorrelation surveyData={filteredSurveyData} />
          </div>

          {/* Row 2: Literacy Dimensions + Digital Time vs Anxiety */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <LiteracyDimensions data={filteredSurveyData} />
            <DigitalTimeVsAnxiety profileData={filteredProfileData} />
          </div>

          {/* Row 3: Full-width Education x Employment Breakdown */}
          <div className="mb-6">
            <EducationEmploymentBreakdown profileData={filteredProfileData} />
          </div>

          {/* Active Filters */}
          {(filters.province || filters.education || filters.income || filters.ageGroup) && (
            <div className="glass-panel p-4 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm text-gray-400">Active Filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {filters.province && (
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                        📍 {filters.province}
                      </span>
                    )}
                    {filters.education && (
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                        🎓 {filters.education}
                      </span>
                    )}
                    {filters.income && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                        💰 {filters.income}
                      </span>
                    )}
                    {filters.ageGroup && (
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm">
                        👥 {filters.ageGroup}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setFilters({ province: '', education: '', income: '', ageGroup: '' })}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {(filteredSurveyData.length === 0 && filteredProfileData.length === 0) && (
            <div className="glass-panel p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Data Found</h3>
              <p className="text-gray-400 mb-4">
                No respondents match the selected filters in either dataset.
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

export default Dashboard;
