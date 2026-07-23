import { useState } from "react"

const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

// Desenha um "recibo" com a mesma cara do site e devolve um Blob PNG.
async function gerarImagemResumo(contas, mes, repassar, recebido, restante) {
  const doFrancesco = contas.filter((c) => c.responsavel === "francesco")
  const divididas = contas.filter((c) => c.responsavel === "dividido")
  const linhas = [
    ...doFrancesco.map((c) => ({ desc: c.desc || "(sem nome)", valor: c.valor, tag: null })),
    ...divididas.map((c) => ({ desc: c.desc || "(sem nome)", valor: c.valor / 2, tag: "1/2" })),
  ]

  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.load("800 28px Inter")
      await document.fonts.load("600 16px Inter")
      await document.fonts.load("400 14px Inter")
      await document.fonts.ready
    } catch (e) {
      /* segue sem esperar, as fontes de sistema já servem de fallback */
    }
  }

  const width = 640
  const padX = 40
  const lineH = 30
  const headerH = 130
  const groupLabelH = 28
  const footerH = recebido > 0 ? 190 : 130
  const groupsCount = (doFrancesco.length > 0 ? 1 : 0) + (divididas.length > 0 ? 1 : 0)
  const height =
    headerH + groupsCount * groupLabelH + linhas.length * lineH + footerH + 30

  const canvas = document.createElement("canvas")
  const scale = 2 // resolução maior, fica nítido em tela de celular
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext("2d")
  ctx.scale(scale, scale)

  // fundo
  ctx.fillStyle = "#0A0A0A"
  ctx.fillRect(0, 0, width, height)

  // cabeçalho
  ctx.fillStyle = "#D7FF4E"
  ctx.font = "800 26px Inter, sans-serif"
  ctx.fillText("Livro-Caixa", padX, 52)
  ctx.fillStyle = "#8F8F8F"
  ctx.font = "12px Inter, Arial, sans-serif"
  ctx.fillText(`CONTAS DE ${mes.toUpperCase()}`, padX, 74)

  // linha pontilhada
  ctx.strokeStyle = "rgba(243,238,221,0.18)"
  ctx.setLineDash([2, 4])
  ctx.beginPath()
  ctx.moveTo(padX, 98)
  ctx.lineTo(width - padX, 98)
  ctx.stroke()
  ctx.setLineDash([])

  let y = 130

  const desenharGrupo = (titulo, lista) => {
    if (lista.length === 0) return
    ctx.fillStyle = "#8F8F8F"
    ctx.font = "11px Inter, Arial, sans-serif"
    ctx.fillText(titulo.toUpperCase(), padX, y)
    y += groupLabelH
    lista.forEach((l) => {
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "15px Inter, Arial, sans-serif"
      ctx.fillText(l.desc, padX, y)
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "600 15px Inter, sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(fmt(l.valor), width - padX, y)
      ctx.textAlign = "left"
      y += lineH
    })
  }

  desenharGrupo("Dele", doFrancesco.map((c) => ({ desc: c.desc || "(sem nome)", valor: c.valor })))
  desenharGrupo(
    "Divididas (metade dele)",
    divididas.map((c) => ({ desc: c.desc || "(sem nome)", valor: c.valor / 2 }))
  )

  // linha final tracejada
  y += 12
  ctx.strokeStyle = "rgba(243,238,221,0.18)"
  ctx.setLineDash([2, 4])
  ctx.beginPath()
  ctx.moveTo(padX, y)
  ctx.lineTo(width - padX, y)
  ctx.stroke()
  ctx.setLineDash([])

  y += 38
  ctx.fillStyle = "#8F8F8F"
  ctx.font = "13px Inter, Arial, sans-serif"
  ctx.fillText("TOTAL A REPASSAR", padX, y)
  ctx.textAlign = "right"
  ctx.fillStyle = "#FFFFFF"
  ctx.font = "600 15px Inter, sans-serif"
  ctx.fillText(fmt(repassar), width - padX, y)
  ctx.textAlign = "left"

  if (recebido > 0) {
    y += 26
    ctx.fillStyle = "#8F8F8F"
    ctx.font = "13px Inter, Arial, sans-serif"
    ctx.fillText("JÁ RECEBIDO", padX, y)
    ctx.textAlign = "right"
    ctx.fillStyle = "#22C55E"
    ctx.font = "600 15px Inter, sans-serif"
    ctx.fillText(`- ${fmt(recebido)}`, width - padX, y)
    ctx.textAlign = "left"
  }

  y += 40
  ctx.fillStyle = "#8F8F8F"
  ctx.font = "13px Inter, Arial, sans-serif"
  ctx.fillText("FALTA", padX, y)

  y += 40
  ctx.fillStyle = "#D7FF4E"
  ctx.font = "800 34px Inter, sans-serif"
  ctx.fillText(fmt(restante), padX, y)

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"))
}

function montarTexto(contas, mes, repassar, recebido, restante) {
  const doFrancesco = contas.filter((c) => c.responsavel === "francesco")
  const divididas = contas.filter((c) => c.responsavel === "dividido")

  let texto = `📋 Contas de ${mes}\n`

  if (doFrancesco.length > 0) {
    texto += `\n*Suas:*\n`
    doFrancesco.forEach((c) => {
      texto += `• ${c.desc || "(sem nome)"}: ${fmt(c.valor)}\n`
    })
  }

  if (divididas.length > 0) {
    texto += `\n*Divididas (sua metade):*\n`
    divididas.forEach((c) => {
      texto += `• ${c.desc || "(sem nome)"}: ${fmt(c.valor / 2)} (metade de ${fmt(c.valor)})\n`
    })
  }

  texto += `\nTotal a repassar: ${fmt(repassar)}`
  if (recebido > 0) {
    texto += `\nJá recebido: -${fmt(recebido)}`
  }
  texto += `\n*Falta: ${fmt(restante)}*`
  return texto
}

export default function SummaryCard({ contas, repassar, mes, onAddRecebimento, onRemove }) {
  const [valorNovo, setValorNovo] = useState("")
  const [notaNova, setNotaNova] = useState("")

  const doFrancesco = contas.filter((c) => c.responsavel === "francesco")
  const divididas = contas.filter((c) => c.responsavel === "dividido")
  const recebimentos = contas.filter((c) => c.categoria === "Recebimento")
  const semNada = doFrancesco.length === 0 && divididas.length === 0

  const totalRecebido = recebimentos.reduce((s, c) => s + (Number(c.valor) || 0), 0)
  const restante = repassar - totalRecebido

  const copiar = () => {
    navigator.clipboard.writeText(montarTexto(contas, mes, repassar, totalRecebido, restante))
    alert("Resumo copiado!")
  }

  const whatsapp = () => {
    const texto = encodeURIComponent(montarTexto(contas, mes, repassar, totalRecebido, restante))
    window.open(`https://wa.me/?text=${texto}`, "_blank")
  }

  const compartilharImagem = async () => {
    const blob = await gerarImagemResumo(contas, mes, repassar, totalRecebido, restante)
    const arquivo = new File([blob], `resumo-${mes.replace(" ", "-")}.png`, { type: "image/png" })

    if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
      try {
        await navigator.share({ files: [arquivo], title: `Contas de ${mes}` })
        return
      } catch (e) {
        if (e.name === "AbortError") return // pessoa cancelou o compartilhamento
      }
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `resumo-${mes.replace(" ", "-")}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  const registrar = () => {
    const v = Number(valorNovo)
    if (!v || v <= 0) return
    onAddRecebimento(v, notaNova)
    setValorNovo("")
    setNotaNova("")
  }

  return (
    <div className="mt-2.5 bg-surface rounded-2xl px-6 py-6">
      <h2 className="font-display font-semibold text-[16px] mb-3">Resumo pro Francesco</h2>

      {semNada ? (
        <p className="text-[13px] text-inkdim">
          Nenhuma conta marcada como dele ou dividida ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {doFrancesco.length > 0 && (
            <div>
              <div className="text-[11px] text-inkdim uppercase tracking-wide mb-1">Dele</div>
              {doFrancesco.map((c) => (
                <div key={c.id} className="flex justify-between text-[13px] py-0.5">
                  <span className="text-ink">{c.desc || "(sem nome)"}</span>
                  <span className="font-mono text-ink">{fmt(c.valor)}</span>
                </div>
              ))}
            </div>
          )}

          {divididas.length > 0 && (
            <div>
              <div className="text-[11px] text-inkdim uppercase tracking-wide mb-1">
                Divididas (metade dele)
              </div>
              {divididas.map((c) => (
                <div key={c.id} className="flex justify-between text-[13px] py-0.5">
                  <span className="text-ink">{c.desc || "(sem nome)"}</span>
                  <span className="font-mono text-ink">{fmt(c.valor / 2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center mt-4 pt-3.5 border-t border-hair">
        <span className="text-[13px] text-inkdim">Total a repassar</span>
        <span className="font-mono text-[15px] text-ink font-semibold">{fmt(repassar)}</span>
      </div>

      {/* Pagamentos já recebidos */}
      <div className="mt-3">
        <div className="text-[11px] text-inkdim uppercase tracking-wide mb-1.5">
          Pagamentos já recebidos
        </div>

        {recebimentos.length > 0 && (
          <div className="space-y-1 mb-2">
            {recebimentos.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-[13px]">
                <span className="text-ink truncate">{r.desc}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono text-jade">- {fmt(r.valor)}</span>
                  <button
                    onClick={() => onRemove(r.id)}
                    title="Remover"
                    className="text-inkdim hover:text-brick text-[13px] leading-none"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.01"
            placeholder="Valor recebido"
            value={valorNovo}
            onChange={(e) => setValorNovo(e.target.value)}
            className="flex-1 min-w-0 bg-surface2 rounded-lg px-3 py-2 text-[13px] text-ink font-mono focus:outline-none"
          />
          <input
            type="text"
            placeholder="Nota (opcional)"
            value={notaNova}
            onChange={(e) => setNotaNova(e.target.value)}
            className="flex-1 min-w-0 bg-surface2 rounded-lg px-3 py-2 text-[13px] text-ink focus:outline-none"
          />
          <button
            onClick={registrar}
            disabled={!valorNovo || Number(valorNovo) <= 0}
            className="text-[12px] font-medium px-3 py-2 rounded-lg bg-gold text-[#0A0A0A] disabled:opacity-40 flex-shrink-0"
          >
            Registrar
          </button>
        </div>
      </div>

      <div className="flex justify-between items-baseline mt-4 pt-3.5 border-t border-hair">
        <span className="text-[14px] text-ink">Falta</span>
        <strong className="font-mono text-[26px] text-gold font-semibold">{fmt(restante)}</strong>
      </div>

      <div className="flex gap-2.5 mt-4 flex-wrap">
        <button
          onClick={copiar}
          className="text-[13px] font-medium px-4 py-2.5 rounded-lg bg-gold text-[#0A0A0A]"
        >
          Copiar resumo
        </button>
        <button
          onClick={whatsapp}
          className="text-[13px] font-medium px-4 py-2.5 rounded-lg border border-hair text-ink"
        >
          Enviar no WhatsApp
        </button>
        <button
          onClick={compartilharImagem}
          className="text-[13px] font-medium px-4 py-2.5 rounded-lg border border-hair text-ink"
        >
          Compartilhar como imagem
        </button>
      </div>
    </div>
  )
}
