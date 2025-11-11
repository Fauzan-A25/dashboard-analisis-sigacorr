import { type FC, useMemo } from 'react';
import { calculateFinancialLiteracyScore } from '../metrics';

interface TopBottomPerformersProps {
  surveyData: any[];
}

const TopBottomPerformers: FC<TopBottomPerformersProps> = ({ surveyData }) => {
  
  /**
   * Calculate average literacy by province
   */
  const provinceScores = useMemo(() => {
    const groups: Record<string, number[]> = {};
    
    surveyData.forEach(row => {
      const province = row['Province of Origin'] || row.province || 'Unknown';
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
    if (score >= 3) return 'text-green-400';
    if (score >= 2.5) return 'text-blue-400';
    if (score >= 2) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBarWidth = (score: number) => {
    return `${(score / 4) * 100}%`;
  };

  return (
    <div className="glass-panel p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          Top & Bottom Performers by Province
        </h3>
        <p className="text-sm text-gray-400">
          Provinces with highest and lowest financial literacy
        </p>
      </div>

      {surveyData.length === 0 ? (
        <div className="h-[400px] flex items-center justify-center text-gray-500">
          No data available
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Top 5 Performers */}
          <div>
            <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
              <span className="text-xl">🏆</span>
              Top 5 Provinces
            </h4>
            <div className="space-y-3">
              {top5.map((item, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-green-400">#{index + 1}</span>
                      <span className="text-sm text-gray-300">{item.province}</span>
                      <span className="text-xs text-gray-500">({item.count})</span>
                    </div>
                    <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>
                      {item.score.toFixed(2)}/4
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                      style={{ width: getBarWidth(item.score) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom 5 Performers */}
          <div>
            <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              Bottom 5 Provinces (Need Intervention)
            </h4>
            <div className="space-y-3">
              {bottom5.map((item, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-red-400">#{provinceScores.length - index}</span>
                      <span className="text-sm text-gray-300">{item.province}</span>
                      <span className="text-xs text-gray-500">({item.count})</span>
                    </div>
                    <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>
                      {item.score.toFixed(2)}/4
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
                      style={{ width: getBarWidth(item.score) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-300 mb-1">Best Province</p>
              <p className="text-sm font-bold text-green-400">{top5[0]?.province}</p>
              <p className="text-lg font-bold text-green-300">{top5[0]?.score.toFixed(2)}/4</p>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs text-red-300 mb-1">Worst Province</p>
              <p className="text-sm font-bold text-red-400">{bottom5[0]?.province}</p>
              <p className="text-lg font-bold text-red-300">{bottom5[0]?.score.toFixed(2)}/4</p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300 mb-1">Gap</p>
              <p className="text-lg font-bold text-blue-400">
                {(top5[0]?.score - bottom5[0]?.score).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">points difference</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBottomPerformers;
