// Busca os dados da planilha real via Google Sheets API v4.
// Cada mês fica em uma aba própria, chamada exatamente
// "Contas <Mês por extenso> <Ano>" (ex: "Contas Julho 2026").
// Precisa de VITE_SHEETS_API_KEY e VITE_SHEET_ID no arquivo .env.

import { mesChave, mesRotulo, parseTituloAba } from "../utils/date.js"

function credenciais() {
  const apiKey = import.meta.env.VITE_SHEETS_API_KEY
  const sheetId = import.meta.env.VITE_SHEET_ID
  if (!apiKey || !sheetId) {
    throw new Error(
      "Faltam VITE_SHEETS_API_KEY e/ou VITE_SHEET_ID no arquivo .env"
    )
  }
  return { apiKey, sheetId }
}

function parseValor(v) {
  if (v === null || v === undefined || v === "") return 0
  if (typeof v === "number") return v
  let s = String(v).trim().replace(/[^\d,.\-]/g, "")
  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".")
  }
  const n = Number(s)
  return isNaN(n) ? 0 : n
}

function serialParaData(serial) {
  const epoch = Date.UTC(1899, 11, 30)
  const ms = epoch + serial * 86400000
  const d = new Date(ms)
  const dd = String(d.getUTCDate()).padStart(2, "0")
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0")
  const yyyy = d.getUTCFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function paraTexto(v) {
  if (v === null || v === undefined) return ""
  if (typeof v === "number") {
    if (v > 20000 && v < 60000) return serialParaData(v)
    return String(v)
  }
  return String(v)
}

function normalizeStatus(s) {
  return paraTexto(s).toLowerCase() === "pago" ? "pago" : "pendente"
}

function normalizeResp(s) {
  const v = paraTexto(s).toLowerCase()
  if (v === "francesco") return "francesco"
  if (v === "dividido") return "dividido"
  return "eu"
}

// Lista as abas da planilha que seguem o padrão "Contas <Mês> <Ano>",
// já ordenadas da mais antiga pra mais recente.
export async function listarMesesDisponiveis() {
  const { apiKey, sheetId } = credenciais()
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}&fields=sheets.properties.title`
  const res = await fetch(url)

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message || `Erro ${res.status} ao listar as abas`)
  }

  const data = await res.json()
  const titulos = (data.sheets || []).map((s) => s.properties.title)

  const meses = titulos
    .map((titulo) => {
      const d = parseTituloAba(titulo)
      if (!d) return null
      return { chave: mesChave(d), rotulo: mesRotulo(d), aba: titulo }
    })
    .filter(Boolean)
    .sort((a, b) => (a.chave > b.chave ? 1 : -1))

  if (meses.length === 0) {
    throw new Error(
      'Nenhuma aba encontrada no formato "Contas <Mês> <Ano>" (ex: "Contas Julho 2026")'
    )
  }

  return meses
}

// Envia a lista de contas atualizada de volta pra planilha, através do
// Google Apps Script publicado (veja o README pra configurar).
export async function salvarNaAba(nomeAba, contas) {
  const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL
  if (!scriptUrl) {
    throw new Error("Falta VITE_APPS_SCRIPT_URL no arquivo .env")
  }

  const res = await fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ aba: nomeAba, linhas: contas }),
  })

  if (!res.ok) {
    throw new Error(`Erro ${res.status} ao salvar na planilha`)
  }

  const data = await res.json()
  if (data.erro) {
    throw new Error(data.erro)
  }
  return data
}

export async function fetchContasDaAba(nomeAba) {
  const { apiKey, sheetId } = credenciais()
  const range = `${nomeAba}!A2:K1000`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
    range
  )}?key=${apiKey}&valueRenderOption=UNFORMATTED_VALUE`

  const res = await fetch(url)

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message || `Erro ${res.status} ao buscar a planilha`)
  }

  const data = await res.json()
  const rows = data.values || []

  return rows
    .filter((row) => row[2]) // ignora linhas sem descrição
    .filter((row) => paraTexto(row[3]).toLowerCase() !== "pagamento/estorno") // não entram no total
    .map((row, i) => ({
      id: `${nomeAba}-${i}`,
      cartao: paraTexto(row[0]),
      data: paraTexto(row[1]),
      desc: paraTexto(row[2]),
      categoria: paraTexto(row[3]),
      valor: parseValor(row[4]),
      parcela: paraTexto(row[5]),
      vencimento: paraTexto(row[6]),
      status: normalizeStatus(row[7]),
      responsavel: normalizeResp(row[8]),
      grupo: paraTexto(row[10]),
    }))
}
