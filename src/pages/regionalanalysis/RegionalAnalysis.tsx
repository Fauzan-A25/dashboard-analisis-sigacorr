import { type FC, useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { exportMultipleCSV } from '../../utils/ExportToCSV';

import ProvinceMapECharts from './widget/ProvinceMapECharts';
import PDRBvsLoans from './widget/PDRBvsLoans';
import UrbanizationImpact from './widget/UrbanizationImpact';
import ProvinceRankingTable from './widget/ProvinceRankingTable';

const RegionalAnalysis: FC = () => {
  const { initialize, surveyData, regionalData, isLoading, error } = useStore();
  const [selectedProvince, setSelectedProvince] = useState<string>('');

  const handleCustomExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportMultipleCSV([
      {
        data: regionalData,
        filename: `data_ekonomi_regional_${timestamp}.csv`
      }
    ]);
  };

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-blue)] mb-4"></div>
          <p className="text-[var(--text-primary)] text-lg">Memuat data regional...</p>
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
        title="Analisis Regional"
        subtitle="Distribusi geografis literasi keuangan dan indikator ekonomi"
        totalRespondents={surveyData.length}
        onExport={handleCustomExport}
      />

      <main className="ml-[280px] pt-[70px] p-8">
        {/* Data Info */}
        <div className="glass-panel p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-6">
              <div>
                <span className="text-sm text-[var(--text-secondary)]">Provinsi:</span>
                <span className="ml-2 text-lg font-semibold text-[var(--primary-blue)]">
                  {regionalData.length}
                </span>
              </div>
              {selectedProvince && (
                <div>
                  <span className="text-sm text-[var(--text-secondary)]">Terpilih:</span>
                  <span className="ml-2 text-lg font-semibold text-[var(--success)]">
                    {selectedProvince}
                  </span>
                  <button
                    onClick={() => setSelectedProvince('')}
                    className="ml-2 text-xs text-[var(--danger)] hover:opacity-80"
                  >
                    Bersihkan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Peta Provinsi */}
        <div className="mb-6">
          <div className="glass-panel p-6">
            <ProvinceMapECharts 
              surveyData={surveyData}
              regionalData={regionalData}
              onProvinceSelect={setSelectedProvince}
            />
          </div>
        </div>

        {/* Analisis Ekonomi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PDRBvsLoans 
            regionalData={regionalData}
            selectedProvince={selectedProvince}
          />
          <UrbanizationImpact 
            surveyData={surveyData}
            regionalData={regionalData}
          />
        </div>

        {/* Tabel Peringkat Provinsi */}
        <div className="mb-6">
          <ProvinceRankingTable 
            surveyData={surveyData}
            regionalData={regionalData}
            onProvinceClick={setSelectedProvince}
          />
        </div>
      </main>
    </div>
  );
};

export default RegionalAnalysis;
