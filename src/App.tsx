import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import FinancialLiteracy from './pages/FinancialLiteracy';
// import BehaviorWellbeing from './pages/BehaviorWellbeing';
// import RegionalAnalysis from './pages/RegionalAnalysis';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/literacy" element={<FinancialLiteracy />} />
        {/* <Route path="/behavior" element={<BehaviorWellbeing />} /> */}
        {/* <Route path="/regional" element={<RegionalAnalysis />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
