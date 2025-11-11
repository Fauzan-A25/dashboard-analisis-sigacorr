import { type FC } from 'react';
import KPICard from '../../components/common/KPICard';
import { BrainCircuit, Smartphone, TrendingUp, Users } from 'lucide-react';
import { computeKPIs } from '../metrics';

interface Props {
  surveyData: any[];
  profileData?: any[];
}

const KPIs: FC<Props> = ({ surveyData = [] }) => {
  const kpis = computeKPIs(surveyData);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KPICard
        title="Financial Literacy Score"
        value={`${kpis.literacy.toFixed(1)}/4`}
        subtitle="Overall financial literacy"
        icon={<BrainCircuit className="w-full h-full" />}
      />

      <KPICard
        title="Digital Adoption Score"
        value={`${kpis.digital.toFixed(1)}/4`}
        subtitle="Digital finance competency"
        icon={<Smartphone className="w-full h-full" />}
      />

      <KPICard
        title="Financial Behavior Score"
        value={`${kpis.behavior.toFixed(1)}/4`}
        subtitle="Money management habits"
        icon={<TrendingUp className="w-full h-full" />}
      />

      <KPICard
        title="Well-being Index"
        value={`${kpis.wellbeing.toFixed(1)}/4`}
        subtitle="Financial well-being"
        icon={<Users className="w-full h-full" />}
      />
    </div>
  );
};

export default KPIs;
