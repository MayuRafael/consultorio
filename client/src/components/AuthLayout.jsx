// Nome e contato da clínica. Para trocar o nome, altere apenas aqui.
// Os dados de suporte são de demonstração e não são usados por nenhum recurso.
const CLINICA = {
  nome: 'Clínica Vida',
  suporte: {
    telefone: '(00) 00000-0000',
    email: 'suporte@exemplo.com',
    horario: 'Seg a sex, 8h às 17h',
  },
};

// Layout das telas de entrada: painel verde com a identidade da clínica à esquerda
// e o formulário à direita. No celular, o painel vira um cabeçalho curto.
export default function AuthLayout({ titulo, subtitulo, children, rodape }) {
  return (
    <div className="auth-pagina">
      <aside className="auth-painel" aria-hidden="false">
        <div className="auth-marca">{CLINICA.nome}</div>
        <h2 className="auth-chamada">Sua saúde no horário certo.</h2>
        <p className="auth-texto">
          Escolha o serviço, veja os horários livres no calendário e acompanhe suas consultas em um só lugar.
        </p>

        <svg className="auth-ilustracao" viewBox="0 0 320 180" role="img" aria-label="Ilustração de um calendário com batimento cardíaco">
          <rect x="30" y="20" width="260" height="140" rx="16" fill="rgba(255,255,255,0.12)" />
          <rect x="30" y="20" width="260" height="34" rx="16" fill="rgba(255,255,255,0.22)" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <circle key={i} cx={58 + i * 35} cy={78} r="6" fill={i === 3 ? '#FFFFFF' : 'rgba(255,255,255,0.35)'} />
          ))}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <circle key={`l${i}`} cx={58 + i * 35} cy={116} r="6" fill="rgba(255,255,255,0.35)" />
          ))}
          <polyline
            points="46,150 92,150 106,130 122,166 140,122 156,150 274,150"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <ul className="auth-beneficios">
          <li>Agendamento online em poucos cliques</li>
          <li>Veja os horários livres antes de escolher</li>
          <li>Cancele suas consultas quando precisar</li>
        </ul>

        <div className="auth-suporte">
          <strong>Dúvidas? Fale com o suporte</strong>
          <span>{CLINICA.suporte.telefone}</span>
          <span>{CLINICA.suporte.email}</span>
          <span>{CLINICA.suporte.horario}</span>
        </div>
      </aside>

      <section className="auth-form-lado">
        <div className="auth-caixa">
          <h1>{titulo}</h1>
          <p className="auth-subtitulo">{subtitulo}</p>
          {children}
          <div className="auth-rodape">{rodape}</div>
        </div>
      </section>
    </div>
  );
}
