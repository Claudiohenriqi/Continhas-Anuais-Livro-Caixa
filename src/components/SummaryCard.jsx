const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export default function SummaryCard({ total, repassar, mes }) {
  const copiar = () => {
    const texto = `Contas de ${mes} — Total a repassar: ${fmt(repassar)}`
    navigator.clipboard.writeText(texto)
    alert("Resumo copiado!")
  }

  const whatsapp = () => {
    const texto = encodeURIComponent(`Contas de ${mes} — Total a repassar: ${fmt(repassar)}`)
    window.open(`https://wa.me/?text=${texto}`, "_blank")
  }

  return (
    <div className="mt-7 bg-surface border border-dashed border-hair rounded-2xl px-6 py-6">
      <h2 className="font-display font-medium text-[17px] mb-3">Resumo pro Francesco</h2>

      <div className="flex justify-between text-[13px] text-inkdim py-1.5">
        <span>Total das faturas</span>
        <strong className="font-mono text-ink font-medium">{fmt(total)}</strong>
      </div>

      <div className="flex justify-between items-baseline mt-2.5 pt-3.5 border-t border-hair">
        <span className="text-[14px] text-ink">Valor a repassar</span>
        <strong className="font-mono text-[26px] text-jade font-semibold">{fmt(repassar)}</strong>
      </div>

      <div className="flex gap-2.5 mt-4">
        <button
          onClick={copiar}
          className="text-[13px] font-medium px-4 py-2.5 rounded-lg bg-gold text-[#2A2110]"
        >
          Copiar resumo
        </button>
        <button
          onClick={whatsapp}
          className="text-[13px] font-medium px-4 py-2.5 rounded-lg border border-hair text-ink"
        >
          Enviar no WhatsApp
        </button>
      </div>
    </div>
  )
}
