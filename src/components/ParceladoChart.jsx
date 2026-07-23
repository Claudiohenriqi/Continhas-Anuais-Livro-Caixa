const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

const NAO_CARTAO = ["débito", "debito", "pix", "transferência", "transferencia", "dinheiro", "boleto"]

function ehCartaoDeVerdade(nome) {
  const n = (nome || "").trim().toLowerCase()
  if (!n) return false
  return !NAO_CARTAO.some((x) => n.includes(x))
}

function ehFixo(categoria) {
  return (categoria || "").trim().toLowerCase() === "fixo"
}

function ehParcelada(parcela) {
  return /^\d+\s*\/\s*\d+$/.test((parcela || "").trim())
}

export default function ParceladoChart({ contas: contasComRecebimentos }) {
  const contas = contasComRecebimentos.filter((c) => c.categoria !== "Recebimento")
  const doCartao = contas.filter((c) => ehCartaoDeVerdade(c.cartao) && !ehFixo(c.categoria))
  const total = doCartao.reduce((s, c) => s + (Number(c.valor) || 0), 0)

  if (total === 0) return null

  const parcelado = doCartao
    .filter((c) => ehParcelada(c.parcela))
    .reduce((s, c) => s + (Number(c.valor) || 0), 0)
  const doMes = total - parcelado

  const pctParcelado = Math.round((parcelado / total) * 100)
  const pctDoMes = 100 - pctParcelado

  return (
    <div className="mt-2.5 bg-surface rounded-2xl px-6 py-6">
      <h2 className="font-display font-semibold text-[16px] mb-4">Parcelado x à vista (cartões)</h2>

      <div className="h-3 rounded-full overflow-hidden flex mb-4">
        <div className="bg-gold h-full" style={{ width: `${pctParcelado}%` }} />
        <div className="bg-jade h-full" style={{ width: `${pctDoMes}%` }} />
      </div>

      <div className="flex justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-gold" />
            <span className="text-[12px] text-inkdim">Parcelado</span>
          </div>
          <div className="text-[16px] font-bold text-ink">{fmt(parcelado)}</div>
          <div className="text-[11px] text-inkdim">{pctParcelado}% do total em cartões</div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 mb-1 justify-end">
            <span className="text-[12px] text-inkdim">À vista / do mês</span>
            <span className="w-2 h-2 rounded-full bg-jade" />
          </div>
          <div className="text-[16px] font-bold text-ink">{fmt(doMes)}</div>
          <div className="text-[11px] text-inkdim">{pctDoMes}% do total em cartões</div>
        </div>
      </div>
    </div>
  )
}
