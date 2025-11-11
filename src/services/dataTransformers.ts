/**
 * Data Transformers
 * Transform raw CSV data into structured formats
 */

/**
 * Transform Survey Data (1601 rows)
 * Maps question columns to Q1..Q48 format
 */
export const transformSurveyData = (rawData: any[]): any[] => {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    console.warn('⚠️ transformSurveyData: No data to transform');
    return [];
  }

  console.log(`📊 Transforming ${rawData.length} survey rows...`);

  const demographicKeys = new Set([
    'Gender', 'gender',
    'Province of Origin', 'Province', 'province',
    'Residence Status', 'Residence_Status',
    'Last Education', 'Last_Education', 'education_level',
    'Job', 'Marital Status', 'Year of Birth', 'birth_year',
    'Est. Monthly Income', 'Est. Monthly Expenditure'
  ]);

  // Get headers from first non-empty row
  const firstRow = rawData.find(row => Object.keys(row).length > 0);
  if (!firstRow) {
    console.error('❌ No valid rows found');
    return [];
  }

  const headers = Object.keys(firstRow);
  const questionCols = headers.filter(h => h && !demographicKeys.has(h));
  
  console.log(`Found ${questionCols.length} question columns`);

  const transformed = rawData
    .filter(row => {
      // Filter out rows that are completely empty or invalid
      const hasData = Object.values(row).some(val => 
        val !== null && val !== undefined && val !== ''
      );
      return hasData;
    })
    .map((row) => {
      const out: any = { ...row };

      // Normalize demographic fields
      if ('Year of Birth' in row) {
        out.birth_year = Number(row['Year of Birth']) || null;
      }
      if ('Gender' in row) {
        out.gender = row['Gender'];
      }
      if ('Province of Origin' in row) {
        out.province = row['Province of Origin'];
      }
      if ('Last Education' in row) {
        out.education_level = row['Last Education'];
      }

      // Map question columns to Q1..Qn
      let qIndex = 1;
      for (const col of questionCols) {
        if (!col || typeof col !== 'string') continue;
        
        const key = `Q${qIndex}`;
        const rawVal = row[col];
        let val: number = 0;
        
        if (rawVal === null || rawVal === undefined || rawVal === '') {
          val = 0;
        } else if (typeof rawVal === 'number') {
          val = rawVal;
        } else {
          const parsed = parseFloat(String(rawVal).replace(',', '.'));
          val = Number.isFinite(parsed) ? parsed : 0;
        }
        
        out[key] = val;
        qIndex++;
      }

      // Ensure Q1..Q48 exist
      for (let i = 1; i <= 48; i++) {
        const k = `Q${i}`;
        if (!(k in out)) out[k] = 0;
      }

      return out;
    });

  console.log(`✅ Transformed ${transformed.length} survey rows`);
  return transformed;
};

/**
 * Transform Profile Data (1000 rows)
 * Parse income/expense ranges and extract numeric values
 */
export const transformProfileData = (rawData: any[]): any[] => {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    console.warn('⚠️ transformProfileData: No data to transform');
    return [];
  }

  console.log(`📊 Transforming ${rawData.length} profile rows...`);

  const transformed = rawData
    .filter(row => {
      const hasData = Object.values(row).some(val => 
        val !== null && val !== undefined && val !== ''
      );
      return hasData;
    })
    .map((row, index) => ({
      user_id: row.user_id || `USER_${index + 1}`,
      gender: row.gender || 'Unknown',
      birth_year: Number(row.birth_year) || null,
      province: row.province || 'Unknown',
      education_level: row.education_level || 'Unknown',
      employment_status: row.employment_status || 'Unknown',
      
      // Keep as string - don't convert!
      avg_monthly_income: row.avg_monthly_income || '',
      avg_monthly_expense: row.avg_monthly_expense || '',
      
      main_fintech_app: row.main_fintech_app || '',
      ewallet_spending: row.ewallet_spending || '',
      investment_type: row.investment_type || '',
      loan_usage_purpose: row.loan_usage_purpose || '',
      outstanding_loan: Number(row.outstanding_loan) || 0,
      digital_time_spent_per_day: Number(row.digital_time_spent_per_day) || 0,
      financial_anxiety_score: Number(row.financial_anxiety_score) || 0,
    }));

  console.log(`✅ Transformed ${transformed.length} profile rows`);
  return transformed;
};

/**
 * Transform Regional Economic Data (38 provinces)
 * Maps Indonesian column names to English keys
 */
export const transformRegionalData = (rawData: any[]): any[] => {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    console.warn('⚠️ transformRegionalData: No data to transform');
    return [];
  }

  console.log(`📊 Transforming ${rawData.length} regional rows...`);

  const transformed = rawData.map((row) => ({
    province: row.Provinsi || row.Province || row.province || 'Unknown',
    
    // Loan metrics
    total_loan_accounts: Number(row['Jumlah Rekening Penerima Pinjaman Aktif (entitas)']) || 0,
    total_loan_amount_billion: Number(row['Jumlah Dana yang Diberikan (Rp miliar)']) || 0,
    total_lenders_accounts: Number(row['Jumlah Rekening Pemberi Pinjaman (akun)']) || 0,
    total_borrowers_accounts: Number(row['Jumlah Penerima Pinjaman (akun)']) || 0,
    outstanding_loan_billion: Number(row['Outstanding Pinjaman (Rp miliar)']) || 0,
    
    // Risk metric
    twp_90: Number(row['TWP 90%']) || 0,
    
    // Economic & demographic indicators
    population_thousands: Number(row['Jumlah Penduduk (Ribu)']) || 0,
    pdrb_ribu: Number(row['PDRB (Ribu Rp)']) || 0,
    urbanization_percent: Number(row['Urbanisasi (%)']) || 0,
  }));

  console.log(`✅ Transformed ${transformed.length} regional rows`);
  return transformed;
};
