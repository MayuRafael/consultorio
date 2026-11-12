// Funções de data no fuso local do navegador.
// O servidor guarda tudo em UTC; a tela sempre mostra e compara no horário local.

// Converte uma data para "AAAA-MM-DD" no fuso local
export function chaveDia(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

// Converte uma data para "HH:mm" no fuso local
export function horaMinuto(data) {
  return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
}
