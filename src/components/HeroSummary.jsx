const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export default function HeroSummary({ pago, pendente, repassar }) {
  return (
    <>
      <div className="bg-surface rounded-t-2xl px-7 pt-7 pb-5">
        <div className="text-[12px] text-inkdim uppercase tracking-widest mb-1">
          Total do mês
        </div>
        <div className="font-mono font-semibold text-[40px] text-gold leading-none">
          {fmt(pago + pendente)}
        </div>
        <div className="flex gap-6 mt-4 flex-wrap">
          <div className="text-[13px] text-inkdim">
            Pago
            <strong className="block font-mono text-ink text-[16px] font-medium mt-0.5">
              {fmt(pago)}
            </strong>
          </div>
          <div className="text-[13px] text-inkdim">
            Pendente
            <strong className="block font-mono text-ink text-[16px] font-medium mt-0.5">
              {fmt(pendente)}
            </strong>
          </div>
          <div className="text-[13px] text-inkdim">
            A repassar
            <strong className="block font-mono text-jade text-[16px] font-medium mt-0.5">
              {fmt(repassar)}
            </strong>
          </div>
        </div>
      </div>
      <div className="tear" />
    </>
  )
}
