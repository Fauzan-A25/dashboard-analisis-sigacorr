
import {
  FinancialLiteracyData,
  FinancialProfileData,
  RegionalEconomicData,
} from '../services/dataTypes';
import { create } from 'zustand';
import { loadAllData } from '../services/dataLoader';

interface DashboardState {
  surveyData: FinancialLiteracyData[];
  profileData: FinancialProfileData[];
  regionalData: RegionalEconomicData[];
  isLoading: boolean;
  error: string | null;
  selectedProvince: string | null;
  selectedDateRange: [Date, Date];
  filters: {
    educationLevel: string | null;
    ageGroup: string | null;
    gender: string | null;
  };
  initialize: () => Promise<void>;
  setSelectedProvince: (province: string | null) => void;
  setSelectedDateRange: (range: [Date, Date]) => void;
  setFilter: (key: keyof DashboardState['filters'], value: string | null) => void;
}

export const useStore = create<DashboardState>((set) => ({
  surveyData: [],
  profileData: [],
  regionalData: [],
  isLoading: false,
  error: null,
  selectedProvince: null,
  selectedDateRange: [new Date(2025, 0, 1), new Date()],
  filters: {
    educationLevel: null,
    ageGroup: null,
    gender: null,
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      const data = await loadAllData();
      set({
        surveyData: data.surveyData as FinancialLiteracyData[],
        profileData: data.profileData as FinancialProfileData[],
        regionalData: data.regionalData as RegionalEconomicData[],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load data',
        isLoading: false,
      });
    }
  },

  setSelectedProvince: (province) => set({ selectedProvince: province }),

  setSelectedDateRange: (range) => set({ selectedDateRange: range }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),
}));