// DATA TYPES - Interface Definitions

export interface FinancialLiteracyData {
  // Q1..Q48 responses (number values expected)
  [key: string]: any; // keep flexible for now
}

export interface FinancialProfileData {
  user_id?: string;
  gender?: string;
  birth_year?: number;
  province?: string;
  education_level?: string;
  employment_status?: string; // ✅ ADD THIS
  avg_monthly_income?: number; // numeric approximation (midpoint) when possible
  avg_monthly_income_raw?: string;
  avg_monthly_expense?: number; // numeric approximation (midpoint)
  avg_monthly_expense_raw?: string;
  main_fintech_app?: string;
  ewallet_spending?: number;
  ewallet_spending_raw?: string;
  investment_type?: string;
  investment_value?: number;
  loan_usage_purpose?: string;
  outstanding_loan?: number;
  digital_time_spent_per_day?: number;
  financial_anxiety_score?: number;
  created_at?: string;
}

export interface RegionalEconomicData {
  province?: string;
  total_loan_accounts?: number;
  total_loan_amount_billion?: number;
  total_lenders_accounts?: number;
  twp_90?: number;
  total_borrowers_accounts?: number;
  outstanding_loan_billion?: number;
  population_thousands?: number;
  pdrb_ribu?: number;
  urbanization_percent?: number;
}
