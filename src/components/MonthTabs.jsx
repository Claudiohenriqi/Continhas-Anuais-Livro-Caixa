export default function MonthTabs({ meses, mesAtual, onChange }) {
  if (meses.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
      {meses.map((m) => (
        <button
          key={m.chave}
          onClick={() => onChange(m.chave)}
          className={`flex-none px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors ${
            m.chave === mesAtual
              ? "bg-gold text-[#0A0A0A]"
              : "bg-surface text-inkdim hover:text-ink"
          }`}
        >
          {m.rotulo}
        </button>
      ))}
    </div>
  )
}
