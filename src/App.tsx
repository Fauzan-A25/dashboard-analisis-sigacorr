import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard/Dashboard';
import FinancialLiteracy from './pages/financialliteracy/FinancialLiteracy';
import BehaviorWellbeing from './pages/behaviorwellbeing/BehaviorWellbeing';
import RegionalAnalysis from './pages/regionalanalysis/RegionalAnalysis';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/literacy" element={<FinancialLiteracy />} />
        <Route path="/behavior" element={<BehaviorWellbeing />} />
        <Route path="/regional" element={<RegionalAnalysis />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
