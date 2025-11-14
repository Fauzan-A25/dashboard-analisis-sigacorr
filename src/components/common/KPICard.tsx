import { type FC } from 'react';
import '../../styles/components/kpi-card.css';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardProps {
  title: string;      // Contoh: "Pendapatan Bulanan"
  value: string | number; // Contoh: 5000000
  subtitle: string;   // Contoh: "Perubahan dari bulan lalu"
  icon: React.ReactNode;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  className?: string;
}

const KPICard: FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon,
  change,
  className = '',
}) => {
  const trendColor = change?.trend === 'up' ? 'text-emerald-500' : 'text-rose-500';
  const TrendIcon = change?.trend === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <div className={`kpi-card relative overflow-hidden ${className}`}>
      <div className="flex items-center gap-4">
        <div className="icon-wrapper">
          <div className="text-[var(--primary-blue)] w-6 h-6">
            {icon}
          </div>
        </div>
        <div className="flex-1">
          {/* Pastikan nilai title sudah dalam bahasa Indonesia */}
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">{title}</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <div className="value">{value}</div>
            {change && (
              <div className={`flex items-center ${trendColor} text-xs font-medium`}>
                <TrendIcon className="w-4 h-4" />
                {Math.abs(change.value)}%
              </div>
            )}
          </div>
          {/* Pastikan subtitle juga dalam bahasa Indonesia */}
          <p className="mt-1 text-xs text-[var(--text-secondary)]">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default KPICard;
