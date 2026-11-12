// Ponto único de comunicação com o backend.
// Todas as páginas usam esta função, então o tratamento de erro fica em um lugar só.
export async function api(caminho, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${caminho}`, {
    method,
    credentials: 'include', // envia o cookie de sessão
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  const dados = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    const erro = new Error(dados?.erro || 'Erro ao comunicar com o servidor');
    erro.status = res.status;
    erro.detalhes = dados?.detalhes;
    throw erro;
  }

  return dados;
}

// Junta a mensagem principal e os detalhes da validação (ex.: "Senha é obrigatória")
export function mensagemDeErro(err) {
  return err.detalhes?.length ? err.detalhes.join('. ') : err.message;
}
