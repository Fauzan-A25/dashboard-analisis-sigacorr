import { type FC, useMemo, useState } from 'react';
import { calculateFinancialLiteracyScore } from '../metrics';
import { normalizeProvinceName } from '../../utils/provinceMapping';

interface ProvinceRankingTableProps {
  surveyData: any[];
  regionalData: any[];
  onProvinceSelect: (province: string) => void;
}

type SortField = 'name' | 'literacy' | 'pdrb' | 'loans' | 'urbanization' | 'count';
type SortOrder = 'asc' | 'desc';

const ProvinceRankingTable: FC<ProvinceRankingTableProps> = ({ 
  surveyData, 
  regionalData,
  onProvinceSelect
}) => {
  
  const [sortField, setSortField] = useState<SortField>('literacy');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const tableData = useMemo(() => {
    const provinceScores: Record<string, number[]> = {};
    
    surveyData.forEach(row => {
      const province = row['Province of Origin'] || row.province;
      if (!province) return;
      
      const score = calculateFinancialLiteracyScore(row);
      if (score > 0) {
        if (!provinceScores[province]) provinceScores[province] = [];
        provinceScores[province].push(score);
      }
    });
    
    const data = Object.entries(provinceScores).map(([name, scores]) => {
      const normalizedName = normalizeProvinceName(name);
      const regional = regionalData.find(r => r.province === normalizedName);
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      
      return {
        name,
        literacy: avgScore,
        pdrb: (regional?.['PDRB (Ribu Rp)'] || 0) / 1000,
        loans: regional?.['Outstanding Pinjaman (Rp miliar)'] || 0,
        urbanization: regional?.['Urbanisasi (%)'] || 0,
        population: regional?.['Jumlah Penduduk (Ribu)'] || 0,
        count: scores.length
      };
    });
    
    // Sort
    data.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return sortOrder === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    
    return data;
  }, [surveyData, regionalData, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getLiteracyColor = (score: number) => {
    if (score >= 3) return 'text-green-400';
    if (score >= 2.5) return 'text-blue-400';
    if (score >= 2) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="glass-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            📊 Province Rankings & Economic Data
          </h3>
          <p className="text-sm text-gray-400">
            Complete comparison of all provinces. Click to highlight.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {tableData.length} provinces
        </div>
      </div>

      {tableData.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          No province data available
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">#</th>
                <th 
                  className="text-left py-3 px-4 text-gray-400 font-semibold cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('name')}
                >
                  Province {getSortIcon('name')}
                </th>
                <th 
                  className="text-right py-3 px-4 text-gray-400 font-semibold cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('literacy')}
                >
                  Literacy {getSortIcon('literacy')}
                </th>
                <th 
                  className="text-right py-3 px-4 text-gray-400 font-semibold cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('count')}
                >
                  Resp. {getSortIcon('count')}
                </th>
                <th 
                  className="text-right py-3 px-4 text-gray-400 font-semibold cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('pdrb')}
                >
                  PDRB (M) {getSortIcon('pdrb')}
                </th>
                <th 
                  className="text-right py-3 px-4 text-gray-400 font-semibold cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('loans')}
                >
                  Loans (B) {getSortIcon('loans')}
                </th>
                <th 
                  className="text-right py-3 px-4 text-gray-400 font-semibold cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('urbanization')}
                >
                  Urban % {getSortIcon('urbanization')}
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr 
                  key={row.name}
                  className="border-b border-gray-800 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => onProvinceSelect(row.name)}
                >
                  <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                  <td className="py-3 px-4 text-white font-medium">{row.name}</td>
                  <td className={`py-3 px-4 text-right font-bold ${getLiteracyColor(row.literacy)}`}>
                    {row.literacy.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-400">{row.count}</td>
                  <td className="py-3 px-4 text-right text-blue-400">
                    {row.pdrb > 0 ? row.pdrb.toFixed(0) : '-'}
                  </td>
                  <td className="py-3 px-4 text-right text-orange-400">
                    {row.loans > 0 ? row.loans.toFixed(1) : '-'}
                  </td>
                  <td className="py-3 px-4 text-right text-green-400">
                    {row.urbanization > 0 ? `${row.urbanization.toFixed(1)}%` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProvinceRankingTable;
