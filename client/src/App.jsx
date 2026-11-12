import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Agendar from './pages/Agendar';
import MeusAgendamentos from './pages/MeusAgendamentos';
import Admin from './pages/Admin';

export default function App() {
  const { pathname } = useLocation();

  // Telas de entrada ocupam a tela inteira, sem a barra superior
  if (pathname === '/login' || pathname === '/cadastro') {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
      </Routes>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Agendar /></ProtectedRoute>} />
          <Route path="/meus-agendamentos" element={<ProtectedRoute><MeusAgendamentos /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
