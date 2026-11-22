/**
 * Phyto Intelligence Model Library - Client Controller
 */
(function () {
  let allModels = [];
  let currentCategory = 'all';
  let searchQuery = '';
  let activeModalModel = null;

  // DOM Elements
  const modelGrid = document.getElementById('modelGrid');
  const countAll = document.getElementById('countAll');
  const countLight = document.getElementById('countLight');
  const countReasoning = document.getElementById('countReasoning');
  const searchInput = document.getElementById('searchInput');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');

  // Initialization
  async function init() {
    if (window.PHYTO_MODELS && Array.isArray(window.PHYTO_MODELS)) {
      allModels = window.PHYTO_MODELS;
    } else {
      try {
        const resp = await fetch('models.json');
        allModels = await resp.json();
      } catch (err) {
        console.error('Failed to load models data:', err);
      }
    }

    updateCounts();
    setupEventListeners();
    renderModels();
  }

  function updateCounts() {
    const lightCount = allModels.filter(m => m.category.toLowerCase() === 'light').length;
    const reasoningCount = allModels.filter(m => m.category.toLowerCase() === 'reasoning').length;

    if (countAll) countAll.textContent = allModels.length;
    if (countLight) countLight.textContent = lightCount;
    if (countReasoning) countReasoning.textContent = reasoningCount;
  }

  function setupEventListeners() {
    // Category tabs
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        renderModels();
      });
    });

    // Search input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderModels();
      });
    }

    // Modal close
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModal);
    }
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  function renderModels() {
    if (!modelGrid) return;

    const filtered = allModels.filter(model => {
      const matchesCategory =
        currentCategory === 'all' ||
        model.category.toLowerCase() === currentCategory.toLowerCase();

      const searchTarget = `${model.name} ${model.publisher} ${model.family} ${model.architecture} ${model.parameters} ${model.shortDescription} ${model.plantStrengths.join(' ')}`.toLowerCase();
      const matchesSearch = !searchQuery || searchTarget.includes(searchQuery);

      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      modelGrid.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom: 12px; opacity: 0.5;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <p>No models found matching "<strong>${escapeHtml(searchQuery)}</strong>"</p>
        </div>
      `;
      return;
    }

    modelGrid.innerHTML = filtered.map(model => createModelCardHtml(model)).join('');

    // Attach listeners to newly created card buttons
    filtered.forEach(model => {
      const cardEl = document.getElementById(`card-${model.id}`);
      if (!cardEl) return;

      const downloadBtn = cardEl.querySelector('.btn-download');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
          e.preventDefault();
          initiateDirectDownload(model, downloadBtn);
        });
      }

      const detailsBtn = cardEl.querySelector('.btn-details');
      if (detailsBtn) {
        detailsBtn.addEventListener('click', () => {
          openModal(model);
        });
      }
    });
  }

  function createModelCardHtml(model) {
    const isLight = model.category.toLowerCase() === 'light';
    const categoryBadgeClass = isLight ? 'badge-light' : 'badge-reasoning';
    const categoryIcon = isLight ? '⚡ Light' : '🧠 Reasoning';

    return `
      <div class="model-card" id="card-${model.id}">
        <div class="card-top">
          <div class="card-header-badges">
            <div class="badge-group">
              <span class="badge ${categoryBadgeClass}">${categoryIcon}</span>
              <span class="badge badge-arch">${model.architecture}</span>
              <span class="badge badge-verified">✓ ${model.quantization}</span>
            </div>
          </div>

          <h3 class="model-name">${escapeHtml(model.name)}</h3>
          <div class="model-publisher">by ${escapeHtml(model.publisher)}</div>
          <p class="model-desc">${escapeHtml(model.shortDescription)}</p>

          <div class="spec-chips">
            <div class="spec-chip">
              <span class="spec-chip-label">Params</span>
              <span class="spec-chip-value">${model.parameters}</span>
            </div>
            <div class="spec-chip">
              <span class="spec-chip-label">Download</span>
              <span class="spec-chip-value">${model.fileSizeDisplay}</span>
            </div>
            <div class="spec-chip">
              <span class="spec-chip-label">RAM Need</span>
              <span class="spec-chip-value">${model.ramRequiredDisplay}</span>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-download" data-id="${model.id}" title="Direct download ${model.fileName}">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download GGUF
          </button>
          <button class="btn-details" data-id="${model.id}">Details</button>
        </div>
      </div>
    `;
  }

  function initiateDirectDownload(model, buttonElement) {
    if (!model.directDownloadUrl) {
      showToast('Download URL pending setup for this model.');
      return;
    }

    // Trigger genuine direct browser download without webpage redirection
    const link = document.createElement('a');
    link.href = model.directDownloadUrl;
    link.setAttribute('download', model.fileName);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Provide visual state feedback on the button
    if (buttonElement) {
      const origText = buttonElement.innerHTML;
      buttonElement.classList.add('downloading');
      buttonElement.innerHTML = `
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="animation: spin 1s linear infinite;">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
        </svg>
        Download Started
      `;
      setTimeout(() => {
        buttonElement.classList.remove('downloading');
        buttonElement.innerHTML = origText;
      }, 3500);
    }

    showToast(`Downloading ${model.fileName} (${model.fileSizeDisplay}). Select it in Phyto Intelligence!`);
  }

  function openModal(model) {
    activeModalModel = model;
    const isLight = model.category.toLowerCase() === 'light';
    const categoryBadgeClass = isLight ? 'badge-light' : 'badge-reasoning';
    const categoryIcon = isLight ? '⚡ Light' : '🧠 Reasoning';

    document.getElementById('modalBadges').innerHTML = `
      <span class="badge ${categoryBadgeClass}">${categoryIcon}</span>
      <span class="badge badge-arch">${model.architecture}</span>
      <span class="badge badge-verified">✓ ${model.compatibilityStatus}</span>
    `;

    document.getElementById('modalTitle').textContent = model.name;
    document.getElementById('modalPublisher').textContent = `Publisher: ${model.publisher} • Family: ${model.family}`;
    document.getElementById('modalDesc').textContent = model.shortDescription;

    const strengthsList = document.getElementById('modalStrengths');
    strengthsList.innerHTML = model.plantStrengths.map(s => `
      <li>
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${escapeHtml(s)}</span>
      </li>
    `).join('');

    const specsTable = document.getElementById('modalSpecs');
    specsTable.innerHTML = `
      <tr><td>GGUF Binary File</td><td><code>${escapeHtml(model.fileName)}</code></td></tr>
      <tr><td>Quantization</td><td>${model.quantization}</td></tr>
      <tr><td>Parameter Count</td><td>${model.parameters}</td></tr>
      <tr><td>Download File Size</td><td>${model.fileSizeDisplay} (${model.fileSizeBytes.toLocaleString()} bytes)</td></tr>
      <tr><td>Recommended Free RAM</td><td>${model.ramRequiredDisplay}</td></tr>
      <tr><td>Native Context Window</td><td>${model.contextLength.toLocaleString()} tokens</td></tr>
      <tr><td>Recommended Context</td><td>${model.recommendedContext} tokens</td></tr>
      <tr><td>Runtime Architecture</td><td>${model.architecture} (llama.cpp compliant)</td></tr>
      <tr><td>License</td><td>${model.license}</td></tr>
    `;

    const modalDownloadBtn = document.getElementById('modalDownloadBtn');
    modalDownloadBtn.onclick = () => initiateDirectDownload(model, modalDownloadBtn);

    const modalCopyBtn = document.getElementById('modalCopyBtn');
    modalCopyBtn.onclick = () => copyDownloadLink(model.directDownloadUrl);

    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    activeModalModel = null;
  }

  function copyDownloadLink(url) {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      showToast('Direct download URL copied to clipboard!');
    }).catch(() => {
      showToast('Could not copy URL automatically.');
    });
  }

  let toastTimeout = null;
  function showToast(message) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
