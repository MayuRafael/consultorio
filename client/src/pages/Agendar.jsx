import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { api, mensagemDeErro } from '../services/api';

// Horários de atendimento: 08:00 às 17:30, de 30 em 30 minutos
const HORARIOS = Array.from({ length: 20 }, (_, i) => {
  const minutos = 8 * 60 + i * 30;
  const h = String(Math.floor(minutos / 60)).padStart(2, '0');
  const m = String(minutos % 60).padStart(2, '0');
  return `${h}:${m}`;
});

export default function Agendar() {
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [serviceId, setServiceId] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api('/services')
      .then((lista) => setServicos(lista))
      .catch((err) => setErro(mensagemDeErro(err)))
      .finally(() => setCarregando(false));
  }, []);

  // Data de hoje no fuso local (toISOString usaria UTC e bloquearia o dia de hoje à noite)
  const hoje = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  async function agendar(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setEnviando(true);
    try {
      // Monta a data local e envia em UTC, como o backend espera
      const dataHora = new Date(`${data}T${horario}:00`).toISOString();
      await api('/appointments', { method: 'POST', body: { serviceId, date: dataHora } });
      setSucesso('Consulta agendada com sucesso.');
      setHorario('');
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) return <Spinner />;

  return (
    <>
      <div className="card">
        <h1>Agendar consulta</h1>

        {erro && <div className="alerta alerta-erro" role="alert">{erro}</div>}
        {sucesso && (
          <div className="alerta alerta-sucesso" role="status">
            {sucesso} <Link to="/meus-agendamentos">Ver meus agendamentos</Link>
          </div>
        )}

        {servicos.length === 0 ? (
          <p>Nenhum serviço disponível no momento.</p>
        ) : (
          <form onSubmit={agendar}>
            <div className="grade-form">
              <div className="campo">
                <label htmlFor="servico">Serviço</label>
                <select id="servico" value={serviceId} onChange={(e) => setServiceId(e.target.value)} required>
                  <option value="">Escolha um serviço</option>
                  {servicos.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.durationMinutes} min)</option>
                  ))}
                </select>
              </div>
              <div className="campo">
                <label htmlFor="data">Data</label>
                <input id="data" type="date" min={hoje} value={data} onChange={(e) => setData(e.target.value)} required />
              </div>
            </div>

            <div className="campo">
              <span style={{ fontWeight: 500 }}>Horário</span>
              <div className="horarios">
                {HORARIOS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={`horario ${horario === h ? 'selecionado' : ''}`}
                    onClick={() => setHorario(h)}
                    aria-pressed={horario === h}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn" type="submit" disabled={enviando || !serviceId || !data || !horario}>
              {enviando ? 'Agendando...' : 'Confirmar agendamento'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
