const PALETA = [
  "#3B82F6", // azul
  "#22C55E", // verde
  "#F43F5E", // vermelho
  "#A855F7", // roxo
  "#F5A524", // laranja
  "#06B6D4", // ciano
  "#EC4899", // rosa
  "#D7FF4E", // lima
]

function corPara(nome) {
  const s = (nome || "?").trim()
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PALETA[Math.abs(hash) % PALETA.length]
}

export default function Avatar({ nome, size = 26 }) {
  const letra = (nome || "?").trim().charAt(0).toUpperCase() || "?"
  const cor = corPara(nome)
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[#0A0A0A]"
      style={{ width: size, height: size, backgroundColor: cor, fontSize: size * 0.42 }}
    >
      {letra}
    </div>
  )
}
