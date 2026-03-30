import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LossCalculator from './LossCalculator';
import RoiCalculator from './RoiCalculator';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LossCalculator />} />
        <Route path="/roi" element={<RoiCalculator />} />
      </Routes>
    </BrowserRouter>
  );
}
