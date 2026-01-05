// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import Dashboard from './page/dashboard';
import Inventory from './page/inventory';
import Nutrisi from './page/nutrisi';
import Dapur from './page/dapur';
import Keuangan from './page/keuangan';
import Laporan from './page/laporan';
import Pengaturana from './page/pengaturana';
import { Navigate } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/nutrisi" element={<Nutrisi />} />
        <Route path="/dapur" element={<Dapur />} />
        <Route path="/keuangan" element={<Keuangan />} />
        <Route path="/laporan" element={<Laporan />} />
        <Route path="/pengaturan" element={<Pengaturana />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;