import { useState, useMemo, useEffect } from "react"
import MonthTabs from "./components/MonthTabs.jsx"
import HeroSummary from "./components/HeroSummary.jsx"
import Ledger from "./components/Ledger.jsx"
import SummaryCard from "./components/SummaryCard.jsx"
import CategoryChart from "./components/CategoryChart.jsx"
import ParceladoChart from "./components/ParceladoChart.jsx"
import AnnualView from "./components/AnnualView.jsx"
import { contas as contasMock } from "./data/mockData.js"
import { listarMesesDisponiveis, fetchContasDaAba, salvarNaAba, levarContasFixas } from "./data/sheetsApi.js"
import { chaveParaMesAno, proximoMes, tituloAba, avancarData, avancarParcela } from "./utils/date.js"

let nextId = 1000

export default function App() {
  const [meses, setMeses] = useState([])
  const [mesAtual, setMesAtual] = useState(null)
  const [contas, setContas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [avisoFonte, setAvisoFonte] = useState(null) // null | "planilha" | "exemplo"
  const [sujo, setSujo] = useState(false) // tem alteração não salva?
  const [salvando, setSalvando] = useState(false)
  const [erroSalvar, setErroSalvar] = useState(null)
  const [levandoFixas, setLevandoFixas] = useState(false)
  const [msgFixas, setMsgFixas] = useState(null)

  // 1) Ao abrir o site, lista as abas (meses) disponíveis na planilha
  useEffect(() => {
    let ativo = true
    listarMesesDisponiveis()
      .then((lista) => {
        if (!ativo) return
        setMeses(lista)
        setMesAtual(lista[lista.length - 1].chave)
        setAvisoFonte("planilha")
      })
      .catch((err) => {
        if (!ativo) return
        console.warn("Não foi possível listar os meses da planilha:", err.message)
        setContas(contasMock)
        setAvisoFonte("exemplo")
        setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [])

  // 2) Sempre que o mês selecionado mudar, busca os dados daquela aba
  useEffect(() => {
    if (!mesAtual) return
    const mes = meses.find((m) => m.chave === mesAtual)
    if (!mes) return

    let ativo = true
    setCarregando(true)
    fetchContasDaAba(mes.aba)
      .then((dados) => {
        if (!ativo) return
        setContas(dados)
        setSujo(false)
      })
      .catch((err) => {
        if (!ativo) return
        console.warn("Não foi possível ler a aba", mes.aba, err.message)
        setContas([])
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [mesAtual, meses])

  const editarCampo = (id, campo, valor) => {
    setContas((prev) => prev.map((c) => (c.id === id ? { ...c, [campo]: valor } : c)))
    setSujo(true)
  }

  const alternarStatus = (id) => {
    setContas((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === "pago" ? "pendente" : "pago" } : c
      )
    )
    setSujo(true)
  }

  const alterarResponsavel = (id, resp) => {
    setContas((prev) => prev.map((c) => (c.id === id ? { ...c, responsavel: resp } : c)))
    setSujo(true)
  }

  const removerConta = (id) => {
    setContas((prev) => prev.filter((c) => c.id !== id))
    setSujo(true)
  }

  const adicionarConta = () => {
    setContas((prev) => [
      ...prev,
      {
        id: nextId++,
        desc: "",
        categoria: "",
        valor: 0,
        cartao: "",
        data: "",
        parcela: "",
        vencimento: "",
        status: "pendente",
        responsavel: "eu",
        grupo: "",
        fixa: false,
      },
    ])
    setSujo(true)
  }

  const salvarAlteracoes = () => {
    const mes = meses.find((m) => m.chave === mesAtual)
    if (!mes) return
    setSalvando(true)
    setErroSalvar(null)
    salvarNaAba(mes.aba, contas)
      .then(() => {
        setSujo(false)
      })
      .catch((err) => {
        setErroSalvar(err.message)
      })
      .finally(() => {
        setSalvando(false)
      })
  }

  // Salva sozinho 2s depois da última edição, sem precisar clicar no botão
  useEffect(() => {
    if (!sujo || salvando || carregando) return
    const t = setTimeout(() => {
      salvarAlteracoes()
    }, 2000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contas, sujo])

  const levarFixasProximoMes = () => {
    const ehParcelaAtiva = (p) => /^\d+\s*\/\s*\d+$/.test((p || "").trim())
    const candidatos = contas.filter((c) => c.fixa || ehParcelaAtiva(c.parcela))

    if (candidatos.length === 0) {
      setMsgFixas(
        "Nenhuma conta fixa ou parcelada encontrada (clique no 📌 pra marcar contas sem parcela, tipo aluguel)."
      )
      return
    }

    const linhas = candidatos
      .map((c) => {
        const parcelaInfo = avancarParcela(c.parcela)
        if (parcelaInfo.esgotada) return null
        return {
          cartao: c.cartao,
          data: avancarData(c.data),
          desc: c.desc,
          categoria: c.categoria,
          valor: c.valor,
          parcela: parcelaInfo.texto,
          vencimento: avancarData(c.vencimento),
          responsavel: c.responsavel,
          grupo: "",
          fixa: c.fixa,
        }
      })
      .filter(Boolean)

    if (linhas.length === 0) {
      setMsgFixas("As parcelas fixas já chegaram no fim — nenhuma pra levar adiante.")
      return
    }

    const destino = tituloAba(proximoMes(chaveParaMesAno(mesAtual)))
    setLevandoFixas(true)
    setMsgFixas(null)
    levarContasFixas(destino, linhas)
      .then(() => {
        setMsgFixas(`${linhas.length} conta(s) levada(s) pra "${destino}".`)
      })
      .catch((err) => {
        setMsgFixas(`Erro: ${err.message}`)
      })
      .finally(() => {
        setLevandoFixas(false)
      })
  }

  const adicionarRecebimento = (valor, nota) => {
    setContas((prev) => [
      ...prev,
      {
        id: nextId++,
        desc: nota?.trim() || "Pagamento recebido",
        categoria: "Recebimento",
        valor: Number(valor) || 0,
        cartao: "",
        data: "",
        parcela: "",
        vencimento: "",
        status: "pago",
        responsavel: "francesco",
        grupo: "",
        fixa: false,
      },
    ])
    setSujo(true)
  }

  const { pago, pendente, repassar } = useMemo(() => {
    return contas.reduce(
      (acc, c) => {
        if (c.categoria === "Recebimento") return acc // pagamento já recebido, não é conta
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

  const mesRotulo = meses.find((m) => m.chave === mesAtual)?.rotulo || ""

  return (
    <div className="max-w-[820px] mx-auto px-5 py-8 pb-20">
      <div className="flex items-baseline justify-between gap-2.5 mb-3 flex-wrap">
        <div className="flex items-baseline gap-2.5">
          <span className="font-display font-semibold text-[22px] tracking-tight">
            Livro-Caixa
          </span>
          <span className="text-[12px] text-inkdim uppercase tracking-widest">
            organizador do casal
          </span>
        </div>

        <button
          onClick={salvarAlteracoes}
          disabled={!sujo || salvando}
          title={sujo ? "Salva sozinho em instantes — clique pra forçar agora" : ""}
          className={`text-[13px] font-medium px-4 py-2 rounded-lg border ${
            sujo
              ? "bg-gold text-[#0A0A0A] border-gold"
              : "text-inkdim border-hair cursor-default"
          }`}
        >
          {salvando ? "Salvando…" : sujo ? "Salvando em instantes…" : "Tudo salvo"}
        </button>
      </div>

      {erroSalvar && (
        <div className="text-[12px] text-brick bg-brick/10 border border-brick/30 rounded-lg px-3 py-2 mb-5">
          Não consegui salvar: {erroSalvar}
        </div>
      )}

      {avisoFonte === "exemplo" && (
        <div className="text-[12px] text-burnt bg-burnt/10 border border-burnt/30 rounded-lg px-3 py-2 mb-5">
          Não consegui ler a planilha (confira o .env, o compartilhamento, e se as abas se chamam
          "Contas &lt;Mês&gt; &lt;Ano&gt;"). Mostrando dados de exemplo por enquanto.
        </div>
      )}

      <MonthTabs meses={meses} mesAtual={mesAtual} onChange={setMesAtual} />

      {carregando ? (
        <div className="text-[13px] text-inkdim py-10 text-center">Carregando contas…</div>
      ) : (
        <>
          <HeroSummary pago={pago} pendente={pendente} repassar={repassar} />

          <div className="flex justify-between items-center mt-2 mb-1 gap-2 flex-wrap">
            <span className="text-[11px] text-inkdim flex-1 min-w-[200px]">
              📌 marque contas sem parcela pra repetir todo mês (aluguel, carro) — contas
              parceladas (ex: 3/12) já são levadas automaticamente
            </span>
            <button
              onClick={levarFixasProximoMes}
              disabled={levandoFixas}
              className="text-[12px] text-inkdim hover:text-gold whitespace-nowrap"
            >
              {levandoFixas ? "Levando…" : "Levar fixas → próximo mês"}
            </button>
          </div>
          {msgFixas && <p className="text-[12px] text-jade mb-2">{msgFixas}</p>}

          <Ledger
            contas={contas}
            onEdit={editarCampo}
            onToggleStatus={alternarStatus}
            onChangeResp={alterarResponsavel}
            onRemove={removerConta}
            onAdd={adicionarConta}
          />
          <SummaryCard
            contas={contas}
            repassar={repassar}
            mes={mesRotulo}
            onAddRecebimento={adicionarRecebimento}
            onRemove={removerConta}
          />
          <CategoryChart contas={contas} onEdit={editarCampo} />
          <ParceladoChart contas={contas} />
          <AnnualView />
        </>
      )}
    </div>
  )
}
