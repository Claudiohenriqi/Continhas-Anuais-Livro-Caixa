export default function MonthTabs({ meses, mesAtual, onChange }) {
  if (meses.length === 0) return null

  return (
    <div className="flex gap-1 overflow-x-auto pb-1 mb-6 border-b border-hair">
      {meses.map((m) => (
        <button
          key={m.chave}
          onClick={() => onChange(m.chave)}
          className={`flex-none px-4 py-2 text-[13px] font-mono whitespace-nowrap border-b-2 ${
            m.chave === mesAtual
              ? "text-gold border-gold"
              : "text-inkdim border-transparent hover:text-ink"
          }`}
        >
          {m.rotulo}
        </button>
      ))}
    </div>
  )
}
