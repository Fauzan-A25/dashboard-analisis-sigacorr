import { literacyScoreRanges, anxietyLevels } from './constants';
import { type FinancialProfileData } from '../services/dataTypes';


// Get color based on literacy score
export const getLiteracyScoreColor = (score: number): string => {
  if (score >= literacyScoreRanges.excellent.min) return literacyScoreRanges.excellent.color;
  if (score >= literacyScoreRanges.good.min) return literacyScoreRanges.good.color;
  if (score >= literacyScoreRanges.fair.min) return literacyScoreRanges.fair.color;
  return literacyScoreRanges.poor.color;
};


// Get label based on literacy score
export const getLiteracyScoreLabel = (score: number): string => {
  if (score >= literacyScoreRanges.excellent.min) return literacyScoreRanges.excellent.label;
  if (score >= literacyScoreRanges.good.min) return literacyScoreRanges.good.label;
  if (score >= literacyScoreRanges.fair.min) return literacyScoreRanges.fair.label;
  return literacyScoreRanges.poor.label;
};


// Get color based on anxiety score
export const getAnxietyLevelColor = (score: number): string => {
  if (score <= anxietyLevels.low.max) return anxietyLevels.low.color;
  if (score <= anxietyLevels.medium.max) return anxietyLevels.medium.color;
  return anxietyLevels.high.color;
};


// Get label based on anxiety score
export const getAnxietyLevelLabel = (score: number): string => {
  if (score <= anxietyLevels.low.max) return anxietyLevels.low.label;
  if (score <= anxietyLevels.medium.max) return anxietyLevels.medium.label;
  return anxietyLevels.high.label;
};


// Calculate age from birth year (fixed to use 2025 as reference year)
export const calculateAge = (birthYear: number): number => {
  return 2025 - birthYear;
};


// ✅ FIXED: Get age group from birth year (consistent with Dashboard.tsx)
export const getAgeGroup = (birthYear: number): string => {
  const age = calculateAge(birthYear);
  if (age <= 17) return '13-17';
  if (age <= 20) return '18-20';
  if (age <= 23) return '21-23';
  if (age <= 25) return '24-25';
  return '>25';
};


// Filter data by date range
export const filterByDateRange = <T extends { created_at?: string }>(
  data: T[],
  dateRange: [Date, Date]
): T[] => {
  return data.filter((item) => {
    if (!item.created_at) return true;
    const date = new Date(item.created_at);
    return date >= dateRange[0] && date <= dateRange[1];
  });
};


// Filter profile data by multiple criteria
export const filterProfileData = (
  data: FinancialProfileData[],
  filters: {
    province?: string | null;
    educationLevel?: string | null;
    ageGroup?: string | null;
    gender?: string | null;
  }
): FinancialProfileData[] => {
  return data.filter((item) => {
    if (filters.province && item.province !== filters.province) return false;
    if (filters.educationLevel && item.education_level !== filters.educationLevel) return false;
    if (filters.gender && item.gender !== filters.gender) return false;
    if (filters.ageGroup) {
      if (typeof item.birth_year !== 'number' || getAgeGroup(item.birth_year) !== filters.ageGroup) return false;
    }
    return true;
  });
};
