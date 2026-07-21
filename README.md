# Livro-Caixa

Organizador financeiro pessoal — dashboard do mês, divisão de contas com o
Francesco, e resumo pronto pra compartilhar.

## Rodando localmente

```bash
npm install
npm run dev
```

## Estrutura

- `src/data/mockData.js` — dados de exemplo. É aqui que depois entra a
  leitura real da planilha do Google Sheets.
- `src/components/` — MonthTabs, HeroSummary, Ledger, SummaryCard.
- `src/App.jsx` — junta tudo e calcula os totais.

## Próximos passos

1. **Conectar no Google Sheets** ✅ já implementado em `src/data/sheetsApi.js`
   - Confirme que o `.env` tem `VITE_SHEETS_API_KEY` e `VITE_SHEET_ID`.
   - Cada mês precisa ficar numa aba própria, chamada exatamente
     `"Contas <Mês por extenso> <Ano>"` (ex: `Contas Julho 2026`,
     `Contas Agosto 2026`). O site lista as abas da planilha, descobre
     quais seguem esse padrão, e mostra uma aba de mês pra cada uma.
   - Se a busca falhar (chave errada, planilha não pública, nenhuma aba
     no formato certo), o site mostra um aviso e cai de volta pros dados
     de exemplo em `src/data/mockData.js`, sem quebrar a tela.

2. **Publicar no GitHub Pages**
   ```bash
   npm install
   npm run build
   npm run deploy
   ```
   Antes disso, ajuste `base` em `vite.config.js` para
   `/NOME-DO-REPOSITORIO/`, e habilite o GitHub Pages nas configurações do
   repositório (branch `gh-pages`).

3. **Upload de fatura em PDF** — por enquanto, suba o PDF aqui no chat que eu
   organizo os lançamentos pra você colar na planilha. Automatizar isso
   direto no site é um passo futuro (v2).
