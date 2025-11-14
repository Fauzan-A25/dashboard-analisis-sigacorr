import { FC } from 'react';
import '../../styles/components/header.css';
import { Download, Sun, Moon } from 'lucide-react';
import { exportToCSV } from '../../utils/ExportToCSV';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  title: string;
  subtitle: string;
  totalRespondents?: number;
  onExport?: () => void;
  exportData?: any[];
}

const Header: FC<HeaderProps> = ({
  title,
  subtitle,
  totalRespondents,
  onExport,
  exportData
}) => {
  const { theme, toggleTheme } = useTheme();

  const handleExportData = () => {
    if (onExport) {
      onExport();
    } else if (exportData && exportData.length > 0) {
      const timestamp = new Date().toISOString().split('T')[0];
      const sanitizedTitle = title.toLowerCase().replace(/\s+/g, '_');
      const filename = `${sanitizedTitle}_${timestamp}.csv`;
      exportToCSV(exportData, filename);
    } else {
      alert('Tidak ada data untuk diekspor');
    }
  };

  return (
    <header className="app-header fixed top-0 left-[280px] right-0 z-10">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h2>
        <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {totalRespondents && (
          <div className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-5 rounded-lg border border-[var(--border)] transition-colors">
            <span className="text-sm text-[var(--text-secondary)]">
              📊 {totalRespondents.toLocaleString()} Responden
            </span>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="relative p-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] hover:border-[var(--primary-blue)] transition-all duration-300 group overflow-hidden"
          aria-label={`Beralih ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`}
          title={`Beralih ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative w-5 h-5 flex items-center justify-center">
            <Sun
              className={`absolute w-5 h-5 text-yellow-400 transition-all duration-500 ${
                theme === 'dark' 
                  ? 'rotate-0 scale-100 opacity-100' 
                  : 'rotate-90 scale-0 opacity-0'
              }`}
            />
            <Moon
              className={`absolute w-5 h-5 text-blue-600 transition-all duration-500 ${
                theme === 'light' 
                  ? 'rotate-0 scale-100 opacity-100' 
                  : '-rotate-90 scale-0 opacity-0'
              }`}
            />
          </div>
          <span className="absolute inset-0 rounded-lg bg-[var(--primary-blue)] opacity-0 group-active:opacity-20 transition-opacity duration-200" />
        </button>

        <button
          onClick={handleExportData}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-blue)] bg-opacity-10 rounded-lg text-[var(--primary-blue)] hover:bg-opacity-20 transition-colors border border-[var(--primary-blue)] border-opacity-20"
          title="Ekspor tampilan saat ini ke CSV"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Ekspor Data</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
