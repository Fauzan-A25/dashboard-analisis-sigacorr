import { FC, useMemo, useState, useEffect } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  ZAxis
} from 'recharts';
import '../../../styles/components/regionalanalysis/pdrb-vs-loans.css';

interface PDRBvsLoansProps {
  regionalData: any[];
  selectedProvince?: string;
}

const PDRBvsLoans: FC<PDRBvsLoansProps> = ({ regionalData, selectedProvince }) => {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const { chartData, stats } = useMemo(() => {
    const validData = regionalData
      .filter(row => {
        const pdrb = row['PDRB (Ribu Rp)'] || row.pdrb_ribu;
        const loans = row['Outstanding Pinjaman (Rp miliar)'] || row.outstanding_loan_billion;

        return row &&
               (row.province || row.Provinsi) &&
               typeof (row.province || row.Provinsi) === 'string' &&
               pdrb !== undefined &&
               loans !== undefined &&
               !isNaN(pdrb) &&
               !isNaN(loans);
      })
      .map(row => {
        const provinceName = row.province || row.Provinsi;
        const isSelected = selectedProvince &&
          provinceName.trim().toLowerCase() === selectedProvince.trim().toLowerCase();

        const pdrbRaw = row['PDRB (Ribu Rp)'] || row.pdrb_ribu || 0;
        const loansRaw = row['Outstanding Pinjaman (Rp miliar)'] || row.outstanding_loan_billion || 0;

        // Ambil populasi ribuan agar bisa konversi PDRB per kapita ke total PDRB miliaran
        const populationK = (regionalData.find(r =>
          r.province?.toLowerCase() === provinceName.trim().toLowerCase()
        )?.population_thousands) || 0;

        const pdrbPerCapita = pdrbRaw / 1000; // Juta Rupiah per kapita
        const totalPDRB = (pdrbPerCapita * populationK) / 1000; // Konversi ke Miliar Rupiah total

        return {
          province: provinceName,
          pdrb: totalPDRB,
          loans: loansRaw,
          isSelected: isSelected
        };
      });

    const avgPDRB = validData.reduce((sum, d) => sum + d.pdrb, 0) / validData.length;
    const avgLoans = validData.reduce((sum, d) => sum + d.loans, 0) / validData.length;

    return {
      chartData: validData,
      stats: {
        avgPDRB: avgPDRB || 0,
        avgLoans: avgLoans || 0,
        totalProvinces: validData.length
      }
    };
  }, [regionalData, selectedProvince]);

  const selectedData = chartData.filter(d => d.isSelected);
  const nonSelectedData = chartData.filter(d => !d.isSelected);

  const axisColor = isDarkMode ? '#94a3b8' : '#475569';
  const gridColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(100,116,139,0.2)';
  const labelColor = isDarkMode ? '#e2e8f0' : '#1e293b';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="pdrb-loans-tooltip">
          <div className="pdrb-loans-tooltip__title">
            {data.province}
          </div>

          <div className="pdrb-loans-tooltip__content">
            <div className="pdrb-loans-tooltip__row">
              <span className="pdrb-loans-tooltip__label">💰 PDRB Total:</span>
              <strong className="pdrb-loans-tooltip__pdrb">Rp {data.pdrb.toFixed(2)} Miliar</strong>
            </div>

            <div className="pdrb-loans-tooltip__row">
              <span className="pdrb-loans-tooltip__label">🏦 Outstanding Pinjaman:</span>
              <strong className="pdrb-loans-tooltip__loans">Rp {data.loans.toFixed(1)} Miliar</strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isSelected = payload.isSelected;

    if (isSelected) {
      return (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r={14}
            fill="rgba(245, 158, 11, 0.3)"
            stroke="rgba(245, 158, 11, 0.6)"
            strokeWidth={2}
          />
          <circle
            cx={cx}
            cy={cy}
            r={8}
            fill="#f59e0b"
            stroke="#fff"
            strokeWidth={2}
          />
        </g>
      );
    }

    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={isDarkMode ? '#60a5fa' : '#3b82f6'}
        opacity={0.8}
        stroke={isDarkMode ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.6)'}
        strokeWidth={1}
      />
    );
  };

  return (
    <div className="pdrb-vs-loans">
      {/* Header */}
      <div className="pdrb-vs-loans__header">
        <div className="pdrb-vs-loans__header-row">
          <span className="pdrb-vs-loans__icon">📊</span>
          <h3 className="pdrb-vs-loans__title">
            PDRB Total vs Pinjaman Outstanding
          </h3>
        </div>
        <p className="pdrb-vs-loans__subtitle">
          Hubungan antara PDRB total dan distribusi kredit per provinsi
        </p>
      </div>

      {/* Statistics Cards */}
      {chartData.length > 0 && (
        <div className="pdrb-vs-loans__stats">
          <div className="pdrb-vs-loans-stat pdrb-vs-loans-stat--pdrb">
            <div className="pdrb-vs-loans-stat__label">
              RATA-RATA PDRB TOTAL
            </div>
            <div className="pdrb-vs-loans-stat__value">
              Rp {stats.avgPDRB.toFixed(2)} Miliar
            </div>
          </div>

          <div className="pdrb-vs-loans-stat pdrb-vs-loans-stat--loans">
            <div className="pdrb-vs-loans-stat__label">
              RATA-RATA PINJAMAN OUTSTANDING
            </div>
            <div className="pdrb-vs-loans-stat__value">
              Rp {stats.avgLoans.toFixed(2)} Miliar
            </div>
          </div>

          <div className="pdrb-vs-loans-stat pdrb-vs-loans-stat--count">
            <div className="pdrb-vs-loans-stat__label">
              TOTAL PROVINSI
            </div>
            <div className="pdrb-vs-loans-stat__value">
              {stats.totalProvinces}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length === 0 ? (
        <div className="pdrb-vs-loans__empty">
          <div className="pdrb-vs-loans__empty-icon">📊</div>
          <p className="pdrb-vs-loans__empty-text">Tidak ada data yang tersedia</p>
        </div>
      ) : (
        <div className="pdrb-vs-loans__chart">
          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 70, left: 70 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridColor}
                strokeWidth={1}
              />

              <XAxis
                type="number"
                dataKey="pdrb"
                name="PDRB"
                stroke={axisColor}
                tick={{ fill: axisColor, fontSize: 12 }}
                tickLine={{ stroke: axisColor }}
              >
                <Label
                  value="PDRB Total (Miliar Rupiah)"
                  position="insideBottom"
                  offset={-15}
                  style={{
                    fill: labelColor,
                    fontSize: 14,
                    fontWeight: '600'
                  }}
                />
              </XAxis>

              <YAxis
                type="number"
                dataKey="loans"
                name="Pinjaman"
                stroke={axisColor}
                tick={{ fill: axisColor, fontSize: 12 }}
                tickLine={{ stroke: axisColor }}
              >
                <Label
                  value="Pinjaman Outstanding (Miliar Rupiah)"
                  angle={-90}
                  position="insideLeft"
                  offset={10}
                  style={{
                    fill: labelColor,
                    fontSize: 14,
                    textAnchor: 'middle',
                    fontWeight: '600'
                  }}
                />
              </YAxis>

              <ZAxis range={[64, 64]} />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  strokeDasharray: '5 5',
                  stroke: isDarkMode ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.5)'
                }}
              />

              <Scatter
                name="Provinsi"
                data={nonSelectedData}
                fill={isDarkMode ? '#60a5fa' : '#3b82f6'}
                shape={<CustomDot />}
              />

              {selectedProvince && selectedData.length > 0 && (
                <Scatter
                  name="Provinsi Terpilih"
                  data={selectedData}
                  fill="#f59e0b"
                  shape={<CustomDot />}
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend */}
      <div className="pdrb-vs-loans__legend">
        <div className="pdrb-vs-loans-legend__item">
          <div className="pdrb-vs-loans-legend__dot pdrb-vs-loans-legend__dot--normal" />
          <span className="pdrb-vs-loans-legend__text">Provinsi Lainnya</span>
        </div>

        {selectedProvince && (
          <div className="pdrb-vs-loans-legend__item">
            <div className="pdrb-vs-loans-legend__dot pdrb-vs-loans-legend__dot--selected" />
            <span className="pdrb-vs-loans-legend__text pdrb-vs-loans-legend__text--selected">{selectedProvince}</span>
          </div>
        )}
      </div>

      {/* Insight Note */}
      <div className="pdrb-vs-loans__insight">
        <span className="pdrb-vs-loans__insight-icon">💡</span>
        <p className="pdrb-vs-loans__insight-text">
          Provinsi dengan PDRB tinggi cenderung memiliki outstanding loans yang lebih besar,
          menunjukkan tingkat penetrasi layanan keuangan yang lebih baik di daerah dengan ekonomi kuat.
        </p>
      </div>
    </div>
  );
};

export default PDRBvsLoans;
