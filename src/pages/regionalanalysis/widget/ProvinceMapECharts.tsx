// src/pages/regionalanalysis/widget/ProvinceMapECharts.tsx
import { FC, useMemo, useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { calculateFinancialLiteracyScore } from '../../dashboard/metrics';
import '../../../styles/components/regionalanalysis/province-map-echarts.css';
const basePath = import.meta.env.BASE_URL || '/';

interface ProvinceMapEChartsProps {
  surveyData: any[];
  regionalData: any[];
  onProvinceSelect: (province: string) => void;
}

type MapLayer = 'literacy' | 'inclusion' | 'vulnerability' | 'digital';

const normalizeProvinceName = (name: string): string => {
  return name
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/\./g, ' ')
    .replace(/DI\s+/g, 'DAERAH ISTIMEWA ')
    .replace(/D\.I\.\s*/g, 'DAERAH ISTIMEWA ')
    .replace(/DKI\s+/g, 'DKI ')
    .replace(/KEP\.\s*/g, 'KEPULAUAN ')
    .replace(/BANGKA\s+BELITUNG/g, 'BANGKA BELITUNG')
    .replace(/NANGROE|NANGGROE/g, 'DI')
    .replace(/NANGROU/g, 'DI')
    .trim();
};

const createProvinceMapping = () => {
  const baseMapping: Record<string, string[]> = {
    "DI. ACEH": ["Aceh", "Nangroe Aceh Darusalam", "Nangrou Aceh Darusalam", "NAD"],
    "SUMATERA UTARA": ["Sumatera Utara", "Sumut"],
    "SUMATERA BARAT": ["Sumatera Barat", "Sumbar"],
    "RIAU": ["Riau"],
    "JAMBI": ["Jambi"],
    "SUMATERA SELATAN": ["Sumatera Selatan", "Sumsel"],
    "BENGKULU": ["Bengkulu"],
    "LAMPUNG": ["Lampung"],
    "BANGKA BELITUNG": ["Kepulauan Bangka Belitung", "Kepualauan Bangka Belitung", "Bangka Belitung", "Babel"],
    "KEPULAUAN RIAU": ["Kepulauan Riau", "Kepri"],
    "DKI JAKARTA": ["DKI Jakarta", "Jakarta", "DKI"],
    "JAWA BARAT": ["Jawa Barat", "Jabar"],
    "JAWA TENGAH": ["Jawa Tengah", "Jateng"],
    "DAERAH ISTIMEWA YOGYAKARTA": ["DI Yogyakarta", "D.I. Yogyakarta", "Yogyakarta", "DIY"],
    "JAWA TIMUR": ["Jawa Timur", "Jatim"],
    "BANTEN": ["Banten"],
    "BALI": ["Bali"],
    "NUSATENGGARA BARAT": ["Nusa Tenggara Barat", "NTB"],
    "NUSA TENGGARA TIMUR": ["Nusa Tenggara Timur", "NTT"],
    "KALIMANTAN BARAT": ["Kalimantan Barat", "Kalbar"],
    "KALIMANTAN TENGAH": ["Kalimantan Tengah", "Kalteng"],
    "KALIMANTAN SELATAN": ["Kalimantan Selatan", "Kalsel"],
    "KALIMANTAN TIMUR": ["Kalimantan Timur", "Kaltim"],
    "KALIMANTAN UTARA": ["Kalimantan Utara", "Kaltara"],
    "SULAWESI UTARA": ["Sulawesi Utara", "Sulut"],
    "SULAWESI TENGAH": ["Sulawesi Tengah", "Sulteng"],
    "SULAWESI SELATAN": ["Sulawesi Selatan", "Sulsel"],
    "SULAWESI TENGGARA": ["Sulawesi Tenggara", "Sultra"],
    "GORONTALO": ["Gorontalo"],
    "SULAWESI BARAT": ["Sulawesi Barat", "Sulbar"],
    "MALUKU": ["Maluku"],
    "MALUKU UTARA": ["Maluku Utara", "Malut"],
    "PAPUA": ["Papua"],
    "PAPUA BARAT": ["Papua Barat"],
    "PAPUA TENGAH": ["Papua Tengah"],
    "PAPUA PEGUNUNGAN": ["Papua Pegunungan"],
    "PAPUA SELATAN": ["Papua Selatan"],
    "PAPUA BARAT DAYA": ["Papua Barat Daya"]
  };

  const mapping: Record<string, string> = {};
  Object.entries(baseMapping).forEach(([geoName, variations]) => {
    variations.forEach(variation => {
      mapping[normalizeProvinceName(variation)] = geoName;
    });
  });

  return mapping;
};

const provinceMapping = createProvinceMapping();

const ProvinceMapECharts: FC<ProvinceMapEChartsProps> = ({
  surveyData,
  regionalData,
  onProvinceSelect
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [activeLayer, setActiveLayer] = useState<MapLayer>('literacy');
  const [geoJsonProvinces, setGeoJsonProvinces] = useState<string[]>([]);
  const [nameProperty, setNameProperty] = useState<string>('name');

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

  const textPrimary = isDarkMode ? '#ffffff' : '#0f172a';
  const textSecondary = isDarkMode ? '#94a3b8' : '#64748b';
  const tooltipBg = isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)';
  const tooltipBorder = isDarkMode ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.4)';

  useEffect(() => {
    console.log('📊 Initial Data Check:');
    console.log('  Survey rows:', surveyData.length);
    console.log('  Regional rows:', regionalData.length);
  }, [surveyData, regionalData]);

  useEffect(() => {
    fetch(`${basePath}data/indonesia-provinces.json`)
      .then(response => response.json())
      .then(geoJson => {
        const firstFeature = geoJson.features[0];
        const possibleNames = ['Propinsi', 'provinsi', 'PROVINSI', 'name', 'NAME', 'Nama'];
        let detectedProperty = 'name';
        
        for (const prop of possibleNames) {
          if (firstFeature.properties[prop]) {
            detectedProperty = prop;
            break;
          }
        }
        
        setNameProperty(detectedProperty);
        
        const provinces = geoJson.features.map((f: any) => 
          f.properties[detectedProperty] || 'Unknown'
        );
        
        setGeoJsonProvinces(provinces);
        console.log('🗺️ GeoJSON loaded:', provinces.length, 'provinces');
        
        echarts.registerMap('indonesia', geoJson);
        setMapReady(true);
      })
      .catch(error => {
        console.error('❌ Failed to load map:', error);
      });
  }, []);
  
  const provinceLayers = useMemo(() => {
    const provinceScores: Record<string, number[]> = {};
    const provinceSurveys: Record<string, any[]> = {};
    
    surveyData.forEach(row => {
      const provinceRaw = row['Province of Origin'] || row.province;
      const province = normalizeProvinceName(provinceRaw);
      if (!provinceSurveys[province]) provinceSurveys[province] = [];
      provinceSurveys[province].push(row);
      
      const score = calculateFinancialLiteracyScore(row);
      if (score > 0) {
        if (!provinceScores[province]) provinceScores[province] = [];
        provinceScores[province].push(score);
      }
    });
    
    console.log('📍 Provinces with survey data:', Object.keys(provinceScores).length);
    
    const layers: Record<MapLayer, any[]> = {
      literacy: [],
      inclusion: [],
      vulnerability: [],
      digital: []
    };
    
    regionalData.forEach(regional => {
      if (!regional || !regional.province) return;
      
      const dataName = String(regional.province).trim();
      const normalizedDataName = normalizeProvinceName(dataName);
      let geoJsonName = provinceMapping[normalizedDataName];
      
      if (!geoJsonName) {
        geoJsonName = geoJsonProvinces.find(p => 
          normalizeProvinceName(p) === normalizedDataName
        ) || normalizedDataName;
      }
      
      const scores = provinceScores[normalizedDataName] || [];
      const surveys = provinceSurveys[normalizedDataName] || [];
      const hasSurveyData = scores.length > 0;
      
      const avgScore = scores.length > 0 
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length 
        : 0;
      
      const pdrb = regional.pdrb_ribu || 0;
      const outstandingLoan = regional.outstanding_loan_billion || 0;
      const inclusionGap = pdrb > 0 ? (outstandingLoan / (pdrb / 1000)) * 100 : 0;
      
      const vulnerabilityScores = surveys.map(row => {
        const literacy = calculateFinancialLiteracyScore(row);
        const behindFinances = Number(row['I am behind with my finances']) || 3;
        const controlLife = Number(row['My finances control my life']) || 3;
        return ((4 - literacy) + (behindFinances + controlLife) / 2) / 2;
      });
      const avgVulnerability = vulnerabilityScores.length > 0 
        ? vulnerabilityScores.reduce((a, b) => a + b, 0) / vulnerabilityScores.length 
        : 0;
      
      const digitalScores = surveys.map(row => {
        const payment = Number(row['Having experience in using the product and service of fintech for digital payment']) || 1;
        const loan = Number(row['Experience in using the product and service of fintech for financing (loan) and investment']) || 1;
        const understanding = Number(row['Having a good understanding of digital payment products such as E-Debit, E-Credit, E-Money, Mobile/Internet banking, E -wallet']) || 1;
        return (payment + loan + understanding) / 3;
      });
      const avgDigital = digitalScores.length > 0
        ? digitalScores.reduce((a, b) => a + b, 0) / digitalScores.length
        : 0;
      
      const baseData = {
        originalName: dataName,
        count: scores.length,
        hasSurveyData,
        pdrb: pdrb,
        loans: outstandingLoan,
        urbanization: regional.urbanization_percent || 0,
        population: regional.jumlah_penduduk_ribu || 0
      };
      
      layers.literacy.push({
        name: geoJsonName,
        value: avgScore || 0.01,
        score: avgScore,
        ...baseData
      });
      
      layers.inclusion.push({
        name: geoJsonName,
        value: inclusionGap || 0.01,
        score: inclusionGap,
        ...baseData
      });
      
      layers.vulnerability.push({
        name: geoJsonName,
        value: avgVulnerability || 0.01,
        score: avgVulnerability,
        ...baseData
      });
      
      layers.digital.push({
        name: geoJsonName,
        value: avgDigital || 0.01,
        score: avgDigital,
        ...baseData
      });
    });
    
    return layers;
  }, [surveyData, regionalData, geoJsonProvinces]);

  const layerConfig: Record<MapLayer, any> = {
    literacy: {
      title: '📚 Financial Literacy',
      subtitle: 'Tingkat literasi keuangan berdasarkan survei',
      unit: '/4',
      emoji: '📚'
    },
    inclusion: {
      title: '🏦 Financial Inclusion',
      subtitle: 'Penetrasi kredit terhadap ekonomi daerah',
      unit: '%',
      emoji: '🏦'
    },
    vulnerability: {
      title: '⚠️ Financial Vulnerability',
      subtitle: 'Tingkat kerentanan finansial GenZ',
      unit: '/4',
      emoji: '⚠️'
    },
    digital: {
      title: '📱 Digital Finance',
      subtitle: 'Kesiapan adopsi fintech dan digital banking',
      unit: '/5',
      emoji: '📱'
    }
  };

  const insights = useMemo(() => {
    const data = provinceLayers[activeLayer];
    const config = layerConfig[activeLayer];
    const isReversed = activeLayer === 'inclusion';
    
    const dataWithSurvey = data.filter(d => d.hasSurveyData && d.value > 0);
    
    if (dataWithSurvey.length === 0) {
      return { top3: [], bottom3: [], average: 0, total: 0, hasData: false };
    }
    
    const sorted = [...dataWithSurvey].sort((a, b) => 
      isReversed ? a.value - b.value : b.value - a.value
    );
    
    const top3 = sorted.slice(0, 3);
    const bottom3 = sorted.slice(-3).reverse();
    const average = dataWithSurvey.reduce((sum, d) => sum + d.value, 0) / dataWithSurvey.length;
    
    return { 
      top3, 
      bottom3, 
      average, 
      total: dataWithSurvey.length,
      hasData: true,
      isReversed,
      config
    };
  }, [provinceLayers, activeLayer]);

  const option = useMemo(() => {
    if (!mapReady || provinceLayers[activeLayer].length === 0) {
      return {};
    }

    const data = provinceLayers[activeLayer];
    const config = layerConfig[activeLayer];
    const dataWithSurvey = data.filter(d => d.hasSurveyData && d.value > 0);
    
    if (dataWithSurvey.length === 0) {
      return {};
    }

    const sortedValues = dataWithSurvey.map(d => d.value).sort((a, b) => a - b);
    const topThird = sortedValues[Math.floor(sortedValues.length * 2/3)];
    const middleThird = sortedValues[Math.floor(sortedValues.length * 1/3)];

    const isReversed = activeLayer === 'inclusion';
    const topColor = isReversed ? '#ef4444' : '#10b981';
    const midColor = '#eab308';
    const lowColor = isReversed ? '#10b981' : '#ef4444';
    const noDataColor = '#4b5563';

    return {
      backgroundColor: 'transparent',
      title: {
        text: config.title,
        left: 'center',
        top: '20px',
        textStyle: {
          color: textPrimary,
          fontSize: 20,
          fontWeight: 'bold'
        },
        subtext: config.subtitle,
        subtextStyle: {
          color: textSecondary,
          fontSize: 14
        }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 2,
        textStyle: {
          color: textPrimary,
          fontSize: 13
        },
        padding: 16,
        formatter: (params: any) => {
          const titleColor = isDarkMode ? '#60a5fa' : '#2563eb';
          const labelColor = isDarkMode ? '#94a3b8' : '#475569';
          const valueColor = isDarkMode ? '#60a5fa' : '#3b82f6';
          const dividerColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(100,116,139,0.2)';
          
          if (!params.data) {
            return `<div style="padding: 8px;">
              <strong style="font-size: 15px; color: ${textPrimary};">${params.name}</strong><br/>
              <span style="color: #f59e0b; margin-top: 4px; display: block;">⚠️ Data tidak tersedia</span>
            </div>`;
          }
          
          const data = params.data;
          
          if (!data.hasSurveyData) {
            return `
              <div style="padding: 4px;">
                <div style="font-weight: bold; font-size: 16px; color: ${titleColor}; margin-bottom: 12px;">
                  ${data.originalName}
                </div>
                <div style="background: rgba(156, 163, 175, 0.2); padding: 8px; border-radius: 6px; margin-bottom: 8px;">
                  <strong style="color: #9ca3af;">📊 Belum Ada Data Survei</strong>
                </div>
                <div style="font-size: 12px; line-height: 1.8; color: ${labelColor};">
                  <strong>Data Ekonomi:</strong><br/>
                  ${data.pdrb > 0 ? `• PDRB: Rp ${(data.pdrb / 1000).toFixed(1)} Miliar<br/>` : ''}
                  ${data.loans > 0 ? `• Kredit: Rp ${data.loans.toFixed(1)} Miliar<br/>` : ''}
                  ${data.urbanization > 0 ? `• Urbanisasi: ${data.urbanization.toFixed(1)}%<br/>` : ''}
                  ${data.population > 0 ? `• Populasi: ${(data.population / 1000).toFixed(1)} Juta` : ''}
                </div>
              </div>
            `;
          }
          
          let ranking = 'Sedang';
          let rankColor = midColor;
          let rankEmoji = '●';
          
          if (data.value >= topThird) {
            ranking = isReversed ? 'Rendah' : 'Tinggi';
            rankColor = topColor;
            rankEmoji = '▲';
          } else if (data.value < middleThird) {
            ranking = isReversed ? 'Tinggi' : 'Rendah';
            rankColor = lowColor;
            rankEmoji = '▼';
          }
          
          return `
            <div style="padding: 4px; min-width: 250px;">
              <div style="font-weight: bold; font-size: 17px; color: ${titleColor}; margin-bottom: 12px;">
                ${config.emoji} ${data.originalName}
              </div>
              
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding: 10px; background: ${isDarkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'}; border-radius: 8px; border-left: 4px solid ${rankColor};">
                <div style="font-size: 20px;">${rankEmoji}</div>
                <div>
                  <div style="font-size: 12px; color: ${labelColor}; margin-bottom: 2px;">Kategori</div>
                  <strong style="color: ${rankColor}; font-size: 15px;">${ranking}</strong>
                </div>
              </div>
              
              <div style="font-size: 13px; line-height: 2; color: ${textPrimary};">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid ${dividerColor}; padding: 4px 0;">
                  <span><strong>Skor:</strong></span>
                  <span style="color: ${valueColor}; font-weight: bold;">${data.score.toFixed(2)}${config.unit}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid ${dividerColor}; padding: 4px 0;">
                  <span><strong>Responden:</strong></span>
                  <span>${data.count} orang</span>
                </div>
                ${data.pdrb > 0 ? `
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid ${dividerColor}; padding: 4px 0;">
                  <span><strong>PDRB:</strong></span>
                  <span>Rp ${(data.pdrb / 1000).toFixed(1)}M</span>
                </div>` : ''}
                ${data.loans > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                  <span><strong>Kredit:</strong></span>
                  <span>Rp ${data.loans.toFixed(1)}B</span>
                </div>` : ''}
              </div>
            </div>
          `;
        }
      },
      visualMap: {
        show: true,
        text: ['Tinggi', 'Rendah'],
        textStyle: {
          color: textPrimary,
          fontSize: 13
        },
        left: 20,
        bottom: 60,
        itemWidth: 22,
        itemHeight: 120,
        pieces: [
          { 
            min: topThird, 
            label: `${isReversed ? '🔻' : '🔺'} ≥${topThird.toFixed(2)}`, 
            color: topColor 
          },
          { 
            min: middleThird, 
            max: topThird, 
            label: `⬤ ${middleThird.toFixed(2)}-${topThird.toFixed(2)}`, 
            color: midColor 
          },
          { 
            min: 0.01,
            max: middleThird, 
            label: `${isReversed ? '🔺' : '🔻'} <${middleThird.toFixed(2)}`, 
            color: lowColor 
          },
          {
            value: 0,
            label: '⚪ Tidak Ada Data',
            color: noDataColor
          }
        ]
      },
      series: [
        {
          name: config.title,
          type: 'map',
          map: 'indonesia',
          nameProperty: nameProperty,
          roam: true,
          scaleLimit: {
            min: 1,
            max: 10
          },
          data: data,
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 13,
              textShadowColor: '#000',
              textShadowBlur: 4
            },
            itemStyle: {
              areaColor: '#3b82f6',
              borderColor: '#fff',
              borderWidth: 2.5,
              shadowColor: 'rgba(59, 130, 246, 0.6)',
              shadowBlur: 15
            }
          },
          itemStyle: {
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(100, 116, 139, 0.4)',
            borderWidth: 1.5,
            shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(100, 116, 139, 0.2)',
            shadowBlur: 5
          }
        }
      ]
    };
  }, [mapReady, provinceLayers, activeLayer, nameProperty, isDarkMode, textPrimary, textSecondary, tooltipBg, tooltipBorder]);

  const onEvents = {
    click: (params: any) => {
      if (params.data && params.data.originalName) {
        onProvinceSelect(params.data.originalName);
      }
    }
  };

  if (!mapReady) {
    return (
      <div className="province-map__loading">
        <div className="province-map__loading-content">
          <div className="province-map__loading-icon">🗺️</div>
          <div className="province-map__loading-text">Memuat peta Indonesia...</div>
          <div className="province-map__loading-subtext">Mohon tunggu sebentar</div>
        </div>
      </div>
    );
  }

  return (
    <div className="province-map">
      {/* Layer Selection Buttons */}
      <div className="province-map__controls">
        {(['literacy', 'inclusion', 'vulnerability', 'digital'] as MapLayer[]).map(layer => (
          <button
            key={layer}
            onClick={() => setActiveLayer(layer)}
            className={`province-map__layer-btn ${activeLayer === layer ? 'province-map__layer-btn--active' : ''}`}
          >
            <span className="province-map__layer-icon">{layerConfig[layer].emoji}</span>
            <span className="province-map__layer-label">{layer.charAt(0).toUpperCase() + layer.slice(1)}</span>
          </button>
        ))}
      </div>

      {/* Main Map */}
      <ReactECharts
        option={option}
        style={{ height: '650px', width: '100%' }}
        onEvents={onEvents}
        notMerge={true}
        lazyUpdate={true}
      />

      {/* Controls Guide */}
      <div className="province-map__guide">
        <div className="province-map__guide-item">
          <span className="province-map__guide-icon">🖱️</span>
          <span className="province-map__guide-text"><strong>Drag:</strong> Geser peta</span>
        </div>
        <div className="province-map__guide-item">
          <span className="province-map__guide-icon">🔍</span>
          <span className="province-map__guide-text"><strong>Scroll:</strong> Zoom in/out</span>
        </div>
        <div className="province-map__guide-item">
          <span className="province-map__guide-icon">👆</span>
          <span className="province-map__guide-text"><strong>Click:</strong> Lihat detail provinsi</span>
        </div>
      </div>
      
      {/* Insights Panel */}
      {insights.hasData && (
        <div className="province-map__insights">
          {/* Top 3 */}
          <div className="province-map__insight-card province-map__insight-card--top">
            <div className="province-map__insight-header">
              <span className="province-map__insight-icon">🏆</span>
              <span className="province-map__insight-title">
                {insights.isReversed ? 'Terendah' : 'Tertinggi'} 3 Provinsi
              </span>
            </div>
            {insights.top3.map((item, index) => (
              <div key={index} className="province-map__insight-item">
                <div className="province-map__insight-info">
                  <div className="province-map__insight-name">
                    {index + 1}. {item.originalName}
                  </div>
                  <div className="province-map__insight-count">
                    {item.count} responden
                  </div>
                </div>
                <div className="province-map__insight-score province-map__insight-score--top">
                  {item.score.toFixed(2)}{insights.config.unit}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom 3 */}
          <div className="province-map__insight-card province-map__insight-card--bottom">
            <div className="province-map__insight-header">
              <span className="province-map__insight-icon">⚠️</span>
              <span className="province-map__insight-title">
                {insights.isReversed ? 'Tertinggi' : 'Terendah'} 3 Provinsi
              </span>
            </div>
            {insights.bottom3.map((item, index) => (
              <div key={index} className="province-map__insight-item">
                <div className="province-map__insight-info">
                  <div className="province-map__insight-name">
                    {index + 1}. {item.originalName}
                  </div>
                  <div className="province-map__insight-count">
                    {item.count} responden
                  </div>
                </div>
                <div className="province-map__insight-score province-map__insight-score--bottom">
                  {item.score.toFixed(2)}{insights.config.unit}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="province-map__insight-card province-map__insight-card--summary">
            <div className="province-map__insight-header">
              <span className="province-map__insight-icon">📊</span>
              <span className="province-map__insight-title">Ringkasan Nasional</span>
            </div>
            <div className="province-map__summary">
              <div className="province-map__summary-row">
                <span>Rata-rata:</span>
                <strong>{insights.average.toFixed(2)}{insights.config.unit}</strong>
              </div>
              <div className="province-map__summary-row">
                <span>Provinsi dengan data:</span>
                <strong>{insights.total} dari 38</strong>
              </div>
              <div className="province-map__summary-row">
                <span>Rentang nilai:</span>
                <strong>
                  {insights.bottom3[insights.bottom3.length - 1]?.score.toFixed(2)} - {insights.top3[0]?.score.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProvinceMapECharts;
