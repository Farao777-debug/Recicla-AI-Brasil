/**
 * data.js — Base de dados de pontos de coleta e materiais recicláveis
 * Contém todos os dados estáticos da aplicação ReciclaBrasil.
 */

/**
 * Categorias de materiais aceitos nos pontos de coleta.
 * Cada categoria tem um identificador único, nome, ícone emoji e cor de destaque.
 */
const CATEGORIAS = [
  { id: "papel",     nome: "Papel",       icone: "📄", cor: "#3B82F6" },
  { id: "plastico",  nome: "Plástico",    icone: "🧴", cor: "#F59E0B" },
  { id: "metal",     nome: "Metal",       icone: "🥫", cor: "#6B7280" },
  { id: "vidro",     nome: "Vidro",       icone: "🍾", cor: "#10B981" },
  { id: "eletronico",nome: "Eletrônico",  icone: "💻", cor: "#8B5CF6" },
  { id: "organico",  nome: "Orgânico",    icone: "🌿", cor: "#84CC16" },
  { id: "oleo",      nome: "Óleo",        icone: "🛢️", cor: "#F97316" },
  { id: "pilhas",    nome: "Pilhas",      icone: "🔋", cor: "#EF4444" },
];

/**
 * Pontos de coleta de reciclagem espalhados pelo Brasil.
 * Coordenadas reais de praças e locais públicos nas principais cidades.
 * @type {Array<Object>}
 */
const PONTOS_COLETA = [
  /* ── São Paulo ────────────────────────────────────────────── */
  {
    id: 1,
    nome: "Ecoponto Pinheiros",
    endereco: "R. dos Pinheiros, 100 – Pinheiros, São Paulo/SP",
    lat: -23.5666, lng: -46.6868,
    categorias: ["papel", "plastico", "metal", "vidro"],
    horario: "Seg–Sáb 8h–18h",
    telefone: "(11) 3000-1234",
    avaliacao: 4.5,
  },
  {
    id: 2,
    nome: "PEV Paulista",
    endereco: "Av. Paulista, 900 – Bela Vista, São Paulo/SP",
    lat: -23.5629, lng: -46.6544,
    categorias: ["papel", "plastico", "eletronico", "pilhas"],
    horario: "Seg–Dom 7h–20h",
    telefone: "(11) 3000-5678",
    avaliacao: 4.8,
  },
  {
    id: 3,
    nome: "Ecocentro Vila Madalena",
    endereco: "R. Girassol, 50 – Vila Madalena, São Paulo/SP",
    lat: -23.5566, lng: -46.6925,
    categorias: ["papel", "plastico", "metal", "vidro", "organico"],
    horario: "Seg–Sex 8h–17h",
    telefone: "(11) 3000-9012",
    avaliacao: 4.3,
  },
  {
    id: 4,
    nome: "Ponto Reciclável Liberdade",
    endereco: "Praça da Liberdade – Liberdade, São Paulo/SP",
    lat: -23.5592, lng: -46.6363,
    categorias: ["papel", "plastico", "metal"],
    horario: "Seg–Sáb 9h–16h",
    telefone: "(11) 3000-3456",
    avaliacao: 4.1,
  },

  /* ── Rio de Janeiro ───────────────────────────────────────── */
  {
    id: 5,
    nome: "Ecoponto Ipanema",
    endereco: "Av. Vieira Souto, 200 – Ipanema, Rio de Janeiro/RJ",
    lat: -22.9868, lng: -43.2043,
    categorias: ["papel", "plastico", "vidro", "metal"],
    horario: "Seg–Dom 7h–19h",
    telefone: "(21) 3900-1111",
    avaliacao: 4.7,
  },
  {
    id: 6,
    nome: "PEV Botafogo",
    endereco: "Praia de Botafogo, 400 – Botafogo, Rio de Janeiro/RJ",
    lat: -22.9461, lng: -43.1859,
    categorias: ["eletronico", "pilhas", "metal", "plastico"],
    horario: "Ter–Dom 8h–17h",
    telefone: "(21) 3900-2222",
    avaliacao: 4.4,
  },
  {
    id: 7,
    nome: "Coleta Seletiva Tijuca",
    endereco: "Praça Saens Peña – Tijuca, Rio de Janeiro/RJ",
    lat: -22.9238, lng: -43.2356,
    categorias: ["papel", "vidro", "organico", "oleo"],
    horario: "Seg–Sáb 8h–18h",
    telefone: "(21) 3900-3333",
    avaliacao: 4.2,
  },

  /* ── Belo Horizonte ───────────────────────────────────────── */
  {
    id: 8,
    nome: "Ecoponto Savassi",
    endereco: "Praça Diogo de Vasconcelos – Savassi, BH/MG",
    lat: -19.9370, lng: -43.9378,
    categorias: ["papel", "plastico", "metal", "vidro"],
    horario: "Seg–Sex 7h–18h",
    telefone: "(31) 3200-4444",
    avaliacao: 4.6,
  },
  {
    id: 9,
    nome: "PEV Pampulha",
    endereco: "Av. Otacílio Negrão de Lima – Pampulha, BH/MG",
    lat: -19.8606, lng: -43.9727,
    categorias: ["eletronico", "pilhas", "oleo"],
    horario: "Ter–Dom 8h–17h",
    telefone: "(31) 3200-5555",
    avaliacao: 4.3,
  },

  /* ── Brasília ─────────────────────────────────────────────── */
  {
    id: 10,
    nome: "Ecoponto Asa Norte",
    endereco: "SQN 315 – Asa Norte, Brasília/DF",
    lat: -15.7622, lng: -47.8784,
    categorias: ["papel", "plastico", "metal", "vidro", "pilhas"],
    horario: "Seg–Sáb 8h–18h",
    telefone: "(61) 3200-6666",
    avaliacao: 4.5,
  },
  {
    id: 11,
    nome: "Coleta Asa Sul",
    endereco: "SQS 210 – Asa Sul, Brasília/DF",
    lat: -15.8057, lng: -47.8934,
    categorias: ["papel", "plastico", "organico"],
    horario: "Seg–Sex 7h–17h",
    telefone: "(61) 3200-7777",
    avaliacao: 4.1,
  },

  /* ── Porto Alegre ─────────────────────────────────────────── */
  {
    id: 12,
    nome: "Ecoponto Moinhos de Vento",
    endereco: "Parque Moinhos de Vento – Moinhos de Vento, Porto Alegre/RS",
    lat: -30.0195, lng: -51.1934,
    categorias: ["papel", "plastico", "vidro", "metal"],
    horario: "Seg–Dom 6h–20h",
    telefone: "(51) 3200-8888",
    avaliacao: 4.9,
  },
  {
    id: 13,
    nome: "PEV Centro Histórico POA",
    endereco: "Praça da Alfândega – Centro, Porto Alegre/RS",
    lat: -30.0327, lng: -51.2282,
    categorias: ["eletronico", "pilhas", "metal"],
    horario: "Seg–Sáb 9h–18h",
    telefone: "(51) 3200-9999",
    avaliacao: 4.0,
  },

  /* ── Salvador ─────────────────────────────────────────────── */
  {
    id: 14,
    nome: "Ecoponto Barra",
    endereco: "Av. Oceânica, 100 – Barra, Salvador/BA",
    lat: -13.0094, lng: -38.5322,
    categorias: ["papel", "plastico", "vidro", "oleo"],
    horario: "Seg–Sáb 8h–17h",
    telefone: "(71) 3300-1111",
    avaliacao: 4.4,
  },
  {
    id: 15,
    nome: "PEV Pelourinho",
    endereco: "Largo do Pelourinho – Pelourinho, Salvador/BA",
    lat: -12.9733, lng: -38.5093,
    categorias: ["papel", "metal", "plastico"],
    horario: "Ter–Dom 9h–18h",
    telefone: "(71) 3300-2222",
    avaliacao: 4.2,
  },

  /* ── Fortaleza ────────────────────────────────────────────── */
  {
    id: 16,
    nome: "Ecoponto Meireles",
    endereco: "Av. Beira Mar, 300 – Meireles, Fortaleza/CE",
    lat: -3.7318, lng: -38.5146,
    categorias: ["papel", "plastico", "vidro"],
    horario: "Seg–Dom 7h–19h",
    telefone: "(85) 3300-3333",
    avaliacao: 4.6,
  },

  /* ── Manaus ───────────────────────────────────────────────── */
  {
    id: 17,
    nome: "Ecoponto Centro Manaus",
    endereco: "Av. Eduardo Ribeiro, 520 – Centro, Manaus/AM",
    lat: -3.1310, lng: -60.0212,
    categorias: ["papel", "plastico", "eletronico", "pilhas"],
    horario: "Seg–Sex 8h–17h",
    telefone: "(92) 3200-4444",
    avaliacao: 4.0,
  },

  /* ── Curitiba ─────────────────────────────────────────────── */
  {
    id: 18,
    nome: "Ecoponto Batel",
    endereco: "Rua Bispo Dom José, 1000 – Batel, Curitiba/PR",
    lat: -25.4428, lng: -49.2892,
    categorias: ["papel", "plastico", "metal", "vidro", "organico"],
    horario: "Seg–Sáb 7h–19h",
    telefone: "(41) 3300-5555",
    avaliacao: 4.8,
  },
  {
    id: 19,
    nome: "PEV Barigui",
    endereco: "Parque Barigui – Cascatinha, Curitiba/PR",
    lat: -25.4298, lng: -49.3259,
    categorias: ["papel", "plastico", "oleo", "vidro"],
    horario: "Seg–Dom 8h–18h",
    telefone: "(41) 3300-6666",
    avaliacao: 4.5,
  },

  /* ── Recife ───────────────────────────────────────────────── */
  {
    id: 20,
    nome: "Ecoponto Boa Viagem",
    endereco: "Av. Boa Viagem, 200 – Boa Viagem, Recife/PE",
    lat: -8.1199, lng: -34.9009,
    categorias: ["papel", "plastico", "vidro", "metal"],
    horario: "Seg–Dom 7h–18h",
    telefone: "(81) 3300-7777",
    avaliacao: 4.3,
  },
];

/**
 * Estatísticas gerais da plataforma para exibição na tela inicial.
 */
const STATS = {
  pontos: PONTOS_COLETA.length,
  cidades: [...new Set(PONTOS_COLETA.map(p => p.endereco.split("/")[1]))].length,
  materiais: CATEGORIAS.length,
  toneladas: "12.500+",
};

// Exporta para uso global no browser (sem módulos ES)
window.ReciclaBrasilData = { CATEGORIAS, PONTOS_COLETA, STATS };
