# ♻️ ReciclaBrasil — Plataforma de Reciclagem e Ecopontos

Aplicação web moderna, 100% responsiva e otimizada para rodar localmente sem erros, com foco em usabilidade, boas práticas de desenvolvimento e arquitetura limpa.

---

## 🚀 Como Executar Localmente

Você pode rodar esta aplicação de duas formas simples:

### Opção 1: Abrir diretamente no navegador (Sem servidor)
1. Navegue até a pasta do projeto:
   
2. Dê um duplo clique no arquivo **`index.html`** (ou abra com Google Chrome, Microsoft Edge, Firefox).

### Opção 2: Servidor Local Rápido com Python
No terminal, execute:
```bash
cd "C:\Users\777\.gemini\antigravity\scratch\reciclabrasil"
python -m http.server 8000
```
Depois acesse no seu navegador: **`http://localhost:8000`**

---

## 📦 Estrutura do Projeto

```
reciclabrasil/
├── index.html          # Estrutura semântica HTML5 e acessível
├── README.md           # Documentação do projeto
├── css/
│   └── style.css       # Design moderno com CSS Variables, Grid, Flexbox e Mobile-First
└── js/
    ├── data.js         # Base de dados de ecopontos em 10 capitais e categorias CONAMA
    └── app.js          # Lógica principal, mapa Leaflet, filtros, calculadora e LocalStorage
```

---

## ✨ Funcionalidades Desenvolvidas

1. **🗺️ Mapa Interativo Georreferenciado:**
   - Integração com Leaflet.js e OpenStreetMap.
   - Pinos customizados para cada ecoponto.
   - Popups com horários, materiais aceitos e link direto para rota no Google Maps ("Como Chegar").
   - Modo de resiliência: se estiver sem conexão, a aplicação opera normalmente via lista com aviso amigável.

2. **🔍 Sistema de Busca e Filtros em Tempo Real:**
   - Busca textual instantânea por bairro, endereço ou nome do local.
   - Filtro por seletor dinâmico de cidades brasileiras.
   - Filtro por chips de materiais (Papel, Plástico, Vidro, Metal, Eletrônico, Orgânico, Óleo, Pilhas).
   - Alternador de visualização: **Dividido** (Mapa + Lista), **Apenas Mapa** ou **Apenas Lista**.

3. **➕ Cadastro Colaborativo de Pontos (LocalStorage):**
   - Modal acessível com validação completa de formulário.
   - Suporte a seleção múltipla de materiais aceitos.
   - Persistência no navegador via `localStorage` (os pontos cadastrados não somem ao recarregar a página).
   - Notificações Toast animadas para feedback visual de sucesso ou erro.

4. **🌿 Calculadora de Impacto Ambiental:**
   - Simulação em tempo real baseada em dados do CEMPRE e IPEA.
   - Métricas: Litros de água poupados, árvores preservadas, kg de CO₂ evitados e energia (kWh) economizada.

5. **📘 Guia Rápido de Separação (Resolução CONAMA):**
   - Cores oficiais das lixeiras seletivas brasileiras (Azul, Vermelho, Amarelo, Verde).
   - Dicas práticas do que descartar e do que NÃO descartar em cada categoria.

---

## 🛡️ Boas Práticas Adotadas
- **HTML Semântico:** Uso correto de tags `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- **Comentários e JSDoc:** Todas as funções e estruturas documentadas em português claro.
- **Design Responsivo:** Adaptável de smartphones pequenos até telas 4K ultra-wide.
- **Zero Dependências Pesadas:** Sem frameworks desnecessários (código puro Vanilla JS rápido e sustentável).
