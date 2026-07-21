import { useState, useMemo, useEffect } from "react"
import MonthTabs from "./components/MonthTabs.jsx"
import HeroSummary from "./components/HeroSummary.jsx"
import Ledger from "./components/Ledger.jsx"
import SummaryCard from "./components/SummaryCard.jsx"
import { meses, mesAtual as mesInicial, contas as contasMock } from "./data/mockData.js"
import { fetchContas } from "./data/sheetsApi.js"

let nextId = 1000

export default function App() {
  const [mesAtual, setMesAtual] = useState(mesInicial)
  const [contas, setContas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [avisoFonte, setAvisoFonte] = useState(null) // null | "planilha" | "exemplo"

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    fetchContas()
      .then((dados) => {
        if (!ativo) return
        setContas(dados)
        setAvisoFonte("planilha")
      })
      .catch((err) => {
        if (!ativo) return
        console.warn("Não foi possível ler a planilha:", err.message)
        setContas(contasMock)
        setAvisoFonte("exemplo")
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [])

  const editarCampo = (id, campo, valor) => {
    setContas((prev) => prev.map((c) => (c.id === id ? { ...c, [campo]: valor } : c)))
  }

  const alternarStatus = (id) => {
    setContas((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === "pago" ? "pendente" : "pago" } : c
      )
    )
  }

  const alterarResponsavel = (id, resp) => {
    setContas((prev) => prev.map((c) => (c.id === id ? { ...c, responsavel: resp } : c)))
  }

  const removerConta = (id) => {
    setContas((prev) => prev.filter((c) => c.id !== id))
  }

  const adicionarConta = () => {
    setContas((prev) => [
      ...prev,
      { id: nextId++, desc: "", categoria: "", valor: 0, status: "pendente", responsavel: "eu" },
    ])
  }

  const { pago, pendente, repassar } = useMemo(() => {
    return contas.reduce(
      (acc, c) => {
        const v = Number(c.valor) || 0
        if (c.status === "pago") acc.pago += v
        else acc.pendente += v
        if (c.responsavel === "francesco") acc.repassar += v
        if (c.responsavel === "dividido") acc.repassar += v / 2
        return acc
      },
      { pago: 0, pendente: 0, repassar: 0 }
    )
  }, [contas])

  return (
    <div className="max-w-[820px] mx-auto px-5 py-8 pb-20">
      <div className="flex items-baseline gap-2.5 mb-3">
        <span className="font-display font-semibold text-[22px] tracking-tight">Livro-Caixa</span>
        <span className="text-[12px] text-inkdim uppercase tracking-widest">
          organizador do casal
        </span>
      </div>

      {avisoFonte === "exemplo" && (
        <div className="text-[12px] text-burnt bg-burnt/10 border border-burnt/30 rounded-lg px-3 py-2 mb-5">
          Não consegui ler a planilha (confira o .env e o compartilhamento). Mostrando dados de
          exemplo por enquanto.
        </div>
      )}

      <MonthTabs meses={meses} mesAtual={mesAtual} onChange={setMesAtual} />

      {carregando ? (
        <div className="text-[13px] text-inkdim py-10 text-center">Carregando contas…</div>
      ) : (
        <>
          <HeroSummary pago={pago} pendente={pendente} repassar={repassar} />
          <Ledger
            contas={contas}
            onEdit={editarCampo}
            onToggleStatus={alternarStatus}
            onChangeResp={alterarResponsavel}
            onRemove={removerConta}
            onAdd={adicionarConta}
          />
          <SummaryCard total={pago + pendente} repassar={repassar} mes={mesAtual} />
        </>
      )}
    </div>
  )
}
