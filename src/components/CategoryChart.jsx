import { useState } from "react"

const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

const CATEGORIAS_SUGERIDAS = [
  "Fixo", "Cartão", "Mercado", "Alimentação", "Assinatura", "Farmácia/Saúde",
  "Combustível", "Compras", "Encargos/Juros", "Transferência/Pix", "Educação",
  "Viagem", "Investimentos", "Parcelamento", "Outros",
]

function CampoInput({ className, ...props }) {
  return (
    <input
      className={`bg-transparent border-0 border-b border-transparent hover:border-hair focus:border-gold focus:outline-none py-1 min-w-0 ${className}`}
      {...props}
    />
  )
}

export default function CategoryChart({ contas, onEdit }) {
  const [expandida, setExpandida] = useState(null) // nome da categoria aberta
  const [idsAbertos, setIdsAbertos] = useState([]) // ids fixos, tirados no momento do clique

  const porCategoria = {}
  contas.forEach((c) => {
    const cat = c.categoria || "Sem categoria"
    if (!porCategoria[cat]) porCategoria[cat] = []
    porCategoria[cat].push(c)
  })

  const entradas = Object.entries(porCategoria)
    .map(([cat, itens]) => [cat, itens, itens.reduce((s, c) => s + (Number(c.valor) || 0), 0)])
    .sort((a, b) => b[2] - a[2])

  if (entradas.length === 0) return null
  const max = entradas[0][2] || 1

  const abrir = (cat, itens) => {
    if (expandida === cat) {
      setExpandida(null)
      setIdsAbertos([])
    } else {
      setExpandida(cat)
      setIdsAbertos(itens.map((i) => i.id)) // trava a lista aqui — não recalcula ao digitar
    }
  }

  // busca os itens travados pelos ids, mas com os valores atuais (pra edição refletir)
  const contasPorId = Object.fromEntries(contas.map((c) => [c.id, c]))
  const itensAbertos = idsAbertos.map((id) => contasPorId[id]).filter(Boolean)

  return (
    <div className="mt-7 bg-surface border border-hair rounded-2xl px-6 py-6">
      <datalist id="categorias-sugeridas-chart">
        {CATEGORIAS_SUGERIDAS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <h2 className="font-display font-medium text-[17px] mb-4">Gastos por categoria</h2>
      <div className="space-y-1">
        {entradas.map(([cat, itens, valor]) => {
          const aberta = expandida === cat
          return (
            <div key={cat}>
              <button onClick={() => abrir(cat, itens)} className="w-full text-left">
                <div className="flex justify-between text-[12px] mb-1 items-center gap-2">
                  <span className="text-ink flex items-center gap-1.5">
                    <span className="text-inkdim text-[10px]">{aberta ? "▾" : "▸"}</span>
                    {cat}
                    <span className="text-inkdim">({itens.length})</span>
                  </span>
                  <span className="font-mono text-inkdim">{fmt(valor)}</span>
                </div>
                <div className="h-2 bg-surface2 rounded-full overflow-hidden mb-2.5">
                  <div
                    className="h-full bg-gold rounded-full"
                    style={{ width: `${Math.max((valor / max) * 100, 2)}%` }}
                  />
                </div>
              </button>

              {aberta && (
                <div className="mb-3 pl-3 border-l border-hair space-y-2">
                  {itensAbertos.map((item) => (
                    <div
                      key={item.id}
                      className="grid items-center gap-x-2.5"
                      style={{ gridTemplateColumns: "1fr 110px 88px" }}
                    >
                      <CampoInput
                        className="text-[13px] text-ink"
                        value={item.desc}
                        placeholder="Descrição"
                        onChange={(e) => onEdit(item.id, "desc", e.target.value)}
                      />
                      <CampoInput
                        className="text-[12px] text-inkdim"
                        value={item.categoria}
                        placeholder="Categoria"
                        list="categorias-sugeridas-chart"
                        onChange={(e) => onEdit(item.id, "categoria", e.target.value)}
                      />
                      <CampoInput
                        className="font-mono text-[13px] text-ink text-right"
                        type="number"
                        step="0.01"
                        value={item.valor}
                        onChange={(e) => onEdit(item.id, "valor", Number(e.target.value))}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
