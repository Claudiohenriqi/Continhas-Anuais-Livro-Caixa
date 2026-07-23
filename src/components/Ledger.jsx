import { useState } from "react"
import Avatar from "./Avatar.jsx"

const RESP_OPTIONS = [
  { key: "eu", label: "Eu" },
  { key: "dividido", label: "1/2" },
  { key: "francesco", label: "Francesco" },
]

const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

function CampoInput({ className, ...props }) {
  return (
    <input
      className={`bg-transparent border-0 border-b border-transparent hover:border-hair focus:border-gold focus:outline-none py-1 min-w-0 ${className}`}
      {...props}
    />
  )
}

function Seg({ valor, onChange, className = "" }) {
  return (
    <div className={`flex gap-0.5 bg-surface2 rounded-md p-0.5 ${className}`}>
      {RESP_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`flex-1 text-[10px] font-mono px-1.5 py-1 rounded text-center whitespace-nowrap ${
            valor === opt.key ? "bg-gold text-[#0A0A0A]" : "text-inkdim"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function StatusBtn({ status, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-[10px] font-mono px-2.5 py-1 rounded uppercase tracking-wide text-center whitespace-nowrap ${
        status === "pago" ? "bg-jade/15 text-jade" : "bg-burnt/15 text-burnt"
      }`}
    >
      {status}
    </button>
  )
}

function PinBtn({ ativo, onClick, title = "Marcar como fixa (repete todo mês)" }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`text-[15px] leading-none px-1 ${
        ativo ? "text-gold" : "text-inkdim/40 hover:text-inkdim"
      }`}
    >
      📌
    </button>
  )
}

function bate(valor, query) {
  return (valor || "").toString().toLowerCase().includes(query)
}

const CATEGORIAS_SUGERIDAS = [
  "Fixo", "Cartão", "Mercado", "Alimentação", "Assinatura", "Farmácia/Saúde",
  "Combustível", "Compras", "Encargos/Juros", "Transferência/Pix", "Educação",
  "Viagem", "Investimentos", "Parcelamento", "Outros",
]

export default function Ledger({ contas: contasComRecebimentos, onEdit, onToggleStatus, onChangeResp, onRemove, onAdd }) {
  const contas = contasComRecebimentos.filter((c) => c.categoria !== "Recebimento")
  const [selecionando, setSelecionando] = useState(false)
  const [selecionados, setSelecionados] = useState(new Set())
  const [nomeGrupo, setNomeGrupo] = useState("")
  const [expandidos, setExpandidos] = useState(new Set())
  const [autoGruposDesfeitos, setAutoGruposDesfeitos] = useState(new Set())
  const [buscando, setBuscando] = useState(false)
  const [busca, setBusca] = useState("")

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

  const desagruparManual = (membros) => {
    membros.forEach((c) => onEdit(c.id, "grupo", ""))
  }

  const desfazerAutoGrupo = (cartao) => {
    setAutoGruposDesfeitos((prev) => new Set(prev).add(cartao))
  }

  const toggleBusca = () => {
    setBuscando((v) => !v)
    if (buscando) setBusca("")
  }

  const contagemCartao = {}
  contas.forEach((c) => {
    if (c.grupo) return
    const chave = (c.cartao || "").trim()
    if (!chave) return
    contagemCartao[chave] = (contagemCartao[chave] || 0) + 1
  })

  const jaRenderizado = new Set()
  const linhas = []
  contas.forEach((c) => {
    if (c.grupo) {
      const chaveM = `m:${c.grupo}`
      if (jaRenderizado.has(chaveM)) return
      jaRenderizado.add(chaveM)
      const membros = contas.filter((x) => x.grupo === c.grupo)
      linhas.push({ tipo: "grupo", nome: c.grupo, membros, origem: "manual" })
      return
    }
    const chaveCartao = (c.cartao || "").trim()
    const elegivelAuto =
      chaveCartao && contagemCartao[chaveCartao] > 1 && !autoGruposDesfeitos.has(chaveCartao)
    if (elegivelAuto) {
      const chaveA = `a:${chaveCartao}`
      if (jaRenderizado.has(chaveA)) return
      jaRenderizado.add(chaveA)
      const membros = contas.filter((x) => !x.grupo && (x.cartao || "").trim() === chaveCartao)
      linhas.push({ tipo: "grupo", nome: chaveCartao, membros, origem: "auto" })
      return
    }
    linhas.push({ tipo: "item", conta: c })
  })

  const query = busca.trim().toLowerCase()
  const linhasFiltradas =
    query === ""
      ? linhas
      : linhas.filter((l) => {
          if (l.tipo === "item") {
            const c = l.conta
            return [c.desc, c.data, c.cartao, c.categoria].some((v) => bate(v, query))
          }
          const nomeBate = bate(l.nome, query)
          const membroBate = l.membros.some((m) =>
            [m.desc, m.data, m.cartao, m.categoria].some((v) => bate(v, query))
          )
          return nomeBate || membroBate
        })

  return (
    <div className="relative">
      <datalist id="categorias-sugeridas">
        {CATEGORIAS_SUGERIDAS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {buscando && (
        <div className="mb-3 bg-surface rounded-2xl px-4 py-1">
          <CampoInput
            autoFocus
            className="w-full text-[14px] text-ink px-1"
            placeholder="Buscar por descrição, data ou cartão…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      )}

      {selecionando && (
        <div className="flex justify-end mb-2">
          <button onClick={cancelarSelecao} className="text-[12px] text-inkdim hover:text-ink">
            Cancelar seleção
          </button>
        </div>
      )}

      {query !== "" && linhasFiltradas.length === 0 && (
        <p className="text-[13px] text-inkdim py-4">Nada encontrado pra "{busca}".</p>
      )}

      <div className="space-y-2.5">
        {linhasFiltradas.map((linha) =>
          linha.tipo === "item" ? (
            <div key={linha.conta.id} className="bg-surface rounded-2xl px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                {selecionando && (
                  <input
                    type="checkbox"
                    className="flex-shrink-0"
                    checked={selecionados.has(linha.conta.id)}
                    onChange={() => toggleSelecionado(linha.conta.id)}
                  />
                )}
                <Avatar nome={linha.conta.cartao || linha.conta.categoria} />
                <CampoInput
                  className="flex-1 text-[14px] text-ink font-medium min-w-0"
                  value={linha.conta.desc}
                  placeholder="Descrição"
                  onChange={(e) => onEdit(linha.conta.id, "desc", e.target.value)}
                />
                <CampoInput
                  className="font-mono text-[14px] text-ink font-semibold text-right w-[86px] flex-shrink-0"
                  type="number"
                  step="0.01"
                  value={linha.conta.valor}
                  onChange={(e) => onEdit(linha.conta.id, "valor", Number(e.target.value))}
                />
              </div>

              <div className="flex items-center gap-2 mt-2.5 flex-wrap pl-[38px]">
                <CampoInput
                  className="text-[11px] text-inkdim w-[100px] flex-shrink-0"
                  value={linha.conta.categoria}
                  placeholder="Categoria"
                  list="categorias-sugeridas"
                  onChange={(e) => onEdit(linha.conta.id, "categoria", e.target.value)}
                />
                <StatusBtn
                  status={linha.conta.status}
                  onClick={() => onToggleStatus(linha.conta.id)}
                />
                <PinBtn
                  ativo={!!linha.conta.fixa}
                  onClick={() => onEdit(linha.conta.id, "fixa", !linha.conta.fixa)}
                />
                <button
                  onClick={() => onRemove(linha.conta.id)}
                  aria-label="Remover conta"
                  title="Remover"
                  className="text-inkdim hover:text-brick text-[16px] leading-none ml-auto"
                >
                  &times;
                </button>
              </div>

              <div className="mt-2 pl-[38px]">
                <Seg
                  valor={linha.conta.responsavel}
                  onChange={(r) => onChangeResp(linha.conta.id, r)}
                  className="w-full max-w-[280px]"
                />
              </div>

              <div className="flex items-center gap-3 mt-2 flex-wrap pl-[38px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-inkdim">De</span>
                  <CampoInput
                    className="text-[11px] text-inkdim w-[88px]"
                    value={linha.conta.cartao || ""}
                    placeholder="Cartão"
                    onChange={(e) => onEdit(linha.conta.id, "cartao", e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-inkdim">Data</span>
                  <CampoInput
                    className="font-mono text-[11px] text-inkdim w-[74px]"
                    value={linha.conta.data || ""}
                    placeholder="dd/mm/aaaa"
                    onChange={(e) => onEdit(linha.conta.id, "data", e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-inkdim">Parcela</span>
                  <CampoInput
                    className="font-mono text-[11px] text-inkdim w-[44px]"
                    value={linha.conta.parcela || ""}
                    placeholder="-"
                    onChange={(e) => onEdit(linha.conta.id, "parcela", e.target.value)}
                  />
                </div>
                {linha.conta.fixa && <span className="text-[10px] text-gold">📌 fixa</span>}
              </div>
            </div>
          ) : (
            <GrupoRow
              key={`${linha.origem}-${linha.nome}`}
              nome={linha.nome}
              membros={linha.membros}
              origem={linha.origem}
              expandido={
                expandidos.has(linha.nome) ||
                (query !== "" && !bate(linha.nome, query))
              }
              onToggleExpandir={() => toggleExpandido(linha.nome)}
              onDesagrupar={() =>
                linha.origem === "manual"
                  ? desagruparManual(linha.membros)
                  : desfazerAutoGrupo(linha.nome)
              }
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onChangeResp={onChangeResp}
            />
          )
        )}
      </div>

      <button
        onClick={onAdd}
        className="w-full mt-2.5 py-3 rounded-2xl border border-dashed border-hair text-inkdim text-[13px] hover:text-gold hover:border-gold"
      >
        + Adicionar conta
      </button>

      {selecionando && selecionados.size > 0 && (
        <div className="sticky bottom-20 mt-3 flex items-center gap-2 bg-surface2 border border-gold/40 rounded-2xl px-3 py-2.5 flex-wrap">
          <span className="text-[12px] text-inkdim whitespace-nowrap">
            {selecionados.size} selecionada{selecionados.size > 1 ? "s" : ""}
          </span>
          <CampoInput
            className="text-[13px] text-ink flex-1 border-hair min-w-[120px]"
            placeholder="Nome do grupo (ex: C6, Gasolina)"
            value={nomeGrupo}
            onChange={(e) => setNomeGrupo(e.target.value)}
          />
          <button
            onClick={confirmarAgrupar}
            disabled={!nomeGrupo.trim() || selecionados.size < 2}
            className="text-[12px] font-medium px-3 py-1.5 rounded-md bg-gold text-[#0A0A0A] disabled:opacity-40"
          >
            Agrupar
          </button>
        </div>
      )}

      <div className="fixed bottom-6 right-6 flex flex-col gap-2.5 z-40">
        <button
          onClick={toggleBusca}
          title="Buscar"
          className={`w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-[16px] ${
            buscando ? "bg-gold text-[#0A0A0A]" : "bg-surface2 text-ink border border-hair"
          }`}
        >
          🔍
        </button>
        <button
          onClick={() => (selecionando ? cancelarSelecao() : setSelecionando(true))}
          title="Selecionar pra agrupar"
          className={`w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-[16px] ${
            selecionando ? "bg-gold text-[#0A0A0A]" : "bg-surface2 text-ink border border-hair"
          }`}
        >
          ⛓
        </button>
      </div>
    </div>
  )
}

function GrupoRow({
  nome,
  membros,
  origem,
  expandido,
  onToggleExpandir,
  onDesagrupar,
  onEdit,
  onToggleStatus,
  onChangeResp,
}) {
  const [dividindoTudo, setDividindoTudo] = useState(false)
  const total = membros.reduce((s, m) => s + (Number(m.valor) || 0), 0)
  const todosPagos = membros.every((m) => m.status === "pago")

  const bulkStatus = () => {
    const novoStatus = todosPagos ? "pendente" : "pago"
    membros.forEach((m) => {
      if (m.status !== novoStatus) onToggleStatus(m.id)
    })
  }

  const bulkResp = (r) => {
    membros.forEach((m) => onChangeResp(m.id, r))
    setDividindoTudo(false)
  }

  return (
    <div className="bg-surface rounded-2xl px-4 py-3.5 overflow-hidden">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onToggleExpandir}
          className="flex items-center gap-2.5 text-left min-w-0 flex-1"
        >
          <Avatar nome={nome} size={30} />
          <span className="text-[14px] text-ink font-semibold truncate">{nome}</span>
          <span className="text-[11px] text-inkdim flex-shrink-0">({membros.length})</span>
          {origem === "auto" && (
            <span className="text-[9px] text-inkdim/60 border border-hair rounded px-1 flex-shrink-0">
              cartão
            </span>
          )}
          <span
            className={`text-inkdim text-[12px] flex-shrink-0 transition-transform duration-300 ${
              expandido ? "rotate-90" : ""
            }`}
          >
            ›
          </span>
        </button>
        <span className="font-mono text-[14px] text-ink font-semibold">{fmt(total)}</span>
        <button
          onClick={onDesagrupar}
          title={
            origem === "manual"
              ? "Desagrupar (desfaz o grupo inteiro)"
              : "Desfazer agrupamento automático deste cartão"
          }
          className="text-inkdim hover:text-brick text-[16px] leading-none"
        >
          &times;
        </button>
      </div>

      <div className="flex items-center gap-2 mt-2.5 flex-wrap pl-[38px]">
        <StatusBtn status={todosPagos ? "pago" : "pendente"} onClick={bulkStatus} />
        {dividindoTudo ? (
          <Seg valor={null} onChange={bulkResp} className="flex-1 max-w-[280px]" />
        ) : (
          <button
            onClick={() => setDividindoTudo(true)}
            className="text-[11px] text-inkdim hover:text-gold border border-hair rounded-md px-2.5 py-1"
          >
            Dividir cartão inteiro
          </button>
        )}
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: expandido ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="mt-3 pt-3 pl-[38px] border-t border-hair space-y-3">
            {membros.map((m) => (
              <div key={m.id}>
                <div className="flex items-center gap-2">
                  <CampoInput
                    className="flex-1 text-[13px] text-ink min-w-0"
                    value={m.desc}
                    placeholder="Descrição"
                    onChange={(e) => onEdit(m.id, "desc", e.target.value)}
                  />
                  <CampoInput
                    className="font-mono text-[13px] text-ink text-right w-[76px] flex-shrink-0"
                    type="number"
                    step="0.01"
                    value={m.valor}
                    onChange={(e) => onEdit(m.id, "valor", Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <CampoInput
                    className="text-[11px] text-inkdim w-[100px] flex-shrink-0"
                    value={m.categoria}
                    placeholder="Categoria"
                    list="categorias-sugeridas"
                    onChange={(e) => onEdit(m.id, "categoria", e.target.value)}
                  />
                  <StatusBtn status={m.status} onClick={() => onToggleStatus(m.id)} />
                  {origem === "manual" && (
                    <button
                      onClick={() => onEdit(m.id, "grupo", "")}
                      title="Tirar do grupo (esse item só)"
                      className="text-inkdim hover:text-brick text-[14px] leading-none ml-auto"
                    >
                      &times;
                    </button>
                  )}
                </div>
                <div className="mt-1">
                  <Seg
                    valor={m.responsavel}
                    onChange={(r) => onChangeResp(m.id, r)}
                    className="w-full max-w-[260px]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
