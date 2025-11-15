import { type FC, useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import FilterBar from '../../components/common/FilterBar';
import { exportMultipleCSV } from '../../utils/ExportToCSV';

import LiteracyDimensions from './widget/LiteracyDimensions';
import LiteracyByDemographics from './widget/LiteracyByDemographics';
import DimensionComparison from './widget/DimensionComparison';
import TopBottomPerformers from './widget/TopBottomPerformers';

const getAgeGroup = (birthYear: number): string => {
  const age = 2025 - birthYear;
  if (age <= 17) return '13-17';
  if (age <= 20) return '18-20';
  if (age <= 23) return '21-23';
  if (age <= 25) return '24-25';
  return '>25';
};

const FinancialLiteracy: FC = () => {
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
        data: filteredSurveyData,
        filename: `financial_literacy_analysis${filterSuffix}_${timestamp}.csv`
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
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-blue)] mb-4"></div>
          <p className="text-[var(--text-primary)] text-lg">Memuat analisis literasi keuangan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
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
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Sidebar />
      <Header
        title="Pendalaman Literasi Keuangan"
        subtitle="Analisis mendalam tentang pengetahuan dan kompetensi keuangan GenZ"
        totalRespondents={filteredSurveyData.length}
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
              <span className="text-sm text-[var(--text-secondary)]">Jumlah Responden Survei:</span>
              <span className="ml-2 text-lg font-semibold text-[var(--primary-blue)]">{filteredSurveyData.length} / {surveyData.length}</span>
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              ℹ️ Analisis literasi berdasarkan tingkat pertanyaan (Q1-Q48)
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`relative z-1 transition-opacity duration-200 ${isDropdownOpen ? 'pointer-events-none opacity-70' : ''}`}>
          {/* Row 1: Dimensions + Top/Bottom Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <LiteracyDimensions data={filteredSurveyData} />
            <TopBottomPerformers surveyData={filteredSurveyData} />
          </div>

          {/* Row 3: Literacy by Demographics */}
          <div className="mb-6">
            <LiteracyByDemographics surveyData={filteredSurveyData} />
          </div>

          {/* Row 4: Dimension Comparison (Compare different groups) */}
          <div className="mb-6">
            <DimensionComparison surveyData={filteredSurveyData} />
          </div>

          {/* No Data Message */}
          {filteredSurveyData.length === 0 && (
            <div className="glass-panel p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Data Tidak Ditemukan</h3>
              <p className="text-[var(--text-secondary)] mb-4">
                Tidak ada responden yang sesuai dengan filter yang dipilih.
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

export default FinancialLiteracy;
