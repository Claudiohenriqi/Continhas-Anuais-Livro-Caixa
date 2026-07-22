const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export default function HeroSummary({ pago, pendente, repassar }) {
  return (
    <div className="mb-3">
      <div
        className="rounded-3xl px-6 pt-7 pb-6 mb-3"
        style={{
          background:
            "radial-gradient(120% 140% at 15% 0%, rgba(215,255,78,0.16) 0%, rgba(10,10,10,0) 55%), #121212",
        }}
      >
        <div className="text-[12px] text-inkdim font-medium mb-1.5">Total do mês</div>
        <div className="font-display font-black text-[42px] text-ink leading-none tracking-tight">
          {fmt(pago + pendente)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-surface rounded-2xl px-3.5 py-3.5">
          <div className="w-2 h-2 rounded-full bg-jade mb-2" />
          <div className="text-[11px] text-inkdim mb-0.5">Pago</div>
          <div className="text-[15px] font-bold text-ink truncate">{fmt(pago)}</div>
        </div>
        <div className="bg-surface rounded-2xl px-3.5 py-3.5">
          <div className="w-2 h-2 rounded-full bg-burnt mb-2" />
          <div className="text-[11px] text-inkdim mb-0.5">Pendente</div>
          <div className="text-[15px] font-bold text-ink truncate">{fmt(pendente)}</div>
        </div>
        <div className="bg-surface rounded-2xl px-3.5 py-3.5">
          <div className="w-2 h-2 rounded-full bg-gold mb-2" />
          <div className="text-[11px] text-inkdim mb-0.5">A repassar</div>
          <div className="text-[15px] font-bold text-gold truncate">{fmt(repassar)}</div>
        </div>
      </div>
    </div>
  )
}
