/* ═══════════════════════════════════════════════════════════════
   POWER AUTOMATE FLOWS - SCRIPT
   Sistema de documentação local com CRUD completo
   ═══════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════
// ESTADO GLOBAL
// ═══════════════════════════════════════════════════════════════
let flowsData = {
  flows: [],
  aplicativos: [],
  pipelines: [],
  dashboards: [],
  projetos: [],
  tipos_gatilho: [],
  tipos_aplicativo: [],
  tipos_pipeline: [],
  tipos_dashboard: []
};

let hasUnsavedChanges = false;
let currentEditingFlowId = null;
let currentEditingAppId = null;
let currentEditingPipelineId = null;
let currentEditingDashboardId = null;
let currentTab = 'flows'; // Tab ativa atual

// ═══════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  await loadFlows();
  setupEventListeners();
  setupTabs();
  updateFilterVisibility();
  renderCurrentTab();
  populateFilterDropdowns();
});

// ═══════════════════════════════════════════════════════════════
// CARREGAMENTO DE DADOS
// ═══════════════════════════════════════════════════════════════
async function loadFlows() {
  try {
    // SEMPRE carregar do arquivo JSON primeiro (fonte da verdade)
    const response = await fetch('flows-data.json');
    if (!response.ok) throw new Error('Erro ao carregar JSON');
    flowsData = await response.json();

    // Sincronizar localStorage com o JSON carregado
    saveToLocalStorage();
    console.log('✓ Dados carregados do flows-data.json e sincronizados');
  } catch (error) {
    console.error('Erro ao carregar flows-data.json:', error);

    // Fallback: tentar carregar do localStorage
    const localData = loadFromLocalStorage();
    if (localData) {
      flowsData = localData;
      console.log('⚠️ Usando dados do localStorage (JSON não disponível)');
      showToast('Usando dados salvos localmente', 'error');
    } else {
      // Se tudo falhar, iniciar vazio
      flowsData = { flows: [], projetos: [], tipos_gatilho: [] };
      showToast('Erro ao carregar dados. Iniciando vazio.', 'error');
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// RENDERIZAÇÃO
// ═══════════════════════════════════════════════════════════════
function renderFlows(flowsToRender) {
  const grid = document.getElementById('flowsGrid');

  if (flowsToRender.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-text">Nenhum flow encontrado</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = flowsToRender.map(flow => `
    <div class="flow-card ${flow.status === 'inativo' ? 'inactive' : ''}">
      <div class="card-header">
        <div class="card-title-section">
          <div class="card-title">${flow.nome}</div>
          <div class="card-projeto">${getIcon('folder')} ${flow.projeto}</div>
        </div>
        <div class="card-actions">
          <button class="icon-btn edit" onclick="openEditModal('${flow.id}')" title="Editar">
            ${getIcon('edit')}
          </button>
          <button class="icon-btn delete" onclick="confirmDelete('${flow.id}')" title="Deletar">
            ${getIcon('trash')}
          </button>
        </div>
      </div>

      <span class="badge ${getBadgeClass(flow.gatilho)}">
        ${getBadgeIconSVG(flow.gatilho)} ${flow.gatilho}
      </span>

      <div class="card-descricao">${flow.descricao}</div>

      <div class="card-meta">
        <div>${getIcon('calendar')} Atualizado: ${formatDate(flow.ultima_atualizacao)}</div>
        ${flow.dependencias && flow.dependencias.length > 0 ? `
          <div>
            ${getIcon('link')} Dependências:
            <div class="dependencias">
              ${flow.dependencias.map(depId => {
                const depFlow = flowsData.flows.find(f => f.id === depId);
                return `<span class="dep-badge">${depFlow ? depFlow.nome : depId}</span>`;
              }).join('')}
            </div>
          </div>
        ` : ''}
        <div>
          <span class="status-badge ${flow.status}">${flow.status === 'ativo' ? getIcon('check') : getIcon('x')} ${flow.status}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderApps(appsToRender) {
  const grid = document.getElementById('appsGrid');

  if (appsToRender.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📱</div>
        <div class="empty-state-text">Nenhum aplicativo documentado</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = appsToRender.map(app => `
    <div class="flow-card ${app.status === 'inativo' ? 'inactive' : ''}">
      <div class="card-header">
        <div class="card-title-section">
          <div class="card-title">${app.nome}</div>
          <div class="card-projeto">${getIcon('folder')} ${app.projeto}</div>
        </div>
        <div class="card-actions">
          <button class="icon-btn edit" onclick="openEditModalApp('${app.id}')" title="Editar">
            ${getIcon('edit')}
          </button>
          <button class="icon-btn delete" onclick="confirmDeleteApp('${app.id}')" title="Deletar">
            ${getIcon('trash')}
          </button>
        </div>
      </div>

      <span class="badge scheduled">
        📱 Aplicativo
      </span>

      <div class="card-descricao">${app.descricao}</div>

      <div class="card-meta">
        <div>${getIcon('calendar')} Atualizado: ${formatDate(app.ultima_atualizacao)}</div>
        ${app.link ? `<div>🔗 <a href="${app.link}" target="_blank" style="color: var(--masterboi-red);">Acessar aplicativo</a></div>` : ''}
        <div>
          <span class="status-badge ${app.status}">${app.status === 'ativo' ? getIcon('check') : getIcon('x')} ${app.status}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderPipelines(pipelinesToRender) {
  const grid = document.getElementById('pipelinesGrid');

  if (pipelinesToRender.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔧</div>
        <div class="empty-state-text">Nenhum pipeline documentado</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = pipelinesToRender.map(pipeline => `
    <div class="flow-card ${pipeline.status === 'inativo' ? 'inactive' : ''}">
      <div class="card-header">
        <div class="card-title-section">
          <div class="card-title">${pipeline.nome}</div>
          <div class="card-projeto">${getIcon('folder')} ${pipeline.projeto}</div>
        </div>
        <div class="card-actions">
          <button class="icon-btn edit" onclick="openEditModalPipeline('${pipeline.id}')" title="Editar">
            ${getIcon('edit')}
          </button>
          <button class="icon-btn delete" onclick="confirmDeletePipeline('${pipeline.id}')" title="Deletar">
            ${getIcon('trash')}
          </button>
        </div>
      </div>

      <span class="badge pipeline">
        🔧 Pipeline
      </span>

      <div class="card-descricao">${pipeline.descricao}</div>

      <div class="card-meta">
        <div>${getIcon('calendar')} Atualizado: ${formatDate(pipeline.ultima_atualizacao)}</div>
        ${pipeline.periodicidade ? `<div>⏱️ Periodicidade: ${pipeline.periodicidade}</div>` : ''}
        ${pipeline.repo_link ? `<div>${getIcon('github')} <a href="${pipeline.repo_link}" target="_blank" rel="noopener noreferrer" class="repo-link">Repositório GitHub</a></div>` : ''}
        <div>
          <span class="status-badge ${pipeline.status}">${pipeline.status === 'ativo' ? getIcon('check') : getIcon('x')} ${pipeline.status}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════════════════════
// GERENCIAMENTO DE TABS
// ═══════════════════════════════════════════════════════════════
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
}

function switchTab(tabName) {
  currentTab = tabName;

  // Atualizar tabs ativas
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  // Atualizar conteúdo ativo
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  const tabMap = {
    'flows': 'tabFlows',
    'apps': 'tabApps',
    'pipelines': 'tabPipelines',
    'dashboards': 'tabDashboards',
    'stats': 'tabStats'
  };

  document.getElementById(tabMap[tabName]).classList.add('active');

  // Mostrar/esconder filtro de gatilho baseado na tab
  updateFilterVisibility();

  // Limpar filtros ao trocar de tab
  clearFilters();

  // Renderizar conteúdo da tab
  renderCurrentTab();
}

function updateFilterVisibility() {
  const gatilhoFilterGroup = document.getElementById('gatilhoFilter').closest('.filter-group');

  // Mostrar filtro de gatilho apenas na tab de flows
  if (currentTab === 'flows') {
    gatilhoFilterGroup.style.display = 'flex';
  } else {
    gatilhoFilterGroup.style.display = 'none';
  }
}

function renderCurrentTab() {
  switch (currentTab) {
    case 'flows':
      renderFlows(flowsData.flows);
      updateCounter(flowsData.flows.length, 'flow');
      break;
    case 'apps':
      renderApps(flowsData.aplicativos);
      updateCounter(flowsData.aplicativos.length, 'aplicativo');
      break;
    case 'pipelines':
      renderPipelines(flowsData.pipelines);
      updateCounter(flowsData.pipelines.length, 'pipeline');
      break;
    case 'dashboards':
      renderDashboards(flowsData.dashboards);
      updateCounter(flowsData.dashboards.length, 'dashboard');
      break;
    case 'stats':
      renderStats();
      document.querySelector('.filters').style.display = 'none'; // Esconder filtros na aba de stats
      break;
  }

  // Mostrar filtros em todas as tabs exceto stats
  if (currentTab !== 'stats') {
    document.querySelector('.filters').style.display = 'block';
  }
}

// ═══════════════════════════════════════════════════════════════
// FILTROS
// ═══════════════════════════════════════════════════════════════
function populateFilterDropdowns() {
  const projetoFilter = document.getElementById('projetoFilter');
  const gatilhoFilter = document.getElementById('gatilhoFilter');

  // Usar flowsData.projetos diretamente (lista de todos os projetos cadastrados)
  const projetos = flowsData.projetos || [];
  projetoFilter.innerHTML = '<option value="">Todos os projetos</option>' +
    projetos.map(p => `<option value="${p}">${p}</option>`).join('');

  // Usar flowsData.tipos_gatilho diretamente
  const gatilhos = flowsData.tipos_gatilho || [];
  gatilhoFilter.innerHTML = '<option value="">Todos os gatilhos</option>' +
    gatilhos.map(g => `<option value="${g}">${g}</option>`).join('');
}

function applyFilters() {
  const projeto = document.getElementById('projetoFilter').value;
  const gatilho = document.getElementById('gatilhoFilter').value;
  const busca = document.getElementById('searchInput').value.toLowerCase();

  let filtered;
  let type;

  // Filtrar baseado na tab ativa
  switch (currentTab) {
    case 'flows':
      filtered = flowsData.flows;
      type = 'flow';

      // Filtro por projeto
      if (projeto) {
        filtered = filtered.filter(f => f.projeto === projeto);
      }

      // Filtro por gatilho (apenas para flows)
      if (gatilho) {
        filtered = filtered.filter(f => f.gatilho === gatilho);
      }

      // Busca textual
      if (busca) {
        filtered = filtered.filter(f =>
          f.nome.toLowerCase().includes(busca) ||
          f.descricao.toLowerCase().includes(busca) ||
          f.projeto.toLowerCase().includes(busca)
        );
      }

      renderFlows(filtered);
      break;

    case 'apps':
      filtered = flowsData.aplicativos;
      type = 'aplicativo';

      // Filtro por projeto
      if (projeto) {
        filtered = filtered.filter(a => a.projeto === projeto);
      }

      // Busca textual
      if (busca) {
        filtered = filtered.filter(a =>
          a.nome.toLowerCase().includes(busca) ||
          a.descricao.toLowerCase().includes(busca) ||
          a.projeto.toLowerCase().includes(busca)
        );
      }

      renderApps(filtered);
      break;

    case 'pipelines':
      filtered = flowsData.pipelines;
      type = 'pipeline';

      // Filtro por projeto
      if (projeto) {
        filtered = filtered.filter(p => p.projeto === projeto);
      }

      // Busca textual
      if (busca) {
        filtered = filtered.filter(p =>
          p.nome.toLowerCase().includes(busca) ||
          p.descricao.toLowerCase().includes(busca) ||
          p.projeto.toLowerCase().includes(busca)
        );
      }

      renderPipelines(filtered);
      break;

    case 'dashboards':
      filtered = flowsData.dashboards;
      type = 'dashboard';

      // Filtro por projeto
      if (projeto) {
        filtered = filtered.filter(d => d.projeto === projeto);
      }

      // Busca textual
      if (busca) {
        filtered = filtered.filter(d =>
          d.nome.toLowerCase().includes(busca) ||
          d.descricao.toLowerCase().includes(busca) ||
          d.projeto.toLowerCase().includes(busca) ||
          d.tipo.toLowerCase().includes(busca)
        );
      }

      renderDashboards(filtered);
      break;

    case 'stats':
      renderStats();
      return; // Não precisa de contador na aba de stats
  }

  updateCounter(filtered.length, type);
}

function clearFilters() {
  document.getElementById('projetoFilter').value = '';
  document.getElementById('gatilhoFilter').value = '';
  document.getElementById('searchInput').value = '';
  applyFilters();
}

function updateCounter(count, type = 'item') {
  const counter = document.getElementById('counter');
  const typeMap = {
    'flow': 'flow',
    'aplicativo': 'aplicativo',
    'pipeline': 'pipeline',
    'dashboard': 'dashboard',
    'item': 'item'
  };

  const typeName = typeMap[type] || 'item';
  const plural = count !== 1 ? 's' : '';
  counter.textContent = `${count} ${typeName}${plural} encontrado${plural}`;
}

// ═══════════════════════════════════════════════════════════════
// MODAL - ADICIONAR/EDITAR
// ═══════════════════════════════════════════════════════════════
function openAddModal() {
  currentEditingFlowId = null;
  document.getElementById('modalTitle').textContent = 'Adicionar Novo Flow';
  document.getElementById('flowForm').reset();

  // Popular dropdowns do modal
  populateModalDropdowns();

  // Limpar dependências
  document.querySelectorAll('.checkbox-option input').forEach(cb => cb.checked = false);

  document.getElementById('modalOverlay').classList.add('active');
}

function openEditModal(flowId) {
  currentEditingFlowId = flowId;
  const flow = flowsData.flows.find(f => f.id === flowId);

  if (!flow) {
    showToast('Flow não encontrado!', 'error');
    return;
  }

  document.getElementById('modalTitle').textContent = 'Editar Flow';

  // Preencher formulário
  document.getElementById('flowNome').value = flow.nome;
  document.getElementById('flowProjeto').value = flow.projeto;
  document.getElementById('flowGatilho').value = flow.gatilho;
  document.getElementById('flowDescricao').value = flow.descricao;
  document.querySelector(`input[name="status"][value="${flow.status}"]`).checked = true;

  // Popular dropdowns
  populateModalDropdowns(flow.id);

  // Marcar dependências
  flow.dependencias.forEach(depId => {
    const checkbox = document.getElementById(`dep-${depId}`);
    if (checkbox) checkbox.checked = true;
  });

  document.getElementById('modalOverlay').classList.add('active');
}

function populateModalDropdowns(excludeFlowId = null) {
  // Popular dropdown de projeto - USAR flowsData.projetos diretamente
  const projetoSelect = document.getElementById('flowProjeto');

  if (flowsData.projetos && flowsData.projetos.length > 0) {
    projetoSelect.innerHTML = flowsData.projetos.map(p =>
      `<option value="${p}">${p}</option>`
    ).join('') + '<option value="__novo__">➕ Novo projeto...</option>';
  } else {
    projetoSelect.innerHTML = '<option value="__novo__">➕ Novo projeto...</option>';
  }

  // Popular dropdown de gatilho - USAR flowsData.tipos_gatilho diretamente
  const gatilhoSelect = document.getElementById('flowGatilho');

  if (flowsData.tipos_gatilho && flowsData.tipos_gatilho.length > 0) {
    gatilhoSelect.innerHTML = flowsData.tipos_gatilho.map(g =>
      `<option value="${g}">${g}</option>`
    ).join('');
  } else {
    gatilhoSelect.innerHTML = '<option value="">Sem tipos cadastrados</option>';
  }

  // Popular multi-select de dependências
  const depsContainer = document.getElementById('dependenciasContainer');
  const availableFlows = flowsData.flows.filter(f => f.id !== excludeFlowId);

  if (availableFlows.length > 0) {
    depsContainer.innerHTML = availableFlows.map(f => `
      <div class="checkbox-option">
        <input type="checkbox" id="dep-${f.id}" value="${f.id}">
        <label for="dep-${f.id}">${f.nome}</label>
      </div>
    `).join('');
  } else {
    depsContainer.innerHTML = '<div class="empty-config-list">Nenhum flow disponível</div>';
  }
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.getElementById('flowForm').reset();
  document.getElementById('newProjetoInput').classList.remove('visible');
  currentEditingFlowId = null;
}

// ═══════════════════════════════════════════════════════════════
// CRUD - CREATE / UPDATE / DELETE
// ═══════════════════════════════════════════════════════════════
function saveFlow() {
  // Validação
  const nome = document.getElementById('flowNome').value.trim();
  const descricao = document.getElementById('flowDescricao').value.trim();

  if (!nome) {
    showToast('O nome do flow é obrigatório!', 'error');
    return;
  }

  // Coletar dados do formulário
  let projeto = document.getElementById('flowProjeto').value;

  // Verificar se é novo projeto
  if (projeto === '__novo__') {
    const novoProjeto = document.getElementById('newProjetoNome').value.trim();
    if (!novoProjeto) {
      showToast('Digite o nome do novo projeto!', 'error');
      return;
    }
    projeto = novoProjeto;
  }

  const gatilho = document.getElementById('flowGatilho').value;
  const status = document.querySelector('input[name="status"]:checked').value;

  // Coletar dependências selecionadas
  const dependencias = Array.from(document.querySelectorAll('.checkbox-option input:checked'))
    .map(cb => cb.value);

  const flowData = {
    nome,
    projeto,
    gatilho,
    descricao,
    status,
    dependencias,
    ultima_atualizacao: getCurrentDate()
  };

  if (currentEditingFlowId) {
    // EDITAR flow existente
    const index = flowsData.flows.findIndex(f => f.id === currentEditingFlowId);
    flowsData.flows[index] = {
      ...flowsData.flows[index],
      ...flowData
    };
    showToast('Flow atualizado com sucesso! ✓');
  } else {
    // ADICIONAR novo flow
    const newFlow = {
      id: generateUniqueId(),
      ...flowData
    };
    flowsData.flows.push(newFlow);
    showToast('Flow adicionado com sucesso! ✓');
  }

  // Atualizar estado
  markAsUnsaved();
  saveToLocalStorage();

  // Re-renderizar
  applyFilters();
  populateFilterDropdowns();
  closeModal();
}

async function confirmDelete(flowId) {
  const flow = flowsData.flows.find(f => f.id === flowId);

  if (!flow) return;

  const confirmed = await showConfirm(
    'Deletar Flow',
    `Tem certeza que deseja deletar o flow "${flow.nome}"? Esta ação não pode ser desfeita.`
  );

  if (confirmed) {
    deleteFlow(flowId);
  }
}

async function deleteFlow(flowId) {
  // Verificar se algum flow depende deste
  const dependentFlows = flowsData.flows.filter(f =>
    f.dependencias && f.dependencias.includes(flowId)
  );

  if (dependentFlows.length > 0) {
    const names = dependentFlows.map(f => f.nome).join(', ');
    const confirmed = await showConfirm(
      'Atenção: Flows Dependentes',
      `Os seguintes flows dependem deste: ${names}. Deseja continuar mesmo assim?`
    );
    if (!confirmed) return;

    // Remover a dependência dos flows dependentes
    dependentFlows.forEach(f => {
      f.dependencias = f.dependencias.filter(d => d !== flowId);
    });
  }

  // Remover o flow
  flowsData.flows = flowsData.flows.filter(f => f.id !== flowId);

  // Atualizar estado
  markAsUnsaved();
  saveToLocalStorage();

  // Re-renderizar
  applyFilters();
  populateFilterDropdowns();

  showToast('Flow deletado com sucesso! ✓');
}

// ═══════════════════════════════════════════════════════════════
// PERSISTÊNCIA - LOCALSTORAGE E EXPORTAÇÃO
// ═══════════════════════════════════════════════════════════════
function saveToLocalStorage() {
  try {
    localStorage.setItem('powerAutomate_flows', JSON.stringify(flowsData));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
}

function loadFromLocalStorage() {
  try {
    const data = localStorage.getItem('powerAutomate_flows');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erro ao carregar do localStorage:', error);
    return null;
  }
}

function markAsUnsaved() {
  hasUnsavedChanges = true;
  document.getElementById('unsavedIndicator').classList.add('visible');
}

function exportJSON() {
  const dataStr = JSON.stringify(flowsData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `flows-data-${getCurrentDate()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Marcar como salvo
  hasUnsavedChanges = false;
  document.getElementById('unsavedIndicator').classList.remove('visible');

  showToast('JSON exportado com sucesso! ✓');
}

async function saveDirectJSON() {
  try {
    // Preparar os dados
    const dataStr = JSON.stringify(flowsData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });

    // Usar File System Access API (navegadores modernos)
    if ('showSaveFilePicker' in window) {
      const options = {
        suggestedName: 'flows-data.json',
        types: [{
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] }
        }]
      };

      const handle = await window.showSaveFilePicker(options);
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();

      // Marcar como salvo
      hasUnsavedChanges = false;
      document.getElementById('unsavedIndicator').classList.remove('visible');

      showToast('Arquivo salvo com sucesso! Recarregue a página (F5) para sincronizar. ✓');
    } else {
      // Fallback para navegadores antigos (igual ao exportJSON)
      showToast('Seu navegador não suporta salvar direto. Use "Exportar JSON" e substitua manualmente.', 'error');
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Erro ao salvar arquivo:', error);
      showToast('Erro ao salvar arquivo. Use "Exportar JSON" como alternativa.', 'error');
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// MODAL DE CONFIRMAÇÃO CUSTOMIZADO
// ═══════════════════════════════════════════════════════════════
let confirmResolve = null;

function showConfirm(title, message) {
  return new Promise((resolve) => {
    confirmResolve = resolve;

    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmModalOverlay').classList.add('active');
  });
}

function handleConfirmOk() {
  document.getElementById('confirmModalOverlay').classList.remove('active');
  if (confirmResolve) {
    confirmResolve(true);
    confirmResolve = null;
  }
}

function handleConfirmCancel() {
  document.getElementById('confirmModalOverlay').classList.remove('active');
  if (confirmResolve) {
    confirmResolve(false);
    confirmResolve = null;
  }
}

// ═══════════════════════════════════════════════════════════════
// ÍCONES SVG (FEATHER ICONS)
// ═══════════════════════════════════════════════════════════════
const icons = {
  folder: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',

  calendar: '<svg class="icon-svg" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',

  link: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',

  edit: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',

  trash: '<svg class="icon-svg" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',

  clock: '<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',

  hand: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path></svg>',

  globe: '<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',

  phone: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',

  repeat: '<svg class="icon-svg" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>',

  zap: '<svg class="icon-svg" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',

  settings: '<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m5.7-13.7-4.2 4.2m0 6.3-4.2 4.2m13.7-5.7h-6m-6.3 0h-6m13.7-5.7-4.2-4.2m0-6.3-4.2-4.2"></path></svg>',

  download: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',

  plus: '<svg class="icon-svg" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',

  check: '<svg class="icon-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>',

  x: '<svg class="icon-svg" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',

  alertCircle: '<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',

  github: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>',

  'bar-chart': '<svg class="icon-svg" viewBox="0 0 24 24"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>'
};

function getIcon(name) {
  return icons[name] || '';
}

// ═══════════════════════════════════════════════════════════════
// UTILITÁRIOS
// ═══════════════════════════════════════════════════════════════
function generateUniqueId(prefix = 'flow') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${random}`;
}

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function getBadgeClass(gatilho) {
  const map = {
    'Scheduled': 'scheduled',
    'Manual': 'manual',
    'HTTP Request': 'http',
    'Chamável': 'chamavel',
    'Pipeline': 'pipeline'
  };
  return map[gatilho] || 'scheduled';
}

function getBadgeIcon(gatilho) {
  const map = {
    'Scheduled': '⏰',
    'Manual': '👆',
    'HTTP Request': '🌐',
    'Chamável': '📞',
    'Pipeline': '🔄',
    'Agendado': '⏰',
    'Webhook': '🌐'
  };
  return map[gatilho] || '📋';
}

function getBadgeIconSVG(gatilho) {
  const map = {
    'Scheduled': getIcon('clock'),
    'Manual': getIcon('hand'),
    'HTTP Request': getIcon('globe'),
    'Chamável': getIcon('phone'),
    'Pipeline': getIcon('repeat'),
    'Agendado': getIcon('clock'),
    'Webhook': getIcon('globe')
  };
  return map[gatilho] || getIcon('zap');
}

// Funções para Aplicativos
function getBadgeClassApp(tipo) {
  const map = {
    'Power Apps': 'scheduled',
    'Python Script': 'manual',
    'Power BI': 'http',
    'Web App': 'chamavel'
  };
  return map[tipo] || 'scheduled';
}

function getBadgeIconApp(tipo) {
  const map = {
    'Power Apps': '📱',
    'Python Script': '🐍',
    'Power BI': '📊',
    'Web App': '🌐'
  };
  return map[tipo] || '💻';
}

// Funções para Pipelines
function getBadgeClassPipeline(tipo) {
  const map = {
    'ETL': 'scheduled',
    'Integração SAP': 'manual',
    'Processamento Batch': 'http',
    'Real-time': 'pipeline'
  };
  return map[tipo] || 'scheduled';
}

function getBadgeIconPipeline(tipo) {
  const map = {
    'ETL': '🔄',
    'Integração SAP': '💼',
    'Processamento Batch': '📦',
    'Real-time': '⚡'
  };
  return map[tipo] || '🔧';
}

// Funções para Dashboards
function getDashboardBadgeClass(tipo) {
  const map = {
    'Power BI': 'badge-powerbi',
    'Excel Dashboard': 'badge-excel',
    'Relatório SAP': 'badge-sap',
    'Google Data Studio': 'badge-datastudio',
    'Tableau': 'badge-tableau'
  };
  return map[tipo] || 'badge-powerbi';
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast visible ${type}`;

  setTimeout(() => {
    toast.classList.remove('visible');
  }, 3000);
}

// ═══════════════════════════════════════════════════════════════
// MODAL DE CONFIGURAÇÕES
// ═══════════════════════════════════════════════════════════════
function openConfigModal() {
  renderConfigLists();
  document.getElementById('configModalOverlay').classList.add('active');
}

function closeConfigModal() {
  document.getElementById('configModalOverlay').classList.remove('active');
  document.getElementById('newProjetoConfigInput').value = '';
  document.getElementById('newGatilhoConfigInput').value = '';
}

function renderConfigLists() {
  renderProjetosList();
  renderGatilhosList();
}

function renderProjetosList() {
  const list = document.getElementById('projetosList');

  if (flowsData.projetos.length === 0) {
    list.innerHTML = '<li class="empty-config-list">Nenhum projeto cadastrado</li>';
    return;
  }

  list.innerHTML = flowsData.projetos.map(projeto => {
    const usageCount = flowsData.flows.filter(f => f.projeto === projeto).length;
    const inUse = usageCount > 0;

    return `
      <li class="config-list-item ${inUse ? 'in-use' : ''}">
        <span class="config-item-text">${projeto}</span>
        <div class="config-item-actions">
          ${inUse ? `<span class="config-item-badge">${usageCount} flow${usageCount > 1 ? 's' : ''}</span>` : ''}
          <button
            class="config-delete-btn"
            onclick="deleteProjeto('${projeto}')"
            ${inUse ? 'disabled title="Não pode deletar: projeto em uso"' : 'title="Deletar projeto"'}
          >
            🗑️
          </button>
        </div>
      </li>
    `;
  }).join('');
}

function renderGatilhosList() {
  const list = document.getElementById('gatilhosList');

  if (flowsData.tipos_gatilho.length === 0) {
    list.innerHTML = '<li class="empty-config-list">Nenhum tipo de gatilho cadastrado</li>';
    return;
  }

  list.innerHTML = flowsData.tipos_gatilho.map(gatilho => {
    const usageCount = flowsData.flows.filter(f => f.gatilho === gatilho).length;
    const inUse = usageCount > 0;

    return `
      <li class="config-list-item ${inUse ? 'in-use' : ''}">
        <span class="config-item-text">${getBadgeIcon(gatilho)} ${gatilho}</span>
        <div class="config-item-actions">
          ${inUse ? `<span class="config-item-badge">${usageCount} flow${usageCount > 1 ? 's' : ''}</span>` : ''}
          <button
            class="config-delete-btn"
            onclick="deleteGatilho('${gatilho}')"
            ${inUse ? 'disabled title="Não pode deletar: tipo em uso"' : 'title="Deletar tipo de gatilho"'}
          >
            🗑️
          </button>
        </div>
      </li>
    `;
  }).join('');
}

function addProjeto() {
  const input = document.getElementById('newProjetoConfigInput');
  const nome = input.value.trim();

  if (!nome) {
    showToast('Digite o nome do projeto!', 'error');
    return;
  }

  if (flowsData.projetos.includes(nome)) {
    showToast('Este projeto já existe!', 'error');
    return;
  }

  flowsData.projetos.push(nome);
  flowsData.projetos.sort();

  markAsUnsaved();
  saveToLocalStorage();
  renderConfigLists();
  populateFilterDropdowns();

  input.value = '';
  showToast('Projeto adicionado com sucesso! ✓');
}

async function deleteProjeto(projeto) {
  const usageCount = flowsData.flows.filter(f => f.projeto === projeto).length;

  if (usageCount > 0) {
    showToast('Não é possível deletar: projeto em uso!', 'error');
    return;
  }

  const confirmed = await showConfirm(
    'Deletar Projeto',
    `Tem certeza que deseja deletar o projeto "${projeto}"?`
  );

  if (confirmed) {
    flowsData.projetos = flowsData.projetos.filter(p => p !== projeto);

    markAsUnsaved();
    saveToLocalStorage();
    renderConfigLists();
    populateFilterDropdowns();

    showToast('Projeto deletado com sucesso! ✓');
  }
}

function addGatilho() {
  const input = document.getElementById('newGatilhoConfigInput');
  const nome = input.value.trim();

  if (!nome) {
    showToast('Digite o nome do tipo de gatilho!', 'error');
    return;
  }

  if (flowsData.tipos_gatilho.includes(nome)) {
    showToast('Este tipo de gatilho já existe!', 'error');
    return;
  }

  flowsData.tipos_gatilho.push(nome);

  markAsUnsaved();
  saveToLocalStorage();
  renderConfigLists();
  populateFilterDropdowns();

  input.value = '';
  showToast('Tipo de gatilho adicionado com sucesso! ✓');
}

async function deleteGatilho(gatilho) {
  const usageCount = flowsData.flows.filter(f => f.gatilho === gatilho).length;

  if (usageCount > 0) {
    showToast('Não é possível deletar: tipo em uso!', 'error');
    return;
  }

  const confirmed = await showConfirm(
    'Deletar Tipo de Gatilho',
    `Tem certeza que deseja deletar o tipo de gatilho "${gatilho}"?`
  );

  if (confirmed) {
    flowsData.tipos_gatilho = flowsData.tipos_gatilho.filter(g => g !== gatilho);

    markAsUnsaved();
    saveToLocalStorage();
    renderConfigLists();
    populateFilterDropdowns();

    showToast('Tipo de gatilho deletado com sucesso! ✓');
  }
}

async function clearCache() {
  const confirmed = await showConfirm(
    'Limpar Cache',
    'Isso vai limpar o cache local e recarregar os dados do arquivo flows-data.json. ATENÇÃO: Se você tiver alterações não exportadas, elas serão perdidas!'
  );

  if (confirmed) {
    localStorage.removeItem('powerAutomate_flows');
    showToast('Cache limpo! Recarregando página...', 'success');

    setTimeout(() => {
      location.reload();
    }, 1500);
  }
}

// ═══════════════════════════════════════════════════════════════
// CRUD - APLICATIVOS
// ═══════════════════════════════════════════════════════════════
function openAddModalApp() {
  currentEditingAppId = null;
  document.getElementById('modalAppTitle').textContent = 'Adicionar Novo Aplicativo';
  document.getElementById('appForm').reset();
  populateAppDropdowns();
  document.getElementById('modalAppOverlay').classList.add('active');
}

function openEditModalApp(appId) {
  currentEditingAppId = appId;
  const app = flowsData.aplicativos.find(a => a.id === appId);

  if (!app) {
    showToast('Aplicativo não encontrado!', 'error');
    return;
  }

  document.getElementById('modalAppTitle').textContent = 'Editar Aplicativo';
  document.getElementById('appNome').value = app.nome;
  document.getElementById('appProjeto').value = app.projeto;
  document.getElementById('appLink').value = app.link || '';
  document.getElementById('appDescricao').value = app.descricao;
  document.querySelector(`input[name="appStatus"][value="${app.status}"]`).checked = true;

  populateAppDropdowns();
  document.getElementById('modalAppOverlay').classList.add('active');
}

function populateAppDropdowns() {
  const projetoSelect = document.getElementById('appProjeto');

  if (flowsData.projetos && flowsData.projetos.length > 0) {
    projetoSelect.innerHTML = '<option value="">Selecione um projeto</option>' +
      flowsData.projetos.map(p => `<option value="${p}">${p}</option>`).join('');
  } else {
    projetoSelect.innerHTML = '<option value="">Nenhum projeto cadastrado</option>';
  }
}

function closeModalApp() {
  document.getElementById('modalAppOverlay').classList.remove('active');
  document.getElementById('appForm').reset();
  currentEditingAppId = null;
}

function saveApp() {
  // Validação
  const nome = document.getElementById('appNome').value.trim();
  const descricao = document.getElementById('appDescricao').value.trim();

  if (!nome) {
    showToast('O nome do aplicativo é obrigatório!', 'error');
    return;
  }

  // Coletar dados do formulário
  const projeto = document.getElementById('appProjeto').value;
  const link = document.getElementById('appLink').value.trim();
  const status = document.querySelector('input[name="appStatus"]:checked').value;

  const appData = {
    nome,
    projeto,
    link,
    descricao,
    status,
    ultima_atualizacao: getCurrentDate()
  };

  if (currentEditingAppId) {
    // EDITAR aplicativo existente
    const index = flowsData.aplicativos.findIndex(a => a.id === currentEditingAppId);
    flowsData.aplicativos[index] = {
      ...flowsData.aplicativos[index],
      ...appData
    };
    showToast('Aplicativo atualizado com sucesso! ✓');
  } else {
    // ADICIONAR novo aplicativo
    const newApp = {
      id: generateUniqueId('app'),
      ...appData
    };
    flowsData.aplicativos.push(newApp);
    showToast('Aplicativo adicionado com sucesso! ✓');
  }

  // Atualizar estado
  markAsUnsaved();
  saveToLocalStorage();

  // Re-renderizar
  applyFilters();
  populateFilterDropdowns();
  closeModalApp();
}

async function confirmDeleteApp(appId) {
  const app = flowsData.aplicativos.find(a => a.id === appId);

  if (!app) return;

  const confirmed = await showConfirm(
    'Deletar Aplicativo',
    `Tem certeza que deseja deletar o aplicativo "${app.nome}"? Esta ação não pode ser desfeita.`
  );

  if (confirmed) {
    flowsData.aplicativos = flowsData.aplicativos.filter(a => a.id !== appId);
    markAsUnsaved();
    saveToLocalStorage();
    renderCurrentTab();
    showToast('Aplicativo deletado com sucesso! ✓');
  }
}

// ═══════════════════════════════════════════════════════════════
// CRUD - PIPELINES
// ═══════════════════════════════════════════════════════════════
function openAddModalPipeline() {
  currentEditingPipelineId = null;
  document.getElementById('modalPipelineTitle').textContent = 'Adicionar Novo Pipeline';
  document.getElementById('pipelineForm').reset();
  populatePipelineDropdowns();
  document.getElementById('modalPipelineOverlay').classList.add('active');
}

function openEditModalPipeline(pipelineId) {
  currentEditingPipelineId = pipelineId;
  const pipeline = flowsData.pipelines.find(p => p.id === pipelineId);

  if (!pipeline) {
    showToast('Pipeline não encontrado!', 'error');
    return;
  }

  document.getElementById('modalPipelineTitle').textContent = 'Editar Pipeline';
  document.getElementById('pipelineNome').value = pipeline.nome;
  document.getElementById('pipelineProjeto').value = pipeline.projeto;
  document.getElementById('pipelinePeriodicidade').value = pipeline.periodicidade;
  document.getElementById('pipelineRepoLink').value = pipeline.repo_link || '';
  document.getElementById('pipelineDescricao').value = pipeline.descricao;
  document.querySelector(`input[name="pipelineStatus"][value="${pipeline.status}"]`).checked = true;

  populatePipelineDropdowns();
  document.getElementById('modalPipelineOverlay').classList.add('active');
}

function populatePipelineDropdowns() {
  const projetoSelect = document.getElementById('pipelineProjeto');

  if (flowsData.projetos && flowsData.projetos.length > 0) {
    projetoSelect.innerHTML = '<option value="">Selecione um projeto</option>' +
      flowsData.projetos.map(p => `<option value="${p}">${p}</option>`).join('');
  } else {
    projetoSelect.innerHTML = '<option value="">Nenhum projeto cadastrado</option>';
  }
}

function closeModalPipeline() {
  document.getElementById('modalPipelineOverlay').classList.remove('active');
  document.getElementById('pipelineForm').reset();
  currentEditingPipelineId = null;
}

function savePipeline() {
  // Validação
  const nome = document.getElementById('pipelineNome').value.trim();
  const descricao = document.getElementById('pipelineDescricao').value.trim();

  if (!nome) {
    showToast('O nome do pipeline é obrigatório!', 'error');
    return;
  }

  // Coletar dados do formulário
  const projeto = document.getElementById('pipelineProjeto').value;
  const periodicidade = document.getElementById('pipelinePeriodicidade').value.trim();
  const repoLink = document.getElementById('pipelineRepoLink').value.trim();
  const status = document.querySelector('input[name="pipelineStatus"]:checked').value;

  const pipelineData = {
    nome,
    projeto,
    periodicidade,
    descricao,
    status,
    repo_link: repoLink,
    ultima_atualizacao: getCurrentDate()
  };

  if (currentEditingPipelineId) {
    // EDITAR pipeline existente
    const index = flowsData.pipelines.findIndex(p => p.id === currentEditingPipelineId);
    flowsData.pipelines[index] = {
      ...flowsData.pipelines[index],
      ...pipelineData
    };
    showToast('Pipeline atualizado com sucesso! ✓');
  } else {
    // ADICIONAR novo pipeline
    const newPipeline = {
      id: generateUniqueId('pipe'),
      ...pipelineData
    };
    flowsData.pipelines.push(newPipeline);
    showToast('Pipeline adicionado com sucesso! ✓');
  }

  // Atualizar estado
  markAsUnsaved();
  saveToLocalStorage();

  // Re-renderizar
  applyFilters();
  populateFilterDropdowns();
  closeModalPipeline();
}

async function confirmDeletePipeline(pipelineId) {
  const pipeline = flowsData.pipelines.find(p => p.id === pipelineId);

  if (!pipeline) return;

  const confirmed = await showConfirm(
    'Deletar Pipeline',
    `Tem certeza que deseja deletar o pipeline "${pipeline.nome}"? Esta ação não pode ser desfeita.`
  );

  if (confirmed) {
    flowsData.pipelines = flowsData.pipelines.filter(p => p.id !== pipelineId);
    markAsUnsaved();
    saveToLocalStorage();
    renderCurrentTab();
    showToast('Pipeline deletado com sucesso! ✓');
  }
}

// ═══════════════════════════════════════════════════════════════
// RENDERIZAÇÃO - DASHBOARDS
// ═══════════════════════════════════════════════════════════════
function renderDashboards(dashboardsToRender) {
  const grid = document.getElementById('dashboardsGrid');

  if (dashboardsToRender.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-text">Nenhum dashboard encontrado</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = dashboardsToRender.map(dashboard => `
    <div class="flow-card ${dashboard.status === 'inativo' ? 'inactive' : ''}">
      <div class="card-header">
        <div class="card-title-section">
          <div class="card-title">${dashboard.nome}</div>
          <div class="card-projeto">${getIcon('folder')} ${dashboard.projeto || 'Sem projeto'}</div>
        </div>
        <div class="card-actions">
          <button class="icon-btn edit" onclick="openEditModalDashboard('${dashboard.id}')" title="Editar">
            ${getIcon('edit')}
          </button>
          <button class="icon-btn delete" onclick="confirmDeleteDashboard('${dashboard.id}')" title="Deletar">
            ${getIcon('trash')}
          </button>
        </div>
      </div>

      <span class="badge ${getDashboardBadgeClass(dashboard.tipo)}">
        ${getIcon('bar-chart')} ${dashboard.tipo || 'Sem tipo'}
      </span>

      <div class="card-content">
        ${dashboard.link ? `<div>${getIcon('external-link')} <a href="${dashboard.link}" target="_blank" class="dashboard-link">Acessar dashboard</a></div>` : ''}
        ${dashboard.frequencia ? `<div>${getIcon('clock')} Atualização: ${dashboard.frequencia}</div>` : ''}
        <div class="card-descricao">${dashboard.descricao}</div>
      </div>

      <div class="card-meta">
        <div>${getIcon('calendar')} Atualizado: ${formatDate(dashboard.ultima_atualizacao)}</div>
        <div>
          <span class="status-badge ${dashboard.status}">${dashboard.status === 'ativo' ? getIcon('check') : getIcon('x')} ${dashboard.status}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════════════════════
// RENDERIZAÇÃO - ESTATÍSTICAS
// ═══════════════════════════════════════════════════════════════
function renderStats() {
  const container = document.querySelector('.stats-container');

  const totalFlows = flowsData.flows.length;
  const flowsAtivos = flowsData.flows.filter(f => f.status === 'ativo').length;
  const flowsInativos = flowsData.flows.filter(f => f.status === 'inativo').length;

  const totalApps = flowsData.aplicativos.length;
  const appsAtivos = flowsData.aplicativos.filter(a => a.status === 'ativo').length;

  const totalPipelines = flowsData.pipelines.length;
  const pipelinesAtivos = flowsData.pipelines.filter(p => p.status === 'ativo').length;

  const totalDashboards = flowsData.dashboards.length;
  const dashboardsAtivos = flowsData.dashboards.filter(d => d.status === 'ativo').length;

  const totalProjetos = flowsData.projetos.length;
  const totalItens = totalFlows + totalApps + totalPipelines + totalDashboards;
  const totalAtivos = flowsAtivos + appsAtivos + pipelinesAtivos + dashboardsAtivos;
  const percentualAtivos = totalItens > 0 ? Math.round((totalAtivos / totalItens) * 100) : 0;

  // Contar por projeto
  const itensPorProjeto = {};
  flowsData.projetos.forEach(projeto => {
    itensPorProjeto[projeto] = {
      flows: flowsData.flows.filter(f => f.projeto === projeto).length,
      apps: flowsData.aplicativos.filter(a => a.projeto === projeto).length,
      pipelines: flowsData.pipelines.filter(p => p.projeto === projeto).length,
      dashboards: flowsData.dashboards.filter(d => d.projeto === projeto).length
    };
  });

  // Encontrar projeto com mais itens
  const projetoMaisItens = flowsData.projetos.reduce((max, projeto) => {
    const total = itensPorProjeto[projeto].flows + itensPorProjeto[projeto].apps +
                  itensPorProjeto[projeto].pipelines + itensPorProjeto[projeto].dashboards;
    const maxTotal = itensPorProjeto[max].flows + itensPorProjeto[max].apps +
                     itensPorProjeto[max].pipelines + itensPorProjeto[max].dashboards;
    return total > maxTotal ? projeto : max;
  }, flowsData.projetos[0]);

  container.innerHTML = `
    <div class="stats-hero">
      <h1>Dashboard de Estatísticas</h1>
      <p>Visão completa da documentação técnica da Auditoria Interna</p>
    </div>

    <!-- Cards Principais -->
    <div class="stats-primary-grid">
      <div class="stats-big-card">
        <div class="stats-big-number">${totalItens}</div>
        <div class="stats-big-label">Total de Itens Documentados</div>
        <div class="stats-big-meta">${totalAtivos} ativos (${percentualAtivos}%)</div>
      </div>

      <div class="stats-big-card stats-card-accent">
        <div class="stats-big-number">${totalProjetos}</div>
        <div class="stats-big-label">Projetos Ativos</div>
        <div class="stats-big-meta">Maior: ${projetoMaisItens}</div>
      </div>
    </div>

    <!-- Cards de Métricas por Tipo -->
    <div class="stats-metrics-section">
      <h2>Métricas por Tipo</h2>
      <div class="stats-metrics-grid">
        <div class="stat-metric-card">
          <div class="stat-metric-header">
            <span class="stat-metric-icon">🔄</span>
            <span class="stat-metric-title">Power Automate Flows</span>
          </div>
          <div class="stat-metric-number">${totalFlows}</div>
          <div class="stat-metric-bar">
            <div class="stat-metric-bar-fill stat-bar-flows" style="width: ${totalFlows > 0 ? (flowsAtivos / totalFlows * 100) : 0}%"></div>
          </div>
          <div class="stat-metric-detail">
            <span class="stat-badge stat-badge-success">${flowsAtivos} ativos</span>
            <span class="stat-badge stat-badge-muted">${flowsInativos} inativos</span>
          </div>
        </div>

        <div class="stat-metric-card">
          <div class="stat-metric-header">
            <span class="stat-metric-icon">📱</span>
            <span class="stat-metric-title">Aplicativos</span>
          </div>
          <div class="stat-metric-number">${totalApps}</div>
          <div class="stat-metric-bar">
            <div class="stat-metric-bar-fill stat-bar-apps" style="width: ${totalApps > 0 ? (appsAtivos / totalApps * 100) : 0}%"></div>
          </div>
          <div class="stat-metric-detail">
            <span class="stat-badge stat-badge-success">${appsAtivos} ativos</span>
            <span class="stat-badge stat-badge-muted">${totalApps - appsAtivos} inativos</span>
          </div>
        </div>

        <div class="stat-metric-card">
          <div class="stat-metric-header">
            <span class="stat-metric-icon">🔧</span>
            <span class="stat-metric-title">Pipelines de Dados</span>
          </div>
          <div class="stat-metric-number">${totalPipelines}</div>
          <div class="stat-metric-bar">
            <div class="stat-metric-bar-fill stat-bar-pipelines" style="width: ${totalPipelines > 0 ? (pipelinesAtivos / totalPipelines * 100) : 0}%"></div>
          </div>
          <div class="stat-metric-detail">
            <span class="stat-badge stat-badge-success">${pipelinesAtivos} ativos</span>
            <span class="stat-badge stat-badge-muted">${totalPipelines - pipelinesAtivos} inativos</span>
          </div>
        </div>

        <div class="stat-metric-card">
          <div class="stat-metric-header">
            <span class="stat-metric-icon">📊</span>
            <span class="stat-metric-title">Dashboards/Relatórios</span>
          </div>
          <div class="stat-metric-number">${totalDashboards}</div>
          <div class="stat-metric-bar">
            <div class="stat-metric-bar-fill stat-bar-dashboards" style="width: ${totalDashboards > 0 ? (dashboardsAtivos / totalDashboards * 100) : 0}%"></div>
          </div>
          <div class="stat-metric-detail">
            <span class="stat-badge stat-badge-success">${dashboardsAtivos} ativos</span>
            <span class="stat-badge stat-badge-muted">${totalDashboards - dashboardsAtivos} inativos</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabela de Projetos -->
    <div class="stats-projects-section">
      <h2>Distribuição por Projeto</h2>
      <div class="stats-table-modern">
        <table>
          <thead>
            <tr>
              <th>Projeto</th>
              <th>Flows</th>
              <th>Apps</th>
              <th>Pipelines</th>
              <th>Dashboards</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${flowsData.projetos.map(projeto => {
              const dados = itensPorProjeto[projeto];
              const total = dados.flows + dados.apps + dados.pipelines + dados.dashboards;
              return `
                <tr>
                  <td class="project-name">${projeto}</td>
                  <td><span class="table-number">${dados.flows}</span></td>
                  <td><span class="table-number">${dados.apps}</span></td>
                  <td><span class="table-number">${dados.pipelines}</span></td>
                  <td><span class="table-number">${dados.dashboards}</span></td>
                  <td><span class="table-number table-total">${total}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════
// CRUD - DASHBOARDS
// ═══════════════════════════════════════════════════════════════
function openAddModalDashboard() {
  currentEditingDashboardId = null;
  document.getElementById('modalDashboardTitle').textContent = 'Adicionar Novo Dashboard/Relatório';
  document.getElementById('dashboardForm').reset();
  populateDashboardDropdowns();
  document.getElementById('modalDashboardOverlay').classList.add('active');
}

function openEditModalDashboard(dashboardId) {
  currentEditingDashboardId = dashboardId;
  const dashboard = flowsData.dashboards.find(d => d.id === dashboardId);

  if (!dashboard) {
    showToast('Dashboard não encontrado!', 'error');
    return;
  }

  document.getElementById('modalDashboardTitle').textContent = 'Editar Dashboard/Relatório';

  // IMPORTANTE: Popular dropdowns ANTES de setar valores
  populateDashboardDropdowns();

  // Agora setar os valores
  document.getElementById('dashboardNome').value = dashboard.nome;
  document.getElementById('dashboardProjeto').value = dashboard.projeto;
  document.getElementById('dashboardTipo').value = dashboard.tipo;
  document.getElementById('dashboardLink').value = dashboard.link || '';
  document.getElementById('dashboardDescricao').value = dashboard.descricao;
  document.getElementById('dashboardFrequencia').value = dashboard.frequencia || '';
  document.querySelector(`input[name="dashboardStatus"][value="${dashboard.status}"]`).checked = true;

  document.getElementById('modalDashboardOverlay').classList.add('active');
}

function populateDashboardDropdowns() {
  const projetoSelect = document.getElementById('dashboardProjeto');
  const tipoSelect = document.getElementById('dashboardTipo');

  if (flowsData.projetos && flowsData.projetos.length > 0) {
    projetoSelect.innerHTML = '<option value="">Selecione um projeto</option>' +
      flowsData.projetos.map(p => `<option value="${p}">${p}</option>`).join('');
  } else {
    projetoSelect.innerHTML = '<option value="">Nenhum projeto cadastrado</option>';
  }

  if (flowsData.tipos_dashboard && flowsData.tipos_dashboard.length > 0) {
    tipoSelect.innerHTML = '<option value="">Selecione um tipo</option>' +
      flowsData.tipos_dashboard.map(t => `<option value="${t}">${t}</option>`).join('');
  } else {
    tipoSelect.innerHTML = '<option value="">Nenhum tipo cadastrado</option>';
  }
}

function closeModalDashboard() {
  document.getElementById('modalDashboardOverlay').classList.remove('active');
  document.getElementById('dashboardForm').reset();
  currentEditingDashboardId = null;
}

function saveDashboard() {
  // Validação
  const nome = document.getElementById('dashboardNome').value.trim();
  const descricao = document.getElementById('dashboardDescricao').value.trim();

  if (!nome) {
    showToast('O nome do dashboard é obrigatório!', 'error');
    return;
  }

  // Coletar dados do formulário
  const projeto = document.getElementById('dashboardProjeto').value;
  const tipo = document.getElementById('dashboardTipo').value;
  const link = document.getElementById('dashboardLink').value.trim();
  const frequencia = document.getElementById('dashboardFrequencia').value.trim();
  const status = document.querySelector('input[name="dashboardStatus"]:checked').value;

  const dashboardData = {
    nome,
    projeto,
    tipo,
    link,
    descricao,
    frequencia,
    status,
    ultima_atualizacao: getCurrentDate()
  };

  if (currentEditingDashboardId) {
    // EDITAR dashboard existente
    const index = flowsData.dashboards.findIndex(d => d.id === currentEditingDashboardId);
    flowsData.dashboards[index] = {
      ...flowsData.dashboards[index],
      ...dashboardData
    };
    showToast('Dashboard atualizado com sucesso! ✓');
  } else {
    // ADICIONAR novo dashboard
    const newDashboard = {
      id: generateUniqueId('dash'),
      ...dashboardData
    };
    flowsData.dashboards.push(newDashboard);
    showToast('Dashboard adicionado com sucesso! ✓');
  }

  // Atualizar estado
  markAsUnsaved();
  saveToLocalStorage();

  // Re-renderizar
  applyFilters();
  populateFilterDropdowns();
  closeModalDashboard();
}

async function confirmDeleteDashboard(dashboardId) {
  const dashboard = flowsData.dashboards.find(d => d.id === dashboardId);

  if (!dashboard) return;

  const confirmed = await showConfirm(
    'Deletar Dashboard',
    `Tem certeza que deseja deletar o dashboard "${dashboard.nome}"? Esta ação não pode ser desfeita.`
  );

  if (confirmed) {
    flowsData.dashboards = flowsData.dashboards.filter(d => d.id !== dashboardId);
    markAsUnsaved();
    saveToLocalStorage();
    renderCurrentTab();
    showToast('Dashboard deletado com sucesso! ✓');
  }
}

// ═══════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════
function setupEventListeners() {
  // Filtros
  document.getElementById('projetoFilter').addEventListener('change', applyFilters);
  document.getElementById('gatilhoFilter').addEventListener('change', applyFilters);
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);

  // Botão FAB - abre modal baseado na tab ativa
  document.getElementById('fabBtn').addEventListener('click', () => {
    if (currentTab === 'flows') {
      openAddModal();
    } else if (currentTab === 'apps') {
      openAddModalApp();
    } else if (currentTab === 'pipelines') {
      openAddModalPipeline();
    } else if (currentTab === 'dashboards') {
      openAddModalDashboard();
    }
  });

  // Export
  document.getElementById('exportBtn').addEventListener('click', exportJSON);
  document.getElementById('saveDirectBtn').addEventListener('click', saveDirectJSON);

  // Configurações
  document.getElementById('configBtn').addEventListener('click', openConfigModal);

  // Modal Flow
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('saveBtn').addEventListener('click', saveFlow);

  // Modal Aplicativo
  document.getElementById('closeModalAppBtn').addEventListener('click', closeModalApp);
  document.getElementById('cancelAppBtn').addEventListener('click', closeModalApp);
  document.getElementById('saveAppBtn').addEventListener('click', saveApp);

  // Modal Pipeline
  document.getElementById('closeModalPipelineBtn').addEventListener('click', closeModalPipeline);
  document.getElementById('cancelPipelineBtn').addEventListener('click', closeModalPipeline);
  document.getElementById('savePipelineBtn').addEventListener('click', savePipeline);

  // Modal Dashboard
  document.getElementById('closeModalDashboardBtn').addEventListener('click', closeModalDashboard);
  document.getElementById('cancelDashboardBtn').addEventListener('click', closeModalDashboard);
  document.getElementById('saveDashboardBtn').addEventListener('click', saveDashboard);

  // Modal Configurações
  document.getElementById('closeConfigModalBtn').addEventListener('click', closeConfigModal);
  document.getElementById('closeConfigBtn').addEventListener('click', closeConfigModal);
  document.getElementById('clearCacheBtn').addEventListener('click', clearCache);

  // Modal de Confirmação
  document.getElementById('confirmOkBtn').addEventListener('click', handleConfirmOk);
  document.getElementById('confirmCancelBtn').addEventListener('click', handleConfirmCancel);

  // Adicionar Projeto/Gatilho
  document.getElementById('addProjetoBtn').addEventListener('click', addProjeto);
  document.getElementById('addGatilhoBtn').addEventListener('click', addGatilho);

  // Enter para adicionar
  document.getElementById('newProjetoConfigInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addProjeto();
  });
  document.getElementById('newGatilhoConfigInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addGatilho();
  });

  // Fechar modal clicando no overlay
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') {
      closeModal();
    }
  });

  document.getElementById('configModalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'configModalOverlay') {
      closeConfigModal();
    }
  });

  document.getElementById('confirmModalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'confirmModalOverlay') {
      handleConfirmCancel();
    }
  });

  document.getElementById('modalAppOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalAppOverlay') {
      closeModalApp();
    }
  });

  document.getElementById('modalPipelineOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalPipelineOverlay') {
      closeModalPipeline();
    }
  });

  document.getElementById('modalDashboardOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalDashboardOverlay') {
      closeModalDashboard();
    }
  });

  // Projeto "Novo"
  document.getElementById('flowProjeto').addEventListener('change', (e) => {
    const newProjetoInput = document.getElementById('newProjetoInput');
    if (e.target.value === '__novo__') {
      newProjetoInput.classList.add('visible');
      document.getElementById('newProjetoNome').focus();
    } else {
      newProjetoInput.classList.remove('visible');
    }
  });

  // Aviso ao sair com alterações não salvas
  window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = 'Você tem alterações não exportadas. Deseja realmente sair?';
      return e.returnValue;
    }
  });
}
