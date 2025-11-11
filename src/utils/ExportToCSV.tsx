export const exportToCSV = (
  data: any[],
  filename: string = 'export.csv'
): void => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  try {
    // Get all unique keys from all objects
    const headers = Array.from(
      new Set(data.flatMap(obj => Object.keys(obj)))
    );

    // Create CSV header row
    const csvHeader = headers.join(',');

    // Create CSV data rows
    const csvRows = data.map(row => {
      return headers
        .map(header => {
          const value = row[header];
          // Handle null, undefined, and special characters
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          // Escape commas and quotes
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',');
    });

    // Combine header and rows
    const csvContent = [csvHeader, ...csvRows].join('\n');

    // Create Blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    alert('Failed to export data. Please try again.');
  }
};

// Export multiple datasets as separate CSV files
export const exportMultipleCSV = (
  datasets: { data: any[]; filename: string }[]
): void => {
  datasets.forEach(({ data, filename }, index) => {
    // Add delay to prevent browser blocking multiple downloads
    setTimeout(() => {
      exportToCSV(data, filename);
    }, index * 500);
  });
};
