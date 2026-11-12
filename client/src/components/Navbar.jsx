import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function sair() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <Link to="/" className="marca">Consultório</Link>

      <nav className="menu">
        {user ? (
          <>
            <NavLink to="/">Agendar</NavLink>
            <NavLink to="/meus-agendamentos">Meus agendamentos</NavLink>
            {user.role === 'Admin' && <NavLink to="/admin">Administração</NavLink>}
            <span className="usuario">{user.name}</span>
            <button className="btn btn-secundario" onClick={sair}>Sair</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Entrar</NavLink>
            <NavLink to="/cadastro">Cadastrar</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
