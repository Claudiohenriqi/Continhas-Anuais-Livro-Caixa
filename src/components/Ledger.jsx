import { useState } from "react"

const RESP_OPTIONS = [
  { key: "eu", label: "Eu" },
  { key: "dividido", label: "1/2" },
  { key: "francesco", label: "Francesco" },
]

const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

function CampoInput({ className, ...props }) {
  return (
    <input
      className={`bg-transparent border-0 border-b border-transparent hover:border-hair focus:border-gold focus:outline-none focus:outline-none py-1 min-w-0 ${className}`}
      {...props}
    />
  )
}

function Seg({ valor, onChange }) {
  return (
    <div className="flex gap-0.5 bg-surface2 rounded-md p-0.5 justify-self-end w-[150px]">
      {RESP_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`flex-1 text-[10px] font-mono px-1 py-1 rounded text-center ${
            valor === opt.key ? "bg-gold text-[#2A2110]" : "text-inkdim"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function StatusBtn({ status, onClick, width = "w-[74px]" }) {
  return (
    <button
      onClick={onClick}
      className={`text-[10px] font-mono py-0.5 rounded uppercase tracking-wide text-center ${width} ${
        status === "pago" ? "bg-jade/15 text-jade" : "bg-burnt/15 text-burnt"
      }`}
    >
      {status}
    </button>
  )
}

export default function Ledger({ contas, onEdit, onToggleStatus, onChangeResp, onRemove, onAdd }) {
  const [selecionando, setSelecionando] = useState(false)
  const [selecionados, setSelecionados] = useState(new Set())
  const [nomeGrupo, setNomeGrupo] = useState("")
  const [expandidos, setExpandidos] = useState(new Set())

  const toggleSelecionado = (id) => {
    setSelecionados((prev) => {
      const novo = new Set(prev)
      novo.has(id) ? novo.delete(id) : novo.add(id)
      return novo
    })
  }

  const cancelarSelecao = () => {
    setSelecionando(false)
    setSelecionados(new Set())
    setNomeGrupo("")
  }

  const confirmarAgrupar = () => {
    const nome = nomeGrupo.trim()
    if (!nome || selecionados.size < 2) return
    selecionados.forEach((id) => onEdit(id, "grupo", nome))
    setExpandidos((prev) => new Set(prev).add(nome))
    cancelarSelecao()
  }

  const toggleExpandido = (nome) => {
    setExpandidos((prev) => {
      const novo = new Set(prev)
      novo.has(nome) ? novo.delete(nome) : novo.add(nome)
      return novo
    })
  }

  const desagrupar = (membros) => {
    membros.forEach((c) => onEdit(c.id, "grupo", ""))
  }

  // Monta a lista de linhas: grupos consolidados + itens soltos, na ordem de aparição
  const jaRenderizado = new Set()
  const linhas = []
  contas.forEach((c) => {
    if (c.grupo) {
      if (jaRenderizado.has(c.grupo)) return
      jaRenderizado.add(c.grupo)
      const membros = contas.filter((x) => x.grupo === c.grupo)
      linhas.push({ tipo: "grupo", nome: c.grupo, membros })
    } else {
      linhas.push({ tipo: "item", conta: c })
    }
  })

  return (
    <div className="bg-surface rounded-b-2xl px-7 pt-2 pb-5">
      <div className="flex justify-end mb-2">
        {selecionando ? (
          <button
            onClick={cancelarSelecao}
            className="text-[12px] text-inkdim hover:text-ink"
          >
            Cancelar seleção
          </button>
        ) : (
          <button
            onClick={() => setSelecionando(true)}
            className="text-[12px] text-inkdim hover:text-gold"
          >
            Selecionar pra agrupar
          </button>
        )}
      </div>

      {linhas.map((linha) =>
        linha.tipo === "item" ? (
          <div key={linha.conta.id} className="py-2.5 border-b border-hair last:border-none">
            <div
              className="grid items-center gap-x-2.5"
              style={{
                gridTemplateColumns: selecionando
                  ? "18px 1fr 88px 96px auto auto 22px"
                  : "1fr 88px 96px auto auto 22px",
              }}
            >
              {selecionando && (
                <input
                  type="checkbox"
                  checked={selecionados.has(linha.conta.id)}
                  onChange={() => toggleSelecionado(linha.conta.id)}
                />
              )}
              <CampoInput
                className="text-[14px] text-ink"
                value={linha.conta.desc}
                placeholder="Descrição"
                onChange={(e) => onEdit(linha.conta.id, "desc", e.target.value)}
              />
              <CampoInput
                className="text-[11px] text-inkdim"
                value={linha.conta.categoria}
                placeholder="Categoria"
                onChange={(e) => onEdit(linha.conta.id, "categoria", e.target.value)}
              />
              <CampoInput
                className="font-mono text-[14px] text-ink text-right"
                type="number"
                step="0.01"
                value={linha.conta.valor}
                onChange={(e) => onEdit(linha.conta.id, "valor", Number(e.target.value))}
              />
              <StatusBtn
                status={linha.conta.status}
                onClick={() => onToggleStatus(linha.conta.id)}
              />
              <Seg
                valor={linha.conta.responsavel}
                onChange={(r) => onChangeResp(linha.conta.id, r)}
              />
              <button
                onClick={() => onRemove(linha.conta.id)}
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
                <CampoInput
                  className="text-[11px] text-inkdim w-[92px]"
                  value={linha.conta.cartao || ""}
                  placeholder="Cartão"
                  onChange={(e) => onEdit(linha.conta.id, "cartao", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-inkdim">Data</span>
                <CampoInput
                  className="font-mono text-[11px] text-inkdim w-[76px]"
                  value={linha.conta.data || ""}
                  placeholder="dd/mm/aaaa"
                  onChange={(e) => onEdit(linha.conta.id, "data", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-inkdim">Parcela</span>
                <CampoInput
                  className="font-mono text-[11px] text-inkdim w-[48px]"
                  value={linha.conta.parcela || ""}
                  placeholder="-"
                  onChange={(e) => onEdit(linha.conta.id, "parcela", e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : (
          <GrupoRow
            key={`g-${linha.nome}`}
            nome={linha.nome}
            membros={linha.membros}
            expandido={expandidos.has(linha.nome)}
            onToggleExpandir={() => toggleExpandido(linha.nome)}
            onRenomear={(novoNome) =>
              linha.membros.forEach((m) => onEdit(m.id, "grupo", novoNome))
            }
            onDesagrupar={() => desagrupar(linha.membros)}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onChangeResp={onChangeResp}
            onRemove={onRemove}
          />
        )
      )}

      <button
        onClick={onAdd}
        className="w-full mt-2 py-2.5 rounded-lg border border-dashed border-hair text-inkdim text-[13px] hover:text-gold hover:border-gold"
      >
        + Adicionar conta
      </button>

      {selecionando && selecionados.size > 0 && (
        <div className="sticky bottom-3 mt-3 flex items-center gap-2 bg-surface2 border border-gold/40 rounded-lg px-3 py-2.5">
          <span className="text-[12px] text-inkdim whitespace-nowrap">
            {selecionados.size} selecionada{selecionados.size > 1 ? "s" : ""}
          </span>
          <CampoInput
            className="text-[13px] text-ink flex-1 border-hair"
            placeholder="Nome do grupo (ex: C6, Gasolina)"
            value={nomeGrupo}
            onChange={(e) => setNomeGrupo(e.target.value)}
          />
          <button
            onClick={confirmarAgrupar}
            disabled={!nomeGrupo.trim() || selecionados.size < 2}
            className="text-[12px] font-medium px-3 py-1.5 rounded-md bg-gold text-[#2A2110] disabled:opacity-40"
          >
            Agrupar
          </button>
        </div>
      )}
    </div>
  )
}

function GrupoRow({
  nome,
  membros,
  expandido,
  onToggleExpandir,
  onRenomear,
  onDesagrupar,
  onEdit,
  onToggleStatus,
  onChangeResp,
  onRemove,
}) {
  const total = membros.reduce((s, m) => s + (Number(m.valor) || 0), 0)
  const todosPagos = membros.every((m) => m.status === "pago")
  const respostas = new Set(membros.map((m) => m.responsavel))
  const respUnico = respostas.size === 1 ? [...respostas][0] : null

  const bulkStatus = () => {
    const novoStatus = todosPagos ? "pendente" : "pago"
    membros.forEach((m) => {
      if (m.status !== novoStatus) onToggleStatus(m.id)
    })
  }

  const bulkResp = (r) => {
    membros.forEach((m) => onChangeResp(m.id, r))
  }

  return (
    <div className="py-2.5 border-b border-hair last:border-none">
      <div
        className="grid items-center gap-x-2.5"
        style={{ gridTemplateColumns: "1fr 88px 96px auto auto 22px" }}
      >
        <button
          onClick={onToggleExpandir}
          className="flex items-center gap-2 text-left min-w-0"
        >
          <span className="text-inkdim text-[11px]">{expandido ? "▾" : "▸"}</span>
          <span className="text-[14px] text-ink font-medium truncate">{nome}</span>
          <span className="text-[11px] text-inkdim">({membros.length})</span>
        </button>
        <span />
        <span className="font-mono text-[14px] text-ink text-right">{fmt(total)}</span>
        <StatusBtn status={todosPagos ? "pago" : "pendente"} onClick={bulkStatus} />
        <Seg valor={respUnico} onChange={bulkResp} />
        <button
          onClick={onDesagrupar}
          title="Desagrupar"
          className="text-inkdim hover:text-brick justify-self-center text-[16px] leading-none"
        >
          &times;
        </button>
      </div>

      {expandido && (
        <div className="mt-2 pl-5 border-l border-hair space-y-2">
          {membros.map((m) => (
            <div key={m.id} className="grid items-center gap-x-2.5" style={{ gridTemplateColumns: "1fr 88px 88px auto 22px" }}>
              <CampoInput
                className="text-[13px] text-ink"
                value={m.desc}
                placeholder="Descrição"
                onChange={(e) => onEdit(m.id, "desc", e.target.value)}
              />
              <CampoInput
                className="text-[11px] text-inkdim"
                value={m.categoria}
                placeholder="Categoria"
                onChange={(e) => onEdit(m.id, "categoria", e.target.value)}
              />
              <CampoInput
                className="font-mono text-[13px] text-ink text-right"
                type="number"
                step="0.01"
                value={m.valor}
                onChange={(e) => onEdit(m.id, "valor", Number(e.target.value))}
              />
              <StatusBtn status={m.status} onClick={() => onToggleStatus(m.id)} width="w-[68px]" />
              <button
                onClick={() => onEdit(m.id, "grupo", "")}
                title="Tirar do grupo"
                className="text-inkdim hover:text-brick justify-self-center text-[14px] leading-none"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
