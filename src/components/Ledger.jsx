const RESP_OPTIONS = [
  { key: "eu", label: "Eu" },
  { key: "dividido", label: "1/2" },
  { key: "francesco", label: "Francesco" },
]

export default function Ledger({ contas, onEdit, onToggleStatus, onChangeResp, onRemove, onAdd }) {
  return (
    <div className="bg-surface rounded-b-2xl px-7 pt-2 pb-5">
      {contas.map((c) => (
        <div key={c.id} className="py-2.5 border-b border-hair last:border-none">
          <div
            className="grid items-center gap-x-2.5"
            style={{ gridTemplateColumns: "1fr 88px 96px auto auto 22px" }}
          >
            <input
              className="bg-transparent border-0 border-b border-transparent hover:border-hair focus:border-gold focus:outline-none text-[14px] text-ink py-1 min-w-0"
              value={c.desc}
              placeholder="Descrição"
              onChange={(e) => onEdit(c.id, "desc", e.target.value)}
            />
            <input
              className="bg-transparent border-0 border-b border-transparent hover:border-hair focus:border-gold focus:outline-none text-[11px] text-inkdim py-1 min-w-0"
              value={c.categoria}
              placeholder="Categoria"
              onChange={(e) => onEdit(c.id, "categoria", e.target.value)}
            />
            <input
              className="bg-transparent border-0 border-b border-transparent hover:border-hair focus:border-gold focus:outline-none font-mono text-[14px] text-ink text-right py-1 min-w-0"
              type="number"
              step="0.01"
              value={c.valor}
              onChange={(e) => onEdit(c.id, "valor", Number(e.target.value))}
            />

            <button
              onClick={() => onToggleStatus(c.id)}
              className={`text-[10px] font-mono py-0.5 rounded uppercase tracking-wide w-[74px] text-center ${
                c.status === "pago" ? "bg-jade/15 text-jade" : "bg-burnt/15 text-burnt"
              }`}
            >
              {c.status}
            </button>

            <div className="flex gap-0.5 bg-surface2 rounded-md p-0.5 justify-self-end w-[150px]">
              {RESP_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => onChangeResp(c.id, opt.key)}
                  className={`flex-1 text-[10px] font-mono px-1 py-1 rounded text-center ${
                    c.responsavel === opt.key ? "bg-gold text-[#2A2110]" : "text-inkdim"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => onRemove(c.id)}
              aria-label="Remover conta"
              title="Remover"
              className="text-inkdim hover:text-brick justify-self-center text-[16px] leading-none"
            >
              &times;
            </button>
          </div>

          <div className="flex items-center gap-4 mt-1 pl-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-inkdim">De</span>
              <input
                className="bg-transparent border-0 border-b border-transparent hover:border-hair focus:border-gold focus:outline-none text-[11px] text-inkdim w-[92px]"
                value={c.cartao || ""}
                placeholder="Cartão Inter"
                onChange={(e) => onEdit(c.id, "cartao", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-inkdim">Data</span>
              <input
                className="bg-transparent border-0 border-b border-transparent hover:border-hair focus:border-gold focus:outline-none font-mono text-[11px] text-inkdim w-[76px]"
                value={c.data || ""}
                placeholder="dd/mm/aaaa"
                onChange={(e) => onEdit(c.id, "data", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-inkdim">Parcela</span>
              <input
                className="bg-transparent border-0 border-b border-transparent hover:border-hair focus:border-gold focus:outline-none font-mono text-[11px] text-inkdim w-[48px]"
                value={c.parcela || ""}
                placeholder="-"
                onChange={(e) => onEdit(c.id, "parcela", e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={onAdd}
        className="w-full mt-2 py-2.5 rounded-lg border border-dashed border-hair text-inkdim text-[13px] hover:text-gold hover:border-gold"
      >
        + Adicionar conta
      </button>
    </div>
  )
}
