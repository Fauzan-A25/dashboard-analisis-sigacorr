import { type FC } from 'react';
import KPICard from '../../../components/common/KPICard';
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
        title="Skor Literasi Keuangan"
        value={`${kpis.literacy.toFixed(1)}/4`}
        subtitle="Literasi keuangan secara keseluruhan"
        icon={<BrainCircuit className="w-full h-full" />}
      />

      <KPICard
        title="Skor Adopsi Digital"
        value={`${kpis.digital.toFixed(1)}/4`}
        subtitle="Kompetensi finansial digital"
        icon={<Smartphone className="w-full h-full" />}
      />

      <KPICard
        title="Skor Perilaku Keuangan"
        value={`${kpis.behavior.toFixed(1)}/4`}
        subtitle="Kebiasaan pengelolaan uang"
        icon={<TrendingUp className="w-full h-full" />}
      />

      <KPICard
        title="Indeks Kesejahteraan"
        value={`${kpis.wellbeing.toFixed(1)}/4`}
        subtitle="Kesejahteraan finansial"
        icon={<Users className="w-full h-full" />}
      />
    </div>
  );
};

export default KPIs;
