import { useCallback, useEffect, useState } from 'react';
import Spinner from '../components/Spinner';
import { api, mensagemDeErro } from '../services/api';
import { formatarDataHora } from './MeusAgendamentos';

export default function Admin() {
  const [servicos, setServicos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Formulário de novo serviço
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [duracao, setDuracao] = useState(30);

  const carregar = useCallback(() => {
    setCarregando(true);
    Promise.all([api('/services'), api('/appointments')])
      .then(([listaServicos, listaAgendamentos]) => {
        setServicos(listaServicos);
        setAgendamentos(listaAgendamentos);
      })
      .catch((err) => setErro(mensagemDeErro(err)))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // Executa uma ação e mostra o resultado; depois recarrega os dados
  async function executar(acao, mensagemOk) {
    setErro('');
    setSucesso('');
    try {
      await acao();
      setSucesso(mensagemOk);
      carregar();
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  }

  function criarServico(e) {
    e.preventDefault();
    executar(
      () => api('/services', { method: 'POST', body: { name: nome, description: descricao, durationMinutes: Number(duracao) } })
        .then(() => { setNome(''); setDescricao(''); setDuracao(30); }),
      'Serviço criado.'
    );
  }

  const removerServico = (id) =>
    executar(() => api(`/services/${id}`, { method: 'DELETE' }), 'Serviço removido.');

  const cancelarAgendamento = (id) =>
    executar(() => api(`/appointments/${id}/cancelar`, { method: 'PATCH' }), 'Agendamento cancelado.');

  const removerAgendamento = (id) =>
    executar(() => api(`/appointments/${id}`, { method: 'DELETE' }), 'Agendamento removido.');

  if (carregando) return <Spinner />;

  return (
    <>
      {erro && <div className="alerta alerta-erro" role="alert">{erro}</div>}
      {sucesso && <div className="alerta alerta-sucesso" role="status">{sucesso}</div>}

      <div className="card">
        <h2>Novo serviço</h2>
        <form onSubmit={criarServico}>
          <div className="grade-form">
            <div className="campo">
              <label htmlFor="nome-servico">Nome</label>
              <input id="nome-servico" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="campo">
              <label htmlFor="duracao">Duração (minutos)</label>
              <input id="duracao" type="number" min={5} max={480} value={duracao} onChange={(e) => setDuracao(e.target.value)} required />
            </div>
          </div>
          <div className="campo">
            <label htmlFor="descricao">Descrição</label>
            <input id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <button className="btn" type="submit">Adicionar serviço</button>
        </form>
      </div>

      <div className="card">
        <h2>Serviços</h2>
        {servicos.length === 0 && <p>Nenhum serviço cadastrado.</p>}
        {servicos.map((s) => (
          <div className="item" key={s._id}>
            <div>
              <strong>{s.name}</strong>
              <div className="detalhe">{s.durationMinutes} min{s.description ? ` · ${s.description}` : ''}</div>
            </div>
            <button className="btn btn-perigo" onClick={() => removerServico(s._id)}>Remover</button>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Agenda</h2>
        {agendamentos.length === 0 && <p>Nenhum agendamento.</p>}
        {agendamentos.map((a) => (
          <div className="item" key={a._id}>
            <div>
              <strong>{formatarDataHora(a.date)}</strong> · {a.service?.name}
              <div className="detalhe">Paciente: {a.patient?.name} ({a.patient?.email})</div>
            </div>
            <div className="acoes">
              <span className={`badge badge-${a.status}`}>{a.status === 'agendado' ? 'Agendado' : 'Cancelado'}</span>
              {a.status === 'agendado' && (
                <button className="btn btn-contorno" onClick={() => cancelarAgendamento(a._id)}>Cancelar</button>
              )}
              <button className="btn btn-perigo" onClick={() => removerAgendamento(a._id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
