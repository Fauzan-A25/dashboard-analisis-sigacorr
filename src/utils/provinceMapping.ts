export const PROVINCE_NAME_MAP: Record<string, string> = {
  // English -> Indonesian
  'West Sumatera': 'Sumatera Barat',
  'North Sumatera': 'Sumatera Utara',
  'South Sumatera': 'Sumatera Selatan',
  'West Java': 'Jawa Barat',
  'Central Java': 'Jawa Tengah',
  'East Java': 'Jawa Timur',
  'DKI Jakarta': 'DKI Jakarta', // Same
  'Yogyakarta': 'DI Yogyakarta',
  'Banten': 'Banten', // Same
  'Bali': 'Bali', // Same
  'West Nusa Tenggara': 'Nusa Tenggara Barat',
  'East Nusa Tenggara': 'Nusa Tenggara Timur',
  'Aceh': 'Nangrou Aceh Darusalam',
  'Riau': 'Riau', // Same
  'Riau Islands': 'Kepulauan Riau',
  'Bangka Belitung Islands': 'Kepualauan Bangka Belitung',
  'Jambi': 'Jambi', // Same
  'Bengkulu': 'Bengkulu', // Same
  'Lampung': 'Lampung', // Same
  'West Kalimantan': 'Kalimantan Barat',
  'Central Kalimantan': 'Kalimantan Tengah',
  'North Kalimantan': 'Kalimantan Utara',
  'East Kalimantan': 'Kalimantan Timur',
  'South Kalimantan': 'Kalimantan Selatan',
  'North Sulawesi': 'Sulawesi Utara',
  'Gorontalo': 'Gorontalo', // Same
  'Central Sulawesi': 'Sulawesi Tengah',
  'West Sulawesi': 'Sulawesi Barat',
  'South Sulawesi': 'Sulawesi Selatan',
  'Southeast Sulawesi': 'Sulawesi Tenggara',
  'North Maluku': 'Maluku Utara',
  'Maluku': 'Maluku', // Same
  'West Papua': 'Papua Barat',
  'Papua': 'Papua', // Same
  'Central Papua': 'Papua Tengah',
  'Highland Papua': 'Papua Pegunungan',
  'South Papua': 'Papua Selatan',
  'Southwest Papua': 'Papua Barat Daya'
};

export const normalizeProvinceName = (name: string): string => {
  // Try direct mapping first
  if (PROVINCE_NAME_MAP[name]) {
    return PROVINCE_NAME_MAP[name];
  }
  
  // Try reverse mapping (Indonesian -> Indonesian, returns same)
  const reverseMap = Object.entries(PROVINCE_NAME_MAP).find(
    ([_, indoName]) => indoName === name
  );
  
  if (reverseMap) {
    return reverseMap[1]; // Return Indonesian name
  }
  
  // Return original if no mapping found
  return name;
};
