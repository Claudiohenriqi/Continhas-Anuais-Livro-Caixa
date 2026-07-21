import { paraDate } from "../utils/date.js"

const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export default function ProximosVencimentos({ contas }) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const em7dias = new Date(hoje)
  em7dias.setDate(em7dias.getDate() + 7)

  const proximas = contas
    .filter((c) => c.status !== "pago")
    .map((c) => ({ ...c, dataVenc: paraDate(c.vencimento) }))
    .filter((c) => c.dataVenc && c.dataVenc >= hoje && c.dataVenc <= em7dias)
    .sort((a, b) => a.dataVenc - b.dataVenc)

  if (proximas.length === 0) return null

  return (
    <div className="mb-4 bg-burnt/10 border border-burnt/30 rounded-lg px-4 py-3">
      <div className="text-[11px] text-burnt uppercase tracking-wide mb-1.5">
        Vence nos próximos 7 dias
      </div>
      <div className="space-y-1">
        {proximas.map((c) => (
          <div key={c.id} className="flex justify-between text-[13px]">
            <span className="text-ink">{c.desc || "(sem nome)"}</span>
            <span className="font-mono text-inkdim">
              {c.vencimento} · {fmt(c.valor)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
