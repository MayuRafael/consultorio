import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mensagemDeErro } from '../services/api';
import AuthLayout from '../components/AuthLayout';

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
    <AuthLayout
      titulo="Criar conta"
      subtitulo="Leva menos de um minuto. Depois é só entrar e agendar."
      rodape={<>Já tem conta? <Link to="/login">Entre aqui</Link></>}
    >
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
        <button className="btn btn-bloco" type="submit" disabled={enviando}>
          {enviando ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </AuthLayout>
  );
}
