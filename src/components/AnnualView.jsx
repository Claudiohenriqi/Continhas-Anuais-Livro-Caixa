import { useState } from "react"
import { listarMesesDisponiveis, fetchContasDaAba } from "../data/sheetsApi.js"

const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export default function AnnualView() {
  const [aberto, setAberto] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [dados, setDados] = useState([])
  const [erro, setErro] = useState(null)

  const carregar = async () => {
    setAberto(true)
    if (dados.length > 0) return
    setCarregando(true)
    setErro(null)
    try {
      const meses = await listarMesesDisponiveis()
      const resultados = []
      for (const m of meses) {
        const contasDoMes = await fetchContasDaAba(m.aba)
        const total = contasDoMes.reduce((s, c) => s + (Number(c.valor) || 0), 0)
        resultados.push({ rotulo: m.rotulo, total })
      }
      setDados(resultados)
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  if (!aberto) {
    return (
      <button
        onClick={carregar}
        className="mt-7 w-full text-[13px] text-inkdim hover:text-gold border border-dashed border-hair rounded-lg py-2.5"
      >
        Ver visão anual (todos os meses)
      </button>
    )
  }

  const max = Math.max(...dados.map((d) => d.total), 1)

  return (
    <div className="mt-7 bg-surface border border-hair rounded-2xl px-6 py-6">
      <h2 className="font-display font-medium text-[17px] mb-4">Visão anual</h2>
      {carregando && <p className="text-[13px] text-inkdim">Carregando meses…</p>}
      {erro && <p className="text-[13px] text-brick">Erro: {erro}</p>}
      {!carregando && !erro && dados.length > 0 && (
        <div className="flex items-end gap-3 h-40">
          {dados.map((d) => (
            <div key={d.rotulo} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="text-[10px] font-mono text-inkdim whitespace-nowrap">{fmt(d.total)}</div>
              <div
                className="w-full bg-gold rounded-t-md"
                style={{ height: `${(d.total / max) * 100}%`, minHeight: "4px" }}
              />
              <div className="text-[11px] text-inkdim">{d.rotulo}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
