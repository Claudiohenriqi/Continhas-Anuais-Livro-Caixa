const MESES_ABREV = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]

const MESES_COMPLETOS = [
  "janeiro", "fevereiro", "marco", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]

function semAcento(s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

// "07/2026" -> chave usada pra ordenar os meses
export function mesChave({ mes, ano }) {
  return `${ano}-${String(mes).padStart(2, "0")}`
}

// {mes:7, ano:2026} -> "Jul 2026", pra mostrar na aba do site
export function mesRotulo({ mes, ano }) {
  return `${MESES_ABREV[mes - 1]} ${ano}`
}

// "Contas Julho 2026" -> {mes: 7, ano: 2026}. Retorna null se o nome da
// aba não seguir o padrão "Contas <Mês por extenso> <Ano>".
export function parseTituloAba(titulo) {
  const m = String(titulo).trim().match(/^Contas\s+(\p{L}+)\s+(\d{4})$/u)
  if (!m) return null
  const nomeMes = semAcento(m[1])
  const idx = MESES_COMPLETOS.findIndex((mm) => mm === nomeMes)
  if (idx === -1) return null
  return { mes: idx + 1, ano: Number(m[2]) }
}
