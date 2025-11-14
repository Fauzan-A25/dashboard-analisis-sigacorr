/**
 * Financial Literacy Dashboard - Metrics Calculation
 * Normalized to 0-4 scale with proper Min-Max normalization
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const MIN_LIKERT = 1;
const MAX_LIKERT = 4;
const TARGET_SCALE = 4;

/**
 * Question mapping for different dimensions
 */
const QUESTION_GROUPS = {
  // Financial Knowledge (Q1-Q9)
  financialKnowledge: Array.from({ length: 9 }, (_, i) => `Q${i + 1}`),
  
  // Digital Literacy (Q10-Q18)
  digitalLiteracy: Array.from({ length: 9 }, (_, i) => `Q${i + 10}`),
  
  // Financial Behavior (Q19-Q29)
  financialBehavior: Array.from({ length: 11 }, (_, i) => `Q${i + 19}`),
  
  // Decision Making (Q30-Q39)
  decisionMaking: Array.from({ length: 10 }, (_, i) => `Q${i + 30}`),
  
  // Well-being (Q40-Q48)
  wellbeing: Array.from({ length: 9 }, (_, i) => `Q${i + 40}`),
  
  // All questions (Q1-Q48)
  all: Array.from({ length: 48 }, (_, i) => `Q${i + 1}`)
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Normalize value from Likert scale (1-4) to target scale (0-4)
 */
const normalize = (avg: number, targetScale: number = TARGET_SCALE): number => {
  if (avg === 0) return 0;
  return ((avg - MIN_LIKERT) / (MAX_LIKERT - MIN_LIKERT)) * targetScale;
};

/**
 * Calculate average for specific questions
 */
const calculateAverage = (data: any[], questions: string[]): number => {
  if (!data || data.length === 0 || questions.length === 0) return 0;
  
  const total = data.reduce((acc, row) => {
    const sum = questions.reduce((s, q) => {
      const value = row[q];
      return s + (typeof value === 'number' ? value : 0);
    }, 0);
    return acc + sum;
  }, 0);
  
  return total / (data.length * questions.length);
};

/**
 * Calculate normalized score for a group of questions
 */
const calculateScore = (data: any[], questions: string[], targetScale: number = TARGET_SCALE): number => {
  const avg = calculateAverage(data, questions);
  return normalize(avg, targetScale);
};

// ============================================================================
// INDIVIDUAL SCORE CALCULATORS (for scatter plots and correlations)
// ============================================================================

/**
 * Calculate Financial Literacy Score for a single respondent
 */
export const calculateFinancialLiteracyScore = (row: any): number => {
  const questions = QUESTION_GROUPS.all;
  const sum = questions.reduce((acc, q) => {
    const value = row[q];
    return acc + (typeof value === 'number' ? value : 0);
  }, 0);
  const avg = sum / questions.length;
  return normalize(avg);
};

/**
 * Calculate Digital Adoption Score for a single respondent
 */
export const calculateDigitalAdoptionScore = (row: any): number => {
  const questions = QUESTION_GROUPS.digitalLiteracy;
  const sum = questions.reduce((acc, q) => {
    const value = row[q];
    return acc + (typeof value === 'number' ? value : 0);
  }, 0);
  const avg = sum / questions.length;
  return normalize(avg);
};

/**
 * Calculate Financial Behavior Score for a single respondent
 */
export const calculateBehaviorScore = (row: any): number => {
  const questions = QUESTION_GROUPS.financialBehavior;
  const sum = questions.reduce((acc, q) => {
    const value = row[q];
    return acc + (typeof value === 'number' ? value : 0);
  }, 0);
  const avg = sum / questions.length;
  return normalize(avg);
};

/**
 * Calculate Well-being Score for a single respondent
 */
export const calculateWellbeingScore = (row: any): number => {
  const questions = QUESTION_GROUPS.wellbeing;
  const sum = questions.reduce((acc, q) => {
    const value = row[q];
    return acc + (typeof value === 'number' ? value : 0);
  }, 0);
  const avg = sum / questions.length;
  return normalize(avg);
};

// ============================================================================
// AGGREGATE KPI CALCULATIONS
// ============================================================================

/**
 * Main KPI computation function
 */
export const computeKPIs = (surveyData: any[] = []) => {
  const calculate = {
    /**
     * Overall Financial Literacy Score (Q1-Q48)
     */
    literacy: (data: any[]) => {
      return calculateScore(data, QUESTION_GROUPS.all);
    },

    /**
     * Digital Adoption Score (Q10-Q18)
     */
    digital: (data: any[]) => {
      return calculateScore(data, QUESTION_GROUPS.digitalLiteracy);
    },

    /**
     * Financial Behavior Score (Q19-Q29)
     */
    behavior: (data: any[]) => {
      return calculateScore(data, QUESTION_GROUPS.financialBehavior);
    },

    /**
     * Financial Well-being Score (Q40-Q48)
     */
    wellbeing: (data: any[]) => {
      return calculateScore(data, QUESTION_GROUPS.wellbeing);
    },

    /**
     * Calculate all 5 dimensions (for bar/radar chart)
     * Scaled to 25 for better visualization
     */
    dimensions: (data: any[]) => {
      const calcDim = (questions: string[]) => {
        return calculateScore(data, questions, 25); // Scale to 25 for radar chart
      };

      return {
        financialKnowledge: calcDim(QUESTION_GROUPS.financialKnowledge),
        digitalLiteracy: calcDim(QUESTION_GROUPS.digitalLiteracy),
        financialBehavior: calcDim(QUESTION_GROUPS.financialBehavior),
        decisionMaking: calcDim(QUESTION_GROUPS.decisionMaking),
        wellbeing: calcDim(QUESTION_GROUPS.wellbeing),
      };
    },

    /**
     * Calculate trend (comparing recent vs older data)
     * Note: This assumes data is time-ordered
     */
    trend: (data: any[]) => {
      if (!data || data.length === 0) return 0;
      
      const cutoff = Math.floor(data.length * 0.8);
      const older = data.slice(0, cutoff);
      const recent = data.slice(cutoff);
      
      const olderScore = older.length ? calculate.literacy(older) : 0;
      const recentScore = recent.length ? calculate.literacy(recent) : 0;
      
      if (olderScore === 0) return 0;
      return ((recentScore - olderScore) / olderScore) * 100;
    }
  };

  return {
    literacy: calculate.literacy(surveyData),
    digital: calculate.digital(surveyData),
    behavior: calculate.behavior(surveyData),
    wellbeing: calculate.wellbeing(surveyData),
    dimensions: calculate.dimensions(surveyData),
    trend: calculate.trend(surveyData),
  };
};

// ============================================================================
// STATISTICAL HELPERS
// ============================================================================

/**
 * Calculate Pearson correlation coefficient
 */
export const calculateCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
};

/**
 * Calculate linear regression (for trendline)
 * Returns { slope, intercept }
 */
export const calculateLinearRegression = (x: number[], y: number[]): { slope: number; intercept: number } => {
  if (x.length !== y.length || x.length === 0) return { slope: 0, intercept: 0 };
  
  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
};

/**
 * Calculate R² (coefficient of determination)
 */
export const calculateRSquared = (x: number[], y: number[]): number => {
  const correlation = calculateCorrelation(x, y);
  return correlation * correlation;
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default computeKPIs;
