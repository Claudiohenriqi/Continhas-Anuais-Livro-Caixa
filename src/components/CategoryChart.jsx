const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export default function CategoryChart({ contas }) {
  const porCategoria = {}
  contas.forEach((c) => {
    const cat = c.categoria || "Sem categoria"
    porCategoria[cat] = (porCategoria[cat] || 0) + (Number(c.valor) || 0)
  })

  const entradas = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])
  if (entradas.length === 0) return null
  const max = entradas[0][1] || 1

  return (
    <div className="mt-7 bg-surface border border-hair rounded-2xl px-6 py-6">
      <h2 className="font-display font-medium text-[17px] mb-4">Gastos por categoria</h2>
      <div className="space-y-2.5">
        {entradas.map(([cat, valor]) => (
          <div key={cat}>
            <div className="flex justify-between text-[12px] mb-1">
              <span className="text-ink">{cat}</span>
              <span className="font-mono text-inkdim">{fmt(valor)}</span>
            </div>
            <div className="h-2 bg-surface2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full"
                style={{ width: `${Math.max((valor / max) * 100, 2)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
