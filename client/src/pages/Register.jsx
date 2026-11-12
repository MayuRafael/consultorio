import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mensagemDeErro } from '../services/api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await register({ name: nome, email, password: senha });
      // Após o cadastro, o paciente faz login com os dados recém-criados
      navigate('/login');
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h1>Criar conta</h1>

      {erro && <div className="alerta alerta-erro" role="alert">{erro}</div>}

      <form onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="nome">Nome completo</label>
          <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div className="campo">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="campo">
          <label htmlFor="senha">Senha (mínimo 8 caracteres)</label>
          <input id="senha" type="password" minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </div>
        <button className="btn" type="submit" disabled={enviando} style={{ width: '100%' }}>
          {enviando ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      <p style={{ marginTop: 16, textAlign: 'center' }}>
        Já tem conta? <Link to="/login">Entre aqui</Link>
      </p>
    </div>
  );
}
