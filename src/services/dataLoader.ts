import Papa from 'papaparse';
import { 
  transformSurveyData, 
  transformProfileData, 
  transformRegionalData 
} from './dataTransformers';

export const loadCSVData = async (fileName: string) => {
  const response = await fetch(`./public/data/${fileName}`);
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy', // ← CHANGE: Only skip truly empty lines
      complete: (results) => {
        console.log(`[${fileName}] Raw rows parsed:`, results.data.length);
        
        let data = results.data;
        
        // Remove truly empty rows manually (more control)
        data = data.filter((row: any) => {
          // Check if row has at least one non-null value
          return Object.values(row).some(val => 
            val !== null && val !== undefined && val !== ''
          );
        });
        
        console.log(`[${fileName}] After filtering empty rows:`, data.length);
        
        // Transform based on file name
        if (fileName.includes('Survey')) {
          data = transformSurveyData(data);
        } else if (fileName.includes('Profile')) {
          data = transformProfileData(data);
        } else if (fileName.includes('Regional')) {
          data = transformRegionalData(data);
        }
        
        console.log(`[${fileName}] After transformation:`, data.length);
        
        resolve(data);
      },
      error: (error: unknown) => {
        console.error(`[${fileName}] Parse error:`, error);
        reject(error);
      }
    });
  });
};

export const loadAllData = async () => {
  console.log('🔄 Starting data load...');
  
  const [surveyData, profileData, regionalData] = await Promise.all([
    loadCSVData('GenZ_Financial_Literacy_Survey_CLEAN.csv'),
    loadCSVData('GenZ_Financial_Profile_CLEAN.csv'),
    loadCSVData('Regional_Economic_Indicators_CLEAN.csv')
  ]);

  return { surveyData, profileData, regionalData };
};
