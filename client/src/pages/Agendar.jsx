import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import CalendarioMes from '../components/CalendarioMes';
import { api, mensagemDeErro } from '../services/api';
import { chaveDia, horaMinuto } from '../services/datas';

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
  const [mesVisivel, setMesVisivel] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [horario, setHorario] = useState('');
  const [ocupados, setOcupados] = useState([]);
  const [carregandoOcupados, setCarregandoOcupados] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);

  const hoje = chaveDia(new Date());

  // Serviços disponíveis
  useEffect(() => {
    api('/services')
      .then((lista) => setServicos(lista))
      .catch((err) => setErro(mensagemDeErro(err)))
      .finally(() => setCarregando(false));
  }, []);

  // Horários ocupados do mês visível. O período vai do dia 1 até o dia 1 do mês seguinte, no fuso local.
  useEffect(() => {
    const ano = mesVisivel.getFullYear();
    const mes = mesVisivel.getMonth();
    const inicio = new Date(ano, mes, 1).toISOString();
    const fim = new Date(ano, mes + 1, 1).toISOString();

    setCarregandoOcupados(true);
    api(`/appointments/ocupados?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`)
      .then((lista) => setOcupados(lista.map((iso) => new Date(iso))))
      .catch((err) => setErro(mensagemDeErro(err)))
      .finally(() => setCarregandoOcupados(false));
  }, [mesVisivel]);

  // Quantidade de consultas por dia e conjunto de "dia horário" ocupados
  const { contagemPorDia, horariosOcupados } = useMemo(() => {
    const contagem = {};
    const ocupadosSet = new Set();
    ocupados.forEach((data) => {
      const dia = chaveDia(data);
      contagem[dia] = (contagem[dia] || 0) + 1;
      ocupadosSet.add(`${dia} ${horaMinuto(data)}`);
    });
    return { contagemPorDia: contagem, horariosOcupados: ocupadosSet };
  }, [ocupados]);

  // Um horário fica indisponível se já estiver ocupado ou se já passou
  function horarioIndisponivel(h) {
    if (!dataSelecionada) return false;
    if (horariosOcupados.has(`${dataSelecionada} ${h}`)) return true;
    return new Date(`${dataSelecionada}T${h}:00`) < new Date();
  }

  function selecionarDia(chave) {
    setDataSelecionada(chave);
    setHorario('');
    setSucesso('');
    setErro('');
  }

  async function agendar(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setEnviando(true);
    try {
      // Monta a data local e envia em UTC, como o backend espera
      const dataHora = new Date(`${dataSelecionada}T${horario}:00`).toISOString();
      await api('/appointments', { method: 'POST', body: { serviceId, date: dataHora } });
      setSucesso('Consulta agendada com sucesso.');
      setHorario('');
      // Recarrega os horários ocupados do mês
      setMesVisivel(new Date(mesVisivel));
    } catch (err) {
      setErro(mensagemDeErro(err));
      // Pode ter sido ocupado por outra pessoa: atualiza a grade
      setMesVisivel(new Date(mesVisivel));
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) return <Spinner />;

  return (
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
            <span style={{ fontWeight: 500 }}>Data</span>
            <CalendarioMes
              mes={mesVisivel}
              onMudarMes={setMesVisivel}
              selecionada={dataSelecionada}
              onSelecionar={selecionarDia}
              contagemPorDia={contagemPorDia}
              minimo={hoje}
            />
            <p className="legenda">
              Os dias com consultas mostram quantos horários estão ocupados. Escolha um dia para ver os horários.
            </p>
          </div>

          {dataSelecionada && (
            <div className="campo">
              <span style={{ fontWeight: 500 }}>Horário</span>
              {carregandoOcupados ? (
                <Spinner />
              ) : (
                <div className="horarios">
                  {HORARIOS.map((h) => {
                    const indisponivel = horarioIndisponivel(h);
                    return (
                      <button
                        key={h}
                        type="button"
                        className={`horario ${horario === h ? 'selecionado' : ''}`}
                        onClick={() => setHorario(h)}
                        disabled={indisponivel}
                        aria-pressed={horario === h}
                        title={indisponivel ? 'Horário indisponível' : `Escolher ${h}`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <button className="btn" type="submit" disabled={enviando || !serviceId || !dataSelecionada || !horario}>
            {enviando ? 'Agendando...' : 'Confirmar agendamento'}
          </button>
        </form>
      )}
    </div>
  );
}
