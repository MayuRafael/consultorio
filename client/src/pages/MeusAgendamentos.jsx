import { useCallback, useEffect, useState } from 'react';
import Spinner from '../components/Spinner';
import { api, mensagemDeErro } from '../services/api';

export function formatarDataHora(iso) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function MeusAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(() => {
    setCarregando(true);
    api('/appointments')
      .then(setAgendamentos)
      .catch((err) => setErro(mensagemDeErro(err)))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function cancelar(id) {
    setErro('');
    try {
      await api(`/appointments/${id}/cancelar`, { method: 'PATCH' });
      carregar();
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  }

  return (
    <div className="card">
      <h1>Meus agendamentos</h1>

      {erro && <div className="alerta alerta-erro" role="alert">{erro}</div>}

      {carregando ? (
        <Spinner />
      ) : agendamentos.length === 0 ? (
        <p>Você ainda não tem agendamentos.</p>
      ) : (
        agendamentos.map((a) => (
          <div className="item" key={a._id}>
            <div>
              <strong>{a.service?.name}</strong>
              <div className="detalhe">{formatarDataHora(a.date)}</div>
            </div>
            <div className="acoes">
              <span className={`badge badge-${a.status}`}>
                {a.status === 'agendado' ? 'Agendado' : 'Cancelado'}
              </span>
              {a.status === 'agendado' && (
                <button className="btn btn-perigo" onClick={() => cancelar(a._id)}>Cancelar</button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
