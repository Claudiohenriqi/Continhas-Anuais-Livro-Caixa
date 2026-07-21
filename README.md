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
   - Por padrão a função busca a aba `"Contas Julho 2026"` — se sua aba tiver
     outro nome, ajuste a constante `SHEET_NAME` no topo de
     `src/data/sheetsApi.js`.
   - Se a busca falhar (chave errada, planilha não pública, aba com nome
     diferente), o site mostra um aviso e cai de volta pros dados de
     exemplo em `src/data/mockData.js`, sem quebrar a tela.

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
