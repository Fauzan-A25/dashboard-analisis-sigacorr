import { type FC, useMemo } from 'react';
import type { FinancialProfileData } from '../../services/dataTypes';

interface BehaviorScoreCardProps {
  surveyData: any[];
  profileData?: FinancialProfileData[];
}

const BehaviorScoreCard: FC<BehaviorScoreCardProps> = ({ surveyData, profileData = [] }) => {
  
  /**
   * Calculate behavior score from Survey data (Q19-Q29)
   */
  const behaviorScore = useMemo(() => {
    if (surveyData.length === 0) return 0;
    
    // Financial Behavior = Q19-Q29
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
      return avg < 2.5; // Poor if below 2.5/4
    }).length;
  }, [surveyData]);

  /**
   * Calculate Profile-based metrics (fallback if Survey data empty)
   */
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
      
      // Handle range format (e.g., "Rp2.000.001 - Rp4.000.000")
      if (str.includes('-')) {
        const parts = str.split('-').map(p => {
          const cleaned = p.replace(/Rp/g, '').replace(/\s/g, '').replace(/\./g, '');
          return parseFloat(cleaned) || 0;
        });
        return parts.length === 2 ? (parts[0] + parts[1]) / 2 / 1000000 : 0;
      }
      
      // Handle single values
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

  // Determine which metrics to show
  const hasSurveyData = surveyData.length > 0;
  const hasProfileData = profileData.length > 0;

  const percentage = surveyData.length > 0 
    ? (poorBehaviorCount / surveyData.length) * 100 
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 3) return 'text-green-400';
    if (score >= 2.5) return 'text-blue-400';
    if (score >= 2) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getAnxietyColor = (score: number) => {
    if (score >= 4) return 'text-red-400';
    if (score >= 3) return 'text-orange-400';
    if (score >= 2.5) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="glass-panel p-6 col-span-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Behavior Score (Survey) OR Deficit % (Profile) */}
        <div className="text-center">
          <div className="mb-2">
            <span className="text-6xl">{hasSurveyData ? '💰' : '⚠️'}</span>
          </div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">
            {hasSurveyData ? 'Financial Behavior Score' : 'Spending in Deficit'}
          </h4>
          {hasSurveyData ? (
            <>
              <p className={`text-5xl font-bold ${getScoreColor(behaviorScore)}`}>
                {behaviorScore.toFixed(1)}
              </p>
              <p className="text-gray-500 text-sm mt-1">out of 4.0</p>
            </>
          ) : (
            <>
              <p className="text-5xl font-bold text-orange-400">
                {profileMetrics.deficitPct.toFixed(0)}%
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {profileMetrics.deficitCount} respondents
              </p>
            </>
          )}
        </div>

        {/* Card 2: Poor Habits (Survey) OR Avg Anxiety (Profile) */}
        <div className="text-center">
          <div className="mb-2">
            <span className="text-6xl">{hasSurveyData ? '⚠️' : '😰'}</span>
          </div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">
            {hasSurveyData ? 'Poor Budgeting Habits' : 'Avg Financial Anxiety'}
          </h4>
          {hasSurveyData ? (
            <>
              <p className="text-5xl font-bold text-orange-400">
                {percentage.toFixed(0)}%
              </p>
              <p className="text-gray-500 text-sm mt-1">{poorBehaviorCount} respondents</p>
            </>
          ) : hasProfileData ? (
            <>
              <p className={`text-5xl font-bold ${getAnxietyColor(profileMetrics.avgAnxiety)}`}>
                {profileMetrics.avgAnxiety.toFixed(1)}
              </p>
              <p className="text-gray-500 text-sm mt-1">out of 5.0</p>
            </>
          ) : (
            <p className="text-gray-500">No data</p>
          )}
        </div>

        {/* Card 3: Insight */}
        <div className="flex items-center">
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg w-full">
            <p className="text-sm text-blue-300">
              📊 <strong>Behavior Analysis:</strong>{' '}
              {hasSurveyData ? (
                <>
                  {percentage > 40 ? 'High' : percentage > 25 ? 'Moderate' : 'Low'} percentage 
                  of respondents show concerning spending habits.
                  {percentage > 40 && ' Immediate intervention programs recommended.'}
                </>
              ) : hasProfileData ? (
                <>
                  {profileMetrics.deficitPct > 30 
                    ? `${profileMetrics.deficitPct.toFixed(0)}% spending above income - urgent counseling needed.`
                    : profileMetrics.deficitPct > 15
                    ? `${profileMetrics.deficitPct.toFixed(0)}% in deficit - education recommended.`
                    : `Healthy spending with ${profileMetrics.deficitPct.toFixed(0)}% deficit.`
                  }
                </>
              ) : (
                'No behavior data available for analysis.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorScoreCard;
