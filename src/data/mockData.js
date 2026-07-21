// Dados de exemplo. Depois trocamos por uma leitura real da planilha
// do Google Sheets (Google Sheets API v4, com a planilha pública
// para leitura + uma API key).
export const mesAtual = "Jul 2026"

export const meses = ["Mai 2026", "Jun 2026", "Jul 2026"]

export const contas = [
  { id: 1, desc: "Aluguel", categoria: "Fixo", valor: 1450.0, status: "pendente", responsavel: "dividido" },
  { id: 2, desc: "Fatura cartão Inter", categoria: "Cartão", valor: 1671.56, status: "pendente", responsavel: "eu" },
  { id: 3, desc: "Internet", categoria: "Fixo", valor: 99.9, status: "pago", responsavel: "dividido" },
  { id: 4, desc: "Academia", categoria: "Assinatura", valor: 79.95, status: "pendente", responsavel: "francesco" },
  { id: 5, desc: "Mercado", categoria: "Variável", valor: 412.3, status: "pendente", responsavel: "dividido" },
  { id: 6, desc: "Netflix + Amazon", categoria: "Assinatura", valor: 39.8, status: "pago", responsavel: "eu" },
]
