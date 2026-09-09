/**
 * app.js — Lógica Principal da Aplicação ReciclaBrasil
 * 
 * Responsável por:
 *  1. Gerenciamento de estado (pontos de coleta, filtros ativos, busca).
 *  2. Renderização do mapa interativo via Leaflet.js (com fallback resiliente).
 *  3. Filtragem em tempo real por categoria, cidade e texto livre.
 *  4. Cadastro de novos pontos no LocalStorage.
 *  5. Calculadora interativa de impacto ambiental.
 *  6. Notificações toast e controle de interface responsiva.
 */

/* ==========================================================================
   Estado Global da Aplicação
   ========================================================================== */
const AppState = {
  // Lista de todos os pontos carregados (padrão + criados pelo usuário)
  pontos: [],
  // Instância do mapa Leaflet
  mapa: null,
  // Grupo de camadas para os marcadores do mapa
  grupoMarcadores: null,
  // Filtro de categoria selecionado ('todos' ou ID da categoria)
  categoriaAtiva: 'todos',
  // Filtro de cidade selecionada ('todas' ou nome da cidade)
  cidadeAtiva: 'todas',
  // Termo digitado na caixa de busca
  termoBusca: '',
  // Modo de visualização ativo ('split', 'map', 'list')
  modoVisualizacao: 'split'
};

/* ==========================================================================
   Inicialização no Carregamento do DOM
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  inicializarAplicacao();
});

/**
 * Função de inicialização principal.
 * Carrega os dados, configura os componentes de UI, o mapa e os ouvintes de eventos.
 */
function inicializarAplicacao() {
  carregarPontosSalvos();
  renderizarChipsCategorias();
  renderizarSelectCidades();
  renderizarEstatisticas();
  inicializarMapa();
  filtrarERenderizar();
  configurarEventos();
  configurarCalculadora();
}

/* ==========================================================================
   Gerenciamento de Dados e Persistência Local (LocalStorage)
   ========================================================================== */

/**
 * Carrega os pontos do LocalStorage.
 * Caso seja a primeira execução, carrega os dados estáticos de `data.js`.
 */
function carregarPontosSalvos() {
  try {
    const salvos = localStorage.getItem('reciclabrasil_pontos');
    if (salvos) {
      AppState.pontos = JSON.parse(salvos);
    } else if (window.ReciclaBrasilData && window.ReciclaBrasilData.PONTOS_COLETA) {
      AppState.pontos = [...window.ReciclaBrasilData.PONTOS_COLETA];
      salvarPontosNoStorage();
    }
  } catch (erro) {
    console.warn('Erro ao carregar dados do localStorage, usando base padrão:', erro);
    AppState.pontos = window.ReciclaBrasilData ? [...window.ReciclaBrasilData.PONTOS_COLETA] : [];
  }
}

/**
 * Salva a lista de pontos atualizada no LocalStorage do navegador.
 */
function salvarPontosNoStorage() {
  try {
    localStorage.setItem('reciclabrasil_pontos', JSON.stringify(AppState.pontos));
  } catch (erro) {
    console.error('Falha ao persistir no localStorage:', erro);
  }
}

/* ==========================================================================
   Renderização de Estatísticas Rápidas no Hero
   ========================================================================== */

/**
 * Atualiza os contadores numéricos na seção de destaque (Hero).
 */
function renderizarEstatisticas() {
  const statPontos = document.getElementById('stat-pontos');
  const statCidades = document.getElementById('stat-cidades');
  const statMateriais = document.getElementById('stat-materiais');

  if (statPontos) statPontos.textContent = AppState.pontos.length;

  if (statCidades) {
    const cidadesUnicas = new Set(AppState.pontos.map(p => extrairCidade(p.endereco)));
    statCidades.textContent = cidadesUnicas.size;
  }

  if (statMateriais && window.ReciclaBrasilData) {
    statMateriais.textContent = window.ReciclaBrasilData.CATEGORIAS.length;
  }
}

/**
 * Utilitário para extrair a cidade do endereço no padrão "Bairro, Cidade/UF".
 * @param {string} endereco 
 * @returns {string} Nome da cidade/UF
 */
function extrairCidade(endereco) {
  if (!endereco) return '';
  const partes = endereco.split('–');
  const ultimaParte = partes[partes.length - 1] || endereco;
  const subpartes = ultimaParte.split(',');
  return (subpartes[subpartes.length - 1] || ultimaParte).trim();
}

/* ==========================================================================
   Inicialização e Controle do Mapa Interativo (Leaflet.js)
   ========================================================================== */

/**
 * Inicializa a instância do Leaflet.js.
 * Caso o Leaflet não esteja carregado (ex: sem conexão), ativa o banner de fallback com elegância.
 */
function inicializarMapa() {
  const mapElement = document.getElementById('map');
  const fallbackBanner = document.getElementById('map-fallback');

  if (!mapElement) return;

  // Verifica se a biblioteca Leaflet está disponível
  if (typeof L === 'undefined') {
    if (fallbackBanner) fallbackBanner.style.display = 'block';
    console.info('Leaflet não detectado. A aplicação continuará operando via lista interativa.');
    return;
  }

  try {
    // Ponto central padrão: Vista ampla do Brasil
    AppState.mapa = L.map('map', {
      center: [-15.7801, -47.9292],
      zoom: 4,
      zoomControl: true
    });

    // Camada de azulejos (Tiles) do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(AppState.mapa);

    // Cria o grupo de marcadores para permitir limpeza e ajuste de bordas automático
    AppState.grupoMarcadores = L.featureGroup().addTo(AppState.mapa);

  } catch (erro) {
    console.error('Erro ao instanciar mapa:', erro);
    if (fallbackBanner) fallbackBanner.style.display = 'block';
  }
}

/**
 * Atualiza todos os pinos no mapa de acordo com os pontos filtrados.
 * @param {Array<Object>} pontosFiltrados Lista de pontos visíveis
 */
function atualizarMarcadoresMapa(pontosFiltrados) {
  if (!AppState.mapa || !AppState.grupoMarcadores || typeof L === 'undefined') return;

  AppState.grupoMarcadores.clearLayers();

  pontosFiltrados.forEach(ponto => {
    // Cria ícone personalizado moderno com SVG
    const customIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="
          background: #059669;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: 2px solid white;
          cursor: pointer;
        ">
          ♻️
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marcador = L.marker([ponto.lat, ponto.lng], { icon: customIcon });

    // Monta o popup com informações úteis e botão de rota
    const tagsHtml = ponto.categorias.map(catId => {
      const cat = window.ReciclaBrasilData.CATEGORIAS.find(c => c.id === catId);
      return `<span style="display:inline-block;background:#ecfdf5;color:#047857;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;margin:2px;">${cat ? cat.icone + ' ' + cat.nome : catId}</span>`;
    }).join(' ');

    const popupHtml = `
      <div style="font-family: inherit; min-width: 200px; padding: 4px;">
        <h4 style="margin: 0 0 6px; font-size: 14px; font-weight: 700; color: #0f172a;">${ponto.nome}</h4>
        <p style="margin: 0 0 6px; font-size: 12px; color: #64748b;">📍 ${ponto.endereco}</p>
        <p style="margin: 0 0 8px; font-size: 12px; color: #059669;">⏰ ${ponto.horario || 'Horário comercial'}</p>
        <div style="margin-bottom: 10px;">${tagsHtml}</div>
        <div style="display: flex; gap: 6px;">
          <a href="https://www.google.com/maps/dir/?api=1&destination=${ponto.lat},${ponto.lng}" 
             target="_blank" 
             rel="noopener"
             style="background: #059669; color: white; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; text-decoration: none; text-align: center; flex: 1;">
             Como Chegar ↗
          </a>
        </div>
      </div>
    `;

    marcador.bindPopup(popupHtml);
    marcador.on('click', () => {
      destacarCardNaLista(ponto.id);
    });

    AppState.grupoMarcadores.addLayer(marcador);
  });

  // Ajusta o zoom e a área visível do mapa se houver marcadores
  if (pontosFiltrados.length > 0) {
    try {
      AppState.mapa.fitBounds(AppState.grupoMarcadores.getBounds(), {
        padding: [40, 40],
        maxZoom: 13
      });
    } catch (e) {
      // Caso haja apenas um ponto ou coordenadas idênticas
      if (pontosFiltrados[0]) {
        AppState.mapa.setView([pontosFiltrados[0].lat, pontosFiltrados[0].lng], 13);
      }
    }
  }
}

/**
 * Foca o mapa em um ponto específico e abre seu popup.
 * @param {number} pontoId Identificador do ponto
 */
function focarPontoNoMapa(pontoId) {
  const ponto = AppState.pontos.find(p => p.id === pontoId);
  if (!ponto || !AppState.mapa) return;

  AppState.mapa.flyTo([ponto.lat, ponto.lng], 15, {
    duration: 1.2
  });

  // Encontra o marcador correspondente e abre o popup
  if (AppState.grupoMarcadores) {
    AppState.grupoMarcadores.eachLayer(layer => {
      const latlng = layer.getLatLng();
      if (Math.abs(latlng.lat - ponto.lat) < 0.0001 && Math.abs(latlng.lng - ponto.lng) < 0.0001) {
        layer.openPopup();
      }
    });
  }

  // Rola suavemente até o mapa se estiver em telas menores
  if (window.innerWidth < 1024) {
    const mapaElemento = document.getElementById('map');
    if (mapaElemento) {
      mapaElemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

/* ==========================================================================
   Renderização dos Componentes de Filtro (Chips e Select)
   ========================================================================== */

/**
 * Renderiza os chips de categorias de materiais recicláveis.
 */
function renderizarChipsCategorias() {
  const container = document.getElementById('category-chips');
  if (!container || !window.ReciclaBrasilData) return;

  container.innerHTML = `
    <button class="chip active" data-category="todos">
      <span>🌐</span> Todos os Materiais
    </button>
  `;

  window.ReciclaBrasilData.CATEGORIAS.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.dataset.category = cat.id;
    btn.innerHTML = `<span>${cat.icone}</span> ${cat.nome}`;
    container.appendChild(btn);
  });
}

/**
 * Preenche o seletor de cidades dinamicamente com base nos pontos cadastrados.
 */
function renderizarSelectCidades() {
  const select = document.getElementById('city-select');
  if (!select) return;

  const cidades = [...new Set(AppState.pontos.map(p => extrairCidade(p.endereco)))].filter(Boolean).sort();

  select.innerHTML = '<option value="todas">Todas as Cidades</option>';
  cidades.forEach(cidade => {
    const option = document.createElement('option');
    option.value = cidade;
    option.textContent = cidade;
    select.appendChild(option);
  });
}

/* ==========================================================================
   Filtragem e Renderização da Lista de Pontos
   ========================================================================== */

/**
 * Executa os filtros de busca, categoria e cidade, atualizando lista e mapa.
 */
function filtrarERenderizar() {
  const termo = AppState.termoBusca.toLowerCase().trim();

  const pontosFiltrados = AppState.pontos.filter(ponto => {
    // Filtro 1: Categoria do material
    const atendeCategoria = AppState.categoriaAtiva === 'todos' || 
      (ponto.categorias && ponto.categorias.includes(AppState.categoriaAtiva));

    // Filtro 2: Cidade
    const cidadePonto = extrairCidade(ponto.endereco).toLowerCase();
    const atendeCidade = AppState.cidadeAtiva === 'todas' || 
      cidadePonto.includes(AppState.cidadeAtiva.toLowerCase());

    // Filtro 3: Busca textual (nome ou endereço)
    const atendeBusca = !termo || 
      ponto.nome.toLowerCase().includes(termo) || 
      ponto.endereco.toLowerCase().includes(termo);

    return atendeCategoria && atendeCidade && atendeBusca;
  });

  renderizarListaPontos(pontosFiltrados);
  atualizarMarcadoresMapa(pontosFiltrados);

  // Atualiza contador de resultados
  const contador = document.getElementById('points-count');
  if (contador) contador.textContent = pontosFiltrados.length;
}

/**
 * Constrói os cards HTML para a coluna de pontos.
 * @param {Array<Object>} pontos 
 */
function renderizarListaPontos(pontos) {
  const container = document.getElementById('points-list');
  if (!container) return;

  if (pontos.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: #64748b;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
        <h4 style="font-weight: 700; margin-bottom: 0.25rem;">Nenhum ponto encontrado</h4>
        <p style="font-size: 0.9rem;">Tente ajustar os filtros ou cadastrar um novo ponto de coleta.</p>
        <button class="btn btn-primary btn-sm" onclick="abrirModalCadastro()" style="margin-top: 1rem;">
          + Cadastrar Ponto
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = pontos.map(ponto => {
    // Tags de materiais aceitos
    const tagsHtml = ponto.categorias.map(catId => {
      const cat = window.ReciclaBrasilData.CATEGORIAS.find(c => c.id === catId);
      return `
        <span class="material-tag" title="${cat ? cat.nome : catId}">
          ${cat ? cat.icone : '♻️'} ${cat ? cat.nome : catId}
        </span>
      `;
    }).join('');

    return `
      <article class="point-card" id="point-card-${ponto.id}">
        <div class="point-card-top">
          <h3 class="point-name">${ponto.nome}</h3>
          <div class="point-rating" title="Avaliação dos usuários">
            ⭐ ${ponto.avaliacao ? ponto.avaliacao.toFixed(1) : '5.0'}
          </div>
        </div>

        <p class="point-address">
          <span>📍</span> ${ponto.endereco}
        </p>

        <div class="point-meta">
          <span class="point-meta-item">
            <span>⏰</span> ${ponto.horario || 'Seg–Sáb'}
          </span>
          ${ponto.telefone ? `
            <span class="point-meta-item">
              <span>📞</span> ${ponto.telefone}
            </span>
          ` : ''}
        </div>

        <div class="point-tags">
          ${tagsHtml}
        </div>

        <div class="point-actions">
          <button class="btn btn-primary btn-sm" onclick="focarPontoNoMapa(${ponto.id})">
            <span>🗺️</span> Ver no Mapa
          </button>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${ponto.lat},${ponto.lng}" 
             target="_blank" 
             rel="noopener"
             class="btn btn-outline btn-sm">
            <span>↗</span> Como Chegar
          </a>
        </div>
      </article>
    `;
  }).join('');
}

/**
 * Adiciona um destaque visual temporário ao card do ponto selecionado no mapa.
 * @param {number} pontoId 
 */
function destacarCardNaLista(pontoId) {
  const todosCards = document.querySelectorAll('.point-card');
  todosCards.forEach(c => c.classList.remove('highlighted'));

  const card = document.getElementById(`point-card-${pontoId}`);
  if (card) {
    card.classList.add('highlighted');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/* ==========================================================================
   Calculadora de Impacto Ambiental
   ========================================================================== */

/**
 * Configura os ouvintes de evento para os inputs da calculadora de impacto ecológico.
 */
function configurarCalculadora() {
  const inputs = document.querySelectorAll('.calc-input');
  inputs.forEach(input => {
    input.addEventListener('input', calcularImpactoAmbiental);
  });

  // Executa uma vez com valores padrão
  calcularImpactoAmbiental();
}

/**
 * Calcula o benefício ecológico estimado (Água, CO2, Árvores, Energia)
 * Fórmulas baseadas em médias oficiais de reciclagem (CEMPRE / IPEA).
 */
function calcularImpactoAmbiental() {
  const papelKg = parseFloat(document.getElementById('calc-papel')?.value || 0) || 0;
  const plasticoKg = parseFloat(document.getElementById('calc-plastico')?.value || 0) || 0;
  const vidroKg = parseFloat(document.getElementById('calc-vidro')?.value || 0) || 0;
  const metalKg = parseFloat(document.getElementById('calc-metal')?.value || 0) || 0;

  // 1 tonelada de papel reciclado poupa ~20 árvores e ~26.000 litros de água
  const arvoresSalvas = (papelKg * 0.02);
  const aguaPoupada = (papelKg * 26) + (plasticoKg * 15) + (metalKg * 10);
  // CO2 evitado por kg reciclado
  const co2Evitado = (papelKg * 1.5) + (plasticoKg * 2.0) + (vidroKg * 0.3) + (metalKg * 4.5);
  // Energia elétrica economizada (kWh)
  const energiaPoupada = (plasticoKg * 5.7) + (metalKg * 14.0) + (papelKg * 4.0) + (vidroKg * 1.2);

  // Atualização dos elementos na tela
  const resAgua = document.getElementById('res-agua');
  const resCo2 = document.getElementById('res-co2');
  const resArvores = document.getElementById('res-arvores');
  const resEnergia = document.getElementById('res-energia');

  if (resAgua) resAgua.textContent = Math.round(aguaPoupada).toLocaleString('pt-BR') + ' L';
  if (resCo2) resCo2.textContent = Math.round(co2Evitado).toLocaleString('pt-BR') + ' kg';
  if (resArvores) resArvores.textContent = (arvoresSalvas).toFixed(1) + ' unid.';
  if (resEnergia) resEnergia.textContent = Math.round(energiaPoupada).toLocaleString('pt-BR') + ' kWh';
}

/* ==========================================================================
   Modal de Cadastro de Novo Ponto de Coleta
   ========================================================================== */

/**
 * Abre o modal de cadastro de novo ponto.
 */
function abrirModalCadastro() {
  const modal = document.getElementById('modal-cadastro');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Fecha o modal de cadastro de novo ponto.
 */
function fecharModalCadastro() {
  const modal = document.getElementById('modal-cadastro');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/**
 * Trata o envio do formulário de cadastro de ponto de coleta.
 * @param {Event} e 
 */
function processarCadastroPonto(e) {
  e.preventDefault();

  const form = e.target;
  const nome = form.nome.value.trim();
  const endereco = form.endereco.value.trim();
  const lat = parseFloat(form.lat.value);
  const lng = parseFloat(form.lng.value);
  const horario = form.horario.value.trim();
  const telefone = form.telefone.value.trim();

  // Coleta as categorias marcadas pelos checkboxes
  const checkboxes = form.querySelectorAll('input[name="categorias"]:checked');
  const categorias = Array.from(checkboxes).map(cb => cb.value);

  if (!nome || !endereco || isNaN(lat) || isNaN(lng)) {
    mostrarToast('Preencha os campos obrigatórios corretamente.', 'error');
    return;
  }

  if (categorias.length === 0) {
    mostrarToast('Selecione pelo menos um material aceito.', 'error');
    return;
  }

  // Cria o novo ponto
  const novoPonto = {
    id: Date.now(),
    nome,
    endereco,
    lat,
    lng,
    categorias,
    horario: horario || 'Seg–Sáb 8h–18h',
    telefone: telefone || '',
    avaliacao: 5.0
  };

  // Adiciona ao estado e persiste
  AppState.pontos.unshift(novoPonto);
  salvarPontosNoStorage();

  // Atualiza selects e re-renderiza
  renderizarSelectCidades();
  renderizarEstatisticas();
  filtrarERenderizar();

  fecharModalCadastro();
  form.reset();
  mostrarToast('Ponto de coleta cadastrado com sucesso! 🎉', 'success');

  // Foca no novo ponto no mapa
  focarPontoNoMapa(novoPonto.id);
}

/* ==========================================================================
   Notificações Toast
   ========================================================================== */

/**
 * Exibe um toast flutuante no canto da tela.
 * @param {string} mensagem Texto a ser exibido
 * @param {'success' | 'error' | 'info'} tipo Tipo do alerta
 */
function mostrarToast(mensagem, tipo = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.innerHTML = `
    <span>${tipo === 'success' ? '✔' : tipo === 'error' ? '✖' : 'ℹ'}</span>
    <span>${mensagem}</span>
  `;

  container.appendChild(toast);

  // Remove automaticamente após 3.5 segundos
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ==========================================================================
   Configuração Geral de Ouvintes de Eventos (Listeners)
   ========================================================================== */

/**
 * Registra todos os eventos de interação da página.
 */
function configurarEventos() {
  // 1. Busca textual com debounce
  const inputBusca = document.getElementById('search-input');
  if (inputBusca) {
    let timeoutId;
    inputBusca.addEventListener('input', (e) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        AppState.termoBusca = e.target.value;
        filtrarERenderizar();
      }, 250);
    });
  }

  // 2. Filtro de cidade
  const selectCidade = document.getElementById('city-select');
  if (selectCidade) {
    selectCidade.addEventListener('change', (e) => {
      AppState.cidadeAtiva = e.target.value;
      filtrarERenderizar();
    });
  }

  // 3. Chips de categorias
  const chipsContainer = document.getElementById('category-chips');
  if (chipsContainer) {
    chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;

      chipsContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      AppState.categoriaAtiva = chip.dataset.category;
      filtrarERenderizar();
    });
  }

  // 4. Modos de visualização (Grid / Split / Map)
  const viewBtns = document.querySelectorAll('.view-btn');
  const appGrid = document.querySelector('.app-grid');
  const mapCard = document.querySelector('.map-card');
  const listPane = document.querySelector('.points-list-pane');

  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;
      AppState.modoVisualizacao = mode;

      if (!appGrid || !mapCard || !listPane) return;

      if (mode === 'map') {
        appGrid.style.gridTemplateColumns = '1fr';
        mapCard.style.display = 'block';
        listPane.style.display = 'none';
      } else if (mode === 'list') {
        appGrid.style.gridTemplateColumns = '1fr';
        mapCard.style.display = 'none';
        listPane.style.display = 'flex';
      } else {
        // Modo dividido (Split)
        appGrid.style.gridTemplateColumns = window.innerWidth > 1024 ? '1.15fr 0.85fr' : '1fr';
        mapCard.style.display = 'block';
        listPane.style.display = 'flex';
      }

      // Redesenha o mapa Leaflet para recalcular o tamanho
      if (AppState.mapa) {
        setTimeout(() => AppState.mapa.invalidateSize(), 200);
      }
    });
  });

  // 5. Formulário de cadastro de ponto
  const formCadastro = document.getElementById('form-cadastro-ponto');
  if (formCadastro) {
    formCadastro.addEventListener('submit', processarCadastroPonto);
  }

  // 6. Fechar modal ao clicar fora
  const modal = document.getElementById('modal-cadastro');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) fecharModalCadastro();
    });
  }

  // 7. Menu Mobile
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    // Fecha o menu ao clicar em um link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }
}
