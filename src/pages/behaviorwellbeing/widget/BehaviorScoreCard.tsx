import { type FC, useMemo } from 'react';
import type { FinancialProfileData } from '../../../services/dataTypes';
import '../../../styles/components/behaviorwellbeing/behavior-score-card.css';

interface BehaviorScoreCardProps {
  surveyData: any[];
  profileData?: FinancialProfileData[];
}

const BehaviorScoreCard: FC<BehaviorScoreCardProps> = ({ surveyData, profileData = [] }) => {
  const behaviorScore = useMemo(() => {
    if (surveyData.length === 0) return 0;

    const questionCount = 11;
    const total = surveyData.reduce((acc, row) => {
      const sum = Array.from({ length: questionCount }, (_, i) => row[`Q${19 + i}`] || 0)
        .reduce((a: number, b: number) => a + b, 0);
      return acc + sum;
    }, 0);

    return total / (surveyData.length * questionCount);
  }, [surveyData]);

  const poorBehaviorCount = useMemo(() => {
    if (surveyData.length === 0) return 0;

    return surveyData.filter(row => {
      const questionCount = 11;
      const sum = Array.from({ length: questionCount }, (_, i) => row[`Q${19 + i}`] || 0)
        .reduce((a: number, b: number) => a + b, 0);
      const avg = sum / questionCount;
      return avg < 2.5;
    }).length;
  }, [surveyData]);

  const profileMetrics = useMemo(() => {
    if (profileData.length === 0) {
      return {
        deficitCount: 0,
        deficitPct: 0,
        avgAnxiety: 0
      };
    }

    const parseAmount = (value: any): number => {
      if (!value) return 0;
      const str = typeof value === 'number' ? value.toString() : String(value || '');
      
      if (str.includes('-')) {
        const parts = str.split('-').map(p => {
          const cleaned = p.replace(/Rp/g, '').replace(/\s/g, '').replace(/\./g, '');
          return parseFloat(cleaned) || 0;
        });
        return parts.length === 2 ? (parts[0] + parts[1]) / 2 / 1000000 : 0;
      }
      
      const cleaned = str.replace(/Rp/g, '').replace(/\s/g, '').replace(/\./g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num / 1000000;
    };

    let deficitCount = 0;
    let totalAnxiety = 0;
    let anxietyCount = 0;

    profileData.forEach(p => {
      const income = parseAmount(p.avg_monthly_income);
      const expense = parseAmount(p.avg_monthly_expense);

      if (income > 0 && expense > income) {
        deficitCount++;
      }

      if (p.financial_anxiety_score && p.financial_anxiety_score > 0) {
        totalAnxiety += p.financial_anxiety_score;
        anxietyCount++;
      }
    });

    return {
      deficitCount,
      deficitPct: (deficitCount / profileData.length) * 100,
      avgAnxiety: anxietyCount > 0 ? totalAnxiety / anxietyCount : 0
    };
  }, [profileData]);

  const hasSurveyData = surveyData.length > 0;
  const hasProfileData = profileData.length > 0;
  const percentage = surveyData.length > 0
    ? (poorBehaviorCount / surveyData.length) * 100
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 3) return 'score-excellent';
    if (score >= 2.5) return 'score-good';
    if (score >= 2) return 'score-fair';
    return 'score-poor';
  };

  const getAnxietyColor = (score: number) => {
    if (score >= 4) return 'anxiety-high';
    if (score >= 3) return 'anxiety-moderate';
    if (score >= 2.5) return 'anxiety-mild';
    return 'anxiety-low';
  };

  return (
    <div className="behavior-score-card">
      <div className="behavior-score-card__grid">

        {/* Kartu 1: Skor Perilaku (Survei) ATAU Persentase Defisit (Profil) */}
        <div className="behavior-card">
          <div className="behavior-card__icon">
            <span className="behavior-card__emoji">{hasSurveyData ? '💰' : '⚠️'}</span>
          </div>
          <h4 className="behavior-card__label">
            {hasSurveyData ? 'Skor Perilaku Keuangan' : 'Pengeluaran Defisit'}
          </h4>
          {hasSurveyData ? (
            <>
              <p className={`behavior-card__value ${getScoreColor(behaviorScore)}`}>
                {behaviorScore.toFixed(1)}
              </p>
              <p className="behavior-card__meta">dari 4.0</p>
            </>
          ) : (
            <>
              <p className="behavior-card__value score-warning">
                {profileMetrics.deficitPct.toFixed(0)}%
              </p>
              <p className="behavior-card__meta">
                {profileMetrics.deficitCount} responden
              </p>
            </>
          )}
        </div>

        {/* Kartu 2: Kebiasaan Buruk (Survei) ATAU Rata-rata Kecemasan (Profil) */}
        <div className="behavior-card">
          <div className="behavior-card__icon">
            <span className="behavior-card__emoji">{hasSurveyData ? '⚠️' : '😰'}</span>
          </div>
          <h4 className="behavior-card__label">
            {hasSurveyData ? 'Kebiasaan Penganggaran Buruk' : 'Rata-rata Kecemasan Finansial'}
          </h4>
          {hasSurveyData ? (
            <>
              <p className="behavior-card__value score-warning">
                {percentage.toFixed(0)}%
              </p>
              <p className="behavior-card__meta">{poorBehaviorCount} responden</p>
            </>
          ) : hasProfileData ? (
            <>
              <p className={`behavior-card__value ${getAnxietyColor(profileMetrics.avgAnxiety)}`}>
                {profileMetrics.avgAnxiety.toFixed(1)}
              </p>
              <p className="behavior-card__meta">dari 5.0</p>
            </>
          ) : (
            <p className="behavior-card__no-data">Tidak ada data</p>
          )}
        </div>

        {/* Kartu 3: Insight */}
        <div className="behavior-card behavior-card--insight">
          <div className="behavior-insight">
            <p className="behavior-insight__text">
              📊 <strong>Analisis Perilaku:</strong>{' '}
              {hasSurveyData ? (
                <>
                  {percentage.toFixed(0)}% responden menunjukkan kebiasaan pengeluaran yang berada pada kategori tertentu, 
                  menandai variasi dalam perilaku penganggaran.
                </>
              ) : hasProfileData ? (
                <>
                  Dari data profil, {profileMetrics.deficitPct.toFixed(0)}% responden mengalami pengeluaran yang melebihi pendapatan, 
                  dengan rata-rata kecemasan finansial sebesar {profileMetrics.avgAnxiety.toFixed(1)} dari skala 5.
                </>
              ) : (
                'Data perilaku tidak tersedia untuk analisis.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorScoreCard;
