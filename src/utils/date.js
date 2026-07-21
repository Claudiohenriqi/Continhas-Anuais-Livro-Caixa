const MESES_ABREV = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]

const MESES_COMPLETOS = [
  "janeiro", "fevereiro", "marco", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]

const MESES_COMPLETOS_CAP = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
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

// "2026-07" -> {mes:7, ano:2026}
export function chaveParaMesAno(chave) {
  const [ano, mes] = String(chave).split("-").map(Number)
  return { mes, ano }
}

// {mes:7, ano:2026} -> "Contas Julho 2026", o nome exato da aba
export function tituloAba({ mes, ano }) {
  return `Contas ${MESES_COMPLETOS_CAP[mes - 1]} ${ano}`
}

// {mes:7, ano:2026} -> {mes:8, ano:2026} (ou vira o ano em dezembro)
export function proximoMes({ mes, ano }) {
  return mes === 12 ? { mes: 1, ano: ano + 1 } : { mes: mes + 1, ano }
}

// "16/07/2026" -> "16/08/2026" (mesmo dia, mês seguinte)
export function avancarData(dataStr) {
  const m = String(dataStr || "").trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return dataStr || ""
  const dia = Number(m[1])
  let mes = Number(m[2]) + 1
  let ano = Number(m[3])
  if (mes > 12) { mes = 1; ano += 1 }
  return `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}/${ano}`
}

// "3/12" -> {texto:"4/12", esgotada:false}. Sem formato "n/n" (ex: "-",
// aluguel) -> mantém como está, indefinidamente.
export function avancarParcela(parcelaStr) {
  const m = String(parcelaStr || "").trim().match(/^(\d+)\s*\/\s*(\d+)$/)
  if (!m) return { texto: parcelaStr || "-", esgotada: false }
  const atual = Number(m[1]) + 1
  const total = Number(m[2])
  if (atual > total) return { texto: parcelaStr, esgotada: true }
  return { texto: `${atual}/${total}`, esgotada: false }
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
