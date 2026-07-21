// Busca os dados da planilha real via Google Sheets API v4.
// Precisa de VITE_SHEETS_API_KEY e VITE_SHEET_ID no arquivo .env
// (veja o README.md pra criar essas duas coisas).

const SHEET_NAME = "Contas Julho 2026"
const RANGE = `${SHEET_NAME}!A2:J1000`

function parseValor(v) {
  if (!v) return 0
  const limpo = String(v).replace(/[^\d,.-]/g, "").replace(",", ".")
  const n = Number(limpo)
  return isNaN(n) ? 0 : n
}

function normalizeStatus(s) {
  return (s || "").toLowerCase() === "pago" ? "pago" : "pendente"
}

function normalizeResp(s) {
  const v = (s || "").toLowerCase()
  if (v === "francesco") return "francesco"
  if (v === "dividido") return "dividido"
  return "eu"
}

export async function fetchContas() {
  const apiKey = import.meta.env.VITE_SHEETS_API_KEY
  const sheetId = import.meta.env.VITE_SHEET_ID

  if (!apiKey || !sheetId) {
    throw new Error(
      "Faltam VITE_SHEETS_API_KEY e/ou VITE_SHEET_ID no arquivo .env"
    )
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
    RANGE
  )}?key=${apiKey}`

  const res = await fetch(url)

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(
      body?.error?.message || `Erro ${res.status} ao buscar a planilha`
    )
  }

  const data = await res.json()
  const rows = data.values || []

  return rows
    .filter((row) => row[2]) // ignora linhas sem descrição
    .map((row, i) => ({
      id: `sheet-${i}`,
      cartao: row[0] || "",
      desc: row[2] || "",
      categoria: row[3] || "",
      valor: parseValor(row[4]),
      vencimento: row[6] || "",
      status: normalizeStatus(row[7]),
      responsavel: normalizeResp(row[8]),
    }))
}
