import Papa from 'papaparse';
import { 
  transformSurveyData, 
  transformProfileData, 
  transformRegionalData 
} from './dataTransformers';

export const loadCSVData = async (fileName: string) => {
  const basePath = import.meta.env.BASE_URL || '/';
  try {
    const response = await fetch(`${basePath}data/${fileName}`);
    if (!response.ok) {
      console.warn(`CSV not found: ${fileName} (${response.status})`);
      return [];
    }

    const csvText = await response.text();

    return new Promise((resolve) => {
      try {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: 'greedy',
          complete: (results) => {
            let data = (results.data as any[]).filter((row: any) =>
              Object.values(row).some(val => val !== null && val !== undefined && val !== '')
            );

            if (fileName.includes('Survey')) {
              data = transformSurveyData(data);
            } else if (fileName.includes('Profile')) {
              data = transformProfileData(data);
            } else if (fileName.includes('Regional')) {
              data = transformRegionalData(data);
            }

            resolve(data);
          },
          error: () => {
            // If parse fails, resolve as empty to avoid breaking the app
            resolve([]);
          }
        });
      } catch (err) {
        console.error('CSV parse exception', fileName, err);
        resolve([]);
      }
    });
  } catch (err) {
    console.error('Failed to fetch CSV', fileName, err);
    return [];
  }
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
