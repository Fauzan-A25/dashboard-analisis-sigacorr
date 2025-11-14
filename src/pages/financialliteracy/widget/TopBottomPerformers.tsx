import { type FC, useMemo } from 'react';
import { calculateFinancialLiteracyScore } from '../../dashboard/metrics';
import '../../../styles/components/financialliteracy/top-bottom-performers.css';

interface TopBottomPerformersProps {
  surveyData: any[];
}

const TopBottomPerformers: FC<TopBottomPerformersProps> = ({ surveyData }) => {

  const provinceScores = useMemo(() => {
    const groups: Record<string, number[]> = {};

    surveyData.forEach(row => {
      const province = row['Province of Origin'] || row.province || 'Tidak diketahui';
      const score = calculateFinancialLiteracyScore(row);

      if (score > 0) {
        if (!groups[province]) groups[province] = [];
        groups[province].push(score);
      }
    });

    return Object.entries(groups)
      .map(([province, scores]) => ({
        province,
        score: scores.reduce((sum, s) => sum + s, 0) / scores.length,
        count: scores.length
      }))
      .sort((a, b) => b.score - a.score);
  }, [surveyData]);

  const top5 = provinceScores.slice(0, 5);
  const bottom5 = provinceScores.slice(-5).reverse();

  const getScoreColor = (score: number) => {
    if (score >= 3) return 'top-bottom-performers__score--excellent';
    if (score >= 2.5) return 'top-bottom-performers__score--good';
    if (score >= 2) return 'top-bottom-performers__score--fair';
    return 'top-bottom-performers__score--poor';
  };

  const getBarWidth = (score: number) => {
    return `${(score / 4) * 100}%`;
  };

  return (
    <div className="top-bottom-performers">
      <div className="top-bottom-performers__header">
        <h3 className="top-bottom-performers__title">
          Provinsi Terbaik & Terendah
        </h3>
        <p className="top-bottom-performers__subtitle">
          Provinsi dengan literasi keuangan tertinggi dan terendah
        </p>
      </div>

      {surveyData.length === 0 ? (
        <div className="top-bottom-performers__empty">
          Tidak ada data
        </div>
      ) : (
        <div className="top-bottom-performers__content">

          {/* Top 5 Performers */}
          <div className="top-bottom-performers__section">
            <h4 className="top-bottom-performers__section-title top-bottom-performers__section-title--top">
              <span className="top-bottom-performers__section-icon">🏆</span>
              5 Provinsi Teratas
            </h4>
            <div className="top-bottom-performers__list">
              {top5.map((item, index) => (
                <div key={index} className="top-bottom-performer-item">
                  <div className="top-bottom-performer-item__info">
                    <div className="top-bottom-performer-item__details">
                      <span className="top-bottom-performer-item__rank top-bottom-performer-item__rank--top">#{index + 1}</span>
                      <span className="top-bottom-performer-item__province">{item.province}</span>
                      <span className="top-bottom-performer-item__count">({item.count})</span>
                    </div>
                    <span className={`top-bottom-performer-item__score ${getScoreColor(item.score)}`}>
                      {item.score.toFixed(2)}/4
                    </span>
                  </div>
                  <div className="top-bottom-performer-item__bar-container">
                    <div
                      className="top-bottom-performer-item__bar top-bottom-performer-item__bar--top"
                      style={{ width: getBarWidth(item.score) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom 5 Performers */}
          <div className="top-bottom-performers__section">
            <h4 className="top-bottom-performers__section-title top-bottom-performers__section-title--bottom">
              <span className="top-bottom-performers__section-icon">⚠️</span>
              5 Provinsi Terendah (Perlu Intervensi)
            </h4>
            <div className="top-bottom-performers__list">
              {bottom5.map((item, index) => (
                <div key={index} className="top-bottom-performer-item">
                  <div className="top-bottom-performer-item__info">
                    <div className="top-bottom-performer-item__details">
                      <span className="top-bottom-performer-item__rank top-bottom-performer-item__rank--bottom">
                        #{provinceScores.length - index}
                      </span>
                      <span className="top-bottom-performer-item__province">{item.province}</span>
                      <span className="top-bottom-performer-item__count">({item.count})</span>
                    </div>
                    <span className={`top-bottom-performer-item__score ${getScoreColor(item.score)}`}>
                      {item.score.toFixed(2)}/4
                    </span>
                  </div>
                  <div className="top-bottom-performer-item__bar-container">
                    <div
                      className="top-bottom-performer-item__bar top-bottom-performer-item__bar--bottom"
                      style={{ width: getBarWidth(item.score) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="top-bottom-performers__stats">
            <div className="top-bottom-performer-stat top-bottom-performer-stat--best">
              <p className="top-bottom-performer-stat__label">Provinsi Terbaik</p>
              <p className="top-bottom-performer-stat__name">{top5[0]?.province}</p>
              <p className="top-bottom-performer-stat__value">{top5[0]?.score.toFixed(2)}/4</p>
            </div>
            <div className="top-bottom-performer-stat top-bottom-performer-stat--worst">
              <p className="top-bottom-performer-stat__label">Provinsi Terendah</p>
              <p className="top-bottom-performer-stat__name">{bottom5[0]?.province}</p>
              <p className="top-bottom-performer-stat__value">{bottom5[0]?.score.toFixed(2)}/4</p>
            </div>
            <div className="top-bottom-performer-stat top-bottom-performer-stat--gap">
              <p className="top-bottom-performer-stat__label">Selisih</p>
              <p className="top-bottom-performer-stat__value top-bottom-performer-stat__value--large">
                {(top5[0]?.score - bottom5[0]?.score).toFixed(2)}
              </p>
              <p className="top-bottom-performer-stat__meta">poin perbedaan</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBottomPerformers;
