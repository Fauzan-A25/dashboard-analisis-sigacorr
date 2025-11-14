import { FC, useMemo, useState } from 'react';
import { calculateFinancialLiteracyScore } from '../../dashboard/metrics';
import '../../../styles/components/regionalanalysis/province-ranking-table.css';

interface ProvinceRankingTableProps {
  surveyData: any[];
  regionalData: any[];
  onProvinceClick?: (province: string) => void;
}

type SortField = 'name' | 'literacy' | 'pdrb' | 'loans' | 'urbanization' | 'count';
type SortOrder = 'asc' | 'desc';

const ProvinceRankingTable: FC<ProvinceRankingTableProps> = ({
  surveyData,
  regionalData,
  onProvinceClick
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
      const regional = regionalData.find(r => {
        if (!r || !r.province) return false;
        return String(r.province).trim().toLowerCase() === String(name).trim().toLowerCase();
      });

      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

      return {
        name,
        literacy: avgScore,
        pdrb: (regional?.pdrb_ribu || 0) / 1000,
        loans: regional?.outstanding_loan_billion || 0,
        urbanization: regional?.urbanization_percent || 0,
        population: regional?.population_thousands || 0,
        count: scores.length
      };
    });

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
    if (score >= 3) return 'province-ranking-table__literacy--excellent';
    if (score >= 2.5) return 'province-ranking-table__literacy--good';
    if (score >= 2) return 'province-ranking-table__literacy--fair';
    return 'province-ranking-table__literacy--poor';
  };

  return (
    <div className="province-ranking-table">
      <div className="province-ranking-table__header">
        <div className="province-ranking-table__header-left">
          <h3 className="province-ranking-table__title">
            📊 Peringkat Provinsi & Data Ekonomi
          </h3>
          <p className="province-ranking-table__subtitle">
            Perbandingan lengkap provinsi yang disurvei. Klik baris untuk sorotan.
          </p>
        </div>
        <div className="province-ranking-table__count">
          {tableData.length} provinsi
        </div>
      </div>

      {tableData.length === 0 ? (
        <div className="province-ranking-table__empty">
          Tidak ada data provinsi
        </div>
      ) : (
        <div className="province-ranking-table__container">
          <table className="province-ranking-table__table">
            <thead className="province-ranking-table__thead">
              <tr className="province-ranking-table__row province-ranking-table__row--header">
                <th className="province-ranking-table__cell province-ranking-table__cell--header province-ranking-table__cell--number">#</th>
                <th
                  className="province-ranking-table__cell province-ranking-table__cell--header province-ranking-table__cell--sortable"
                  onClick={() => handleSort('name')}
                >
                  Provinsi {getSortIcon('name')}
                </th>
                <th
                  className="province-ranking-table__cell province-ranking-table__cell--header province-ranking-table__cell--sortable province-ranking-table__cell--right"
                  onClick={() => handleSort('literacy')}
                >
                  Literasi {getSortIcon('literacy')}
                </th>
                <th
                  className="province-ranking-table__cell province-ranking-table__cell--header province-ranking-table__cell--sortable province-ranking-table__cell--right"
                  onClick={() => handleSort('count')}
                >
                  Responden {getSortIcon('count')}
                </th>
                <th
                  className="province-ranking-table__cell province-ranking-table__cell--header province-ranking-table__cell--sortable province-ranking-table__cell--right"
                  onClick={() => handleSort('pdrb')}
                >
                  PDRB (Miliar) {getSortIcon('pdrb')}
                </th>
                <th
                  className="province-ranking-table__cell province-ranking-table__cell--header province-ranking-table__cell--sortable province-ranking-table__cell--right"
                  onClick={() => handleSort('loans')}
                >
                  Pinjaman (Miliar) {getSortIcon('loans')}
                </th>
                <th
                  className="province-ranking-table__cell province-ranking-table__cell--header province-ranking-table__cell--sortable province-ranking-table__cell--right"
                  onClick={() => handleSort('urbanization')}
                >
                  Urbanisasi % {getSortIcon('urbanization')}
                </th>
              </tr>
            </thead>
            <tbody className="province-ranking-table__tbody">
              {tableData.map((row, index) => (
                <tr
                  key={row.name}
                  className="province-ranking-table__row province-ranking-table__row--data"
                  onClick={() => onProvinceClick && onProvinceClick(row.name)}
                  style={{ cursor: onProvinceClick ? 'pointer' : 'default' }}
                >
                  <td className="province-ranking-table__cell province-ranking-table__cell--number">{index + 1}</td>
                  <td className="province-ranking-table__cell province-ranking-table__cell--province">{row.name}</td>
                  <td className={`province-ranking-table__cell province-ranking-table__cell--right province-ranking-table__cell--literacy ${getLiteracyColor(row.literacy)}`}>
                    {row.literacy.toFixed(2)}
                  </td>
                  <td className="province-ranking-table__cell province-ranking-table__cell--right province-ranking-table__cell--count">{row.count}</td>
                  <td className="province-ranking-table__cell province-ranking-table__cell--right province-ranking-table__cell--pdrb">
                    {row.pdrb > 0 ? row.pdrb.toFixed(0) : '-'}
                  </td>
                  <td className="province-ranking-table__cell province-ranking-table__cell--right province-ranking-table__cell--loans">
                    {row.loans > 0 ? row.loans.toFixed(1) : '-'}
                  </td>
                  <td className="province-ranking-table__cell province-ranking-table__cell--right province-ranking-table__cell--urbanization">
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
