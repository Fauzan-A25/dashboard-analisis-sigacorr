import { FC } from 'react';
import '../../styles/components/header.css';
import { Download } from 'lucide-react';
import { exportToCSV } from '../../utils/ExportToCSV';

interface HeaderProps {
  title: string;
  subtitle: string;
  totalRespondents?: number;
  onExport?: () => void; // Optional custom export handler
  exportData?: any[]; // Data to export
}

const Header: FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  totalRespondents,
  onExport,
  exportData
}) => {
  const handleExportData = () => {
    if (onExport) {
      // Use custom export handler if provided
      onExport();
    } else if (exportData && exportData.length > 0) {
      // Default export behavior
      const timestamp = new Date().toISOString().split('T')[0];
      const sanitizedTitle = title.toLowerCase().replace(/\s+/g, '_');
      const filename = `${sanitizedTitle}_${timestamp}.csv`;
      exportToCSV(exportData, filename);
    } else {
      alert('No data available to export');
    }
  };

  return (
    <header className="app-header fixed top-0 left-[280px] right-0 z-10">
      {/* Left Section - Dynamic Title */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h2>
        <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Sample Info */}
        {totalRespondents && (
          <div className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-5 rounded-lg">
            <span className="text-sm text-[var(--text-secondary)]">
              📊 {totalRespondents.toLocaleString()} Respondents
            </span>
          </div>
        )}

        {/* Export Button */}
        <button
          onClick={handleExportData}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-blue)] bg-opacity-10 rounded-lg text-[var(--primary-blue)] hover:bg-opacity-20 transition-colors"
          title="Export current view to CSV"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Export Data</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
