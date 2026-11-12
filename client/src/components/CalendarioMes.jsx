// Grade do mês. Não sabe nada de agendamento: recebe os dados prontos e avisa quando um dia é escolhido.
const DIAS_DA_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function CalendarioMes({ mes, onMudarMes, selecionada, onSelecionar, contagemPorDia, minimo }) {
  const ano = mes.getFullYear();
  const indiceMes = mes.getMonth();

  const primeiroDiaDaSemana = new Date(ano, indiceMes, 1).getDay();
  const diasNoMes = new Date(ano, indiceMes + 1, 0).getDate();
  const celulas = [
    ...Array(primeiroDiaDaSemana).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];

  // Não deixa navegar para meses anteriores ao mês atual
  const mesAnterior = new Date(ano, indiceMes - 1, 1);
  const chaveMesAnterior = `${mesAnterior.getFullYear()}-${pad(mesAnterior.getMonth() + 1)}`;
  const anteriorBloqueado = chaveMesAnterior < minimo.slice(0, 7);

  const textoDoMes = mes.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const nomeDoMes = textoDoMes.charAt(0).toUpperCase() + textoDoMes.slice(1);

  return (
    <div className="calendario">
      <div className="cal-cabecalho">
        <button
          type="button"
          className="btn btn-contorno"
          onClick={() => onMudarMes(mesAnterior)}
          disabled={anteriorBloqueado}
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <strong>{nomeDoMes}</strong>
        <button
          type="button"
          className="btn btn-contorno"
          onClick={() => onMudarMes(new Date(ano, indiceMes + 1, 1))}
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>

      <div className="cal-grade">
        {DIAS_DA_SEMANA.map((d) => (
          <div key={d} className="cal-dia-semana">{d}</div>
        ))}

        {celulas.map((dia, i) => {
          if (dia === null) return <div key={`vazio-${i}`} />;

          const chave = `${ano}-${pad(indiceMes + 1)}-${pad(dia)}`;
          const passado = chave < minimo;
          const ocupados = contagemPorDia[chave] || 0;
          const classes = [
            'dia',
            selecionada === chave ? 'selecionado' : '',
            ocupados > 0 ? 'com-consultas' : '',
          ].join(' ');

          return (
            <button
              key={chave}
              type="button"
              className={classes}
              disabled={passado}
              onClick={() => onSelecionar(chave)}
              aria-pressed={selecionada === chave}
            >
              <span>{dia}</span>
              {ocupados > 0 && <small>{ocupados} ocupado{ocupados > 1 ? 's' : ''}</small>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
