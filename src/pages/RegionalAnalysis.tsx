import { type FC, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { exportMultipleCSV } from '../utils/ExportToCSV';

// Regional widgets
import ProvinceTreeMap from '../dashboard/widgets/ProvinceTreeMap';
import PDRBvsLoans from '../dashboard/widgets/PDRBvsLoans';
import UrbanizationImpact from '../dashboard/widgets/UrbanizationImpact';
import ProvinceRankingTable from '../dashboard/widgets/ProvinceRankingTable';

const RegionalAnalysis: FC = () => {
  const { initialize, surveyData, regionalData, isLoading, error } = useStore();
  
  const [selectedProvince, setSelectedProvince] = useState<string>('');

  const handleCustomExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    exportMultipleCSV([
      {
        data: regionalData,
        filename: `regional_economic_data_${timestamp}.csv`
      }
    ]);
  };

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0F1E] to-[#1A1F3E] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white text-lg">Loading regional data...</p>
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
        title="Regional Analysis"
        subtitle="Geographic distribution of financial literacy and economic indicators"
        totalRespondents={regionalData.length}
        onExport={handleCustomExport}
      />

      <main className="ml-[280px] pt-[70px] p-8 relative">
        
        {/* Data Info */}
        <div className="glass-panel p-4 mb-6 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-6">
              <div>
                <span className="text-sm text-gray-400">Provinces:</span>
                <span className="ml-2 text-lg font-semibold text-blue-400">
                  {regionalData.length}
                </span>
              </div>
              {selectedProvince && (
                <div>
                  <span className="text-sm text-gray-400">Selected:</span>
                  <span className="ml-2 text-lg font-semibold text-green-400">
                    {selectedProvince}
                  </span>
                  <button
                    onClick={() => setSelectedProvince('')}
                    className="ml-2 text-xs text-red-400 hover:text-red-300"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
              ℹ️ Regional economic indicators and literacy data
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-1">
          
          {/* Row 1: Province TreeMap (Large) */}
          <div className="mb-6">
            <ProvinceTreeMap 
              surveyData={surveyData}
              regionalData={regionalData}
              onProvinceClick={setSelectedProvince}
              selectedProvince={selectedProvince}
            />
          </div>

          {/* Row 2: Economic Analysis */}
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

          {/* Row 3: Detailed Table */}
          <div className="mb-6">
            <ProvinceRankingTable 
              surveyData={surveyData}
              regionalData={regionalData}
              onProvinceSelect={setSelectedProvince}
            />
          </div>

          {/* No Data Message */}
          {regionalData.length === 0 && (
            <div className="glass-panel p-12 text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Regional Data</h3>
              <p className="text-gray-400 mb-4">
                Regional economic indicators are not available.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RegionalAnalysis;
