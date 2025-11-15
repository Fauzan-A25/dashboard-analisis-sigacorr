import { type FC, useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import FilterBar from '../../components/common/FilterBar';
import { exportMultipleCSV } from '../../utils/ExportToCSV';
import { getAgeGroup } from '../../utils/helpers';

// Import widgets
import KPIs from './widgets/KPIs';
import EducationEmploymentBreakdown from './widgets/EducationEmploymentBreakdown';

const INCOME_BUCKETS = [
  { value: '<2M', label: '< Rp2Jt', pattern: /< Rp2\.000\.000/ },
  { value: '2M-4M', label: 'Rp2Jt - Rp4Jt', pattern: /Rp2\.000\.001.*Rp4\.000\.000/ },
  { value: '4M-6M', label: 'Rp4Jt - Rp6Jt', pattern: /Rp4\.000\.001.*Rp6\.000\.000/ },
  { value: '6M-10M', label: 'Rp6Jt - Rp10Jt', pattern: /Rp6\.000\.001.*Rp10\.000\.000/ },
  { value: '10M-15M', label: 'Rp10Jt - Rp15Jt', pattern: /Rp10\.000\.001.*Rp15\.000\.000/ },
  { value: '>15M', label: '> Rp15Jt', pattern: /> Rp15\.000\.000/ },
] as const;

const Dashboard: FC = () => {
  const { initialize, surveyData, profileData, isLoading, error } = useStore();
  const { theme } = useTheme();

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

    return (
      (!filters.province || province === filters.province) &&
      (!filters.education || education === filters.education) &&
      (!filters.ageGroup || (typeof birthYear === 'number' && getAgeGroup(birthYear) === filters.ageGroup))
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
      incomeMatch &&
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

  // Dynamic background classes based on theme
  const backgroundClasses = theme === 'dark'
    ? 'bg-gradient-to-br from-[#0A0F1E] to-[#1A1F3E]'
    : 'bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0]';

  if (isLoading) {
    return (
      <div className={`min-h-screen ${backgroundClasses} flex items-center justify-center`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-[var(--text-primary)] text-lg">Memuat data dashboard...</p>
          <p className="text-[var(--text-secondary)] text-sm mt-2">Memproses lebih dari 2601 responden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${backgroundClasses} flex items-center justify-center`}>
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-[var(--text-primary)] text-2xl font-bold mb-2">Kesalahan Memuat Data</h2>
          <p className="text-[var(--text-secondary)] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${backgroundClasses} transition-colors duration-300`}>
      <Sidebar />
      <Header
        title="Ikhtisar Dashboard"
        subtitle="Analisis dan wawasan dari kelompok responden independen"
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
              className={`fixed backdrop-blur-sm z-[9998] ${
                theme === 'dark' ? 'bg-black/40' : 'bg-gray-400/20'
              }`}
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
                <span className="text-sm text-[var(--text-secondary)]">Responden Survei:</span>
                <span className="ml-2 text-lg font-semibold text-blue-400">
                  {filteredSurveyData.length} / {surveyData.length}
                </span>
              </div>
              <div>
                <span className="text-sm text-[var(--text-secondary)]">Responden Profil:</span>
                <span className="ml-2 text-lg font-semibold text-green-400">
                  {filteredProfileData.length} / {profileData.length}
                </span>
              </div>
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              ℹ️ Data survei dan profil merupakan kelompok responden independen
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className={`relative z-1 transition-opacity duration-200 ${isDropdownOpen ? 'pointer-events-none opacity-70' : ''}`}>

          {/* KPI Cards */}
          <KPIs surveyData={filteredSurveyData} />

          {/* Row 2: Full-width Education x Employment Breakdown */}
          <div className="mb-6">
            <EducationEmploymentBreakdown profileData={filteredProfileData} />
          </div>

          {/* Active Filters */}
          {(filters.province || filters.education || filters.income || filters.ageGroup) && (
            <div className="glass-panel p-4 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm text-[var(--text-secondary)]">Filter Aktif:</span>
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
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Bersihkan Semua
                </button>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {(filteredSurveyData.length === 0 && filteredProfileData.length === 0) && (
            <div className="glass-panel p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Data Tidak Ditemukan</h3>
              <p className="text-[var(--text-secondary)] mb-4">
                Tidak ada responden yang sesuai dengan filter yang dipilih pada kedua dataset.
              </p>
              <button
                onClick={() => setFilters({ province: '', education: '', income: '', ageGroup: '' })}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
