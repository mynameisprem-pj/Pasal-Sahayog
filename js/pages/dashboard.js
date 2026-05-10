/* js/pages/dashboard.js */

const Dashboard = (() => {
  let searchActive = false;

  function updateStats() {
    const el = document.getElementById('dash-stats');
    if (!el) return;

    const items    = Store.getItems();
    const settings = Store.getSettings();
    const total    = items.length;
    const cats     = new Set(items.map(i => i.category)).size;
    const lowItems = items.filter(i => i.minAlert > 0 && i.quantity > 0 && i.quantity <= i.minAlert);
    const outItems = items.filter(i => i.quantity === 0);

    const cards = [`
      <div class="stat-card s-total">
        <div class="stat-icon">📦</div>
        <div class="stat-val">${total}</div>
        <div class="stat-label">Total Items</div>
      </div>
      <div class="stat-card s-cat">
        <div class="stat-icon">🏷️</div>
        <div class="stat-val">${cats}</div>
        <div class="stat-label">Categories</div>
      </div>
    `];

    if (settings.alerts) {
      cards.push(`
        <div class="stat-card s-low" data-filter="low">
          <div class="stat-icon">⚠️</div>
          <div class="stat-val">${lowItems.length}</div>
          <div class="stat-label">Low Stock</div>
        </div>
      `);
    }

    if (settings.showZero) {
      cards.push(`
        <div class="stat-card s-out" data-filter="out">
          <div class="stat-icon">❌</div>
          <div class="stat-val">${outItems.length}</div>
          <div class="stat-label">Out of Stock</div>
        </div>
      `);
    }

    el.innerHTML = cards.join('');
  }

  function renderRecent() {
    const el = document.getElementById('recent-list');
    if (!el) return;

    const items = Store.getItems().slice(0, 5);
    if (items.length === 0) {
      el.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <div class="empty-title">No items yet</div>
          <div class="empty-sub">Tap the + button to add your first item</div>
        </div>
      `;
      return;
    }
    el.innerHTML = '';
    items.forEach(item => el.appendChild(ItemCard.render(item)));
  }

  function render() {
    updateStats();
    Chart.renderDashboardChart('chart-inner');
    renderRecent();
    Notifications.updateBadge();
  }

  function _bindSearch() {
    const input  = document.getElementById('dash-search-input');
    const clear  = document.getElementById('dash-search-clear');
    const main   = document.getElementById('dash-main-content');
    const results= document.getElementById('dash-search-results');
    const list   = document.getElementById('dash-search-list');

    const doSearch = Helpers.debounce((q) => {
      if (!q.trim()) {
        searchActive = false;
        results.style.display = 'none';
        main.style.display = '';
        clear.style.display = 'none';
        return;
      }
      searchActive = true;
      results.style.display = '';
      main.style.display = 'none';
      clear.style.display = '';

      const filtered = Helpers.filterItems(Store.getItems(), { query: q });
      list.innerHTML = '';
      if (filtered.length === 0) {
        list.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">No results</div><div class="empty-sub">Try a different search term</div></div>`;
        return;
      }
      filtered.forEach(item => list.appendChild(ItemCard.render(item)));
    }, 250);

    input?.addEventListener('input', (e) => doSearch(e.target.value));
    clear?.addEventListener('click', () => {
      input.value = '';
      doSearch('');
      input.focus();
    });
  }

  function init() {
    _bindSearch();

    document.getElementById('dash-stats')?.addEventListener('click', (e) => {
      const card = e.target.closest('.stat-card');
      if (!card) return;
      const filter = card.dataset.filter;
      if (filter === 'low' || filter === 'out') {
        StockPage.setViewMode(filter);
        Router.navigate('stock');
      }
    });

    document.getElementById('see-all-btn')?.addEventListener('click', () => {
      StockPage.setViewMode('all');
      Router.navigate('stock');
    });
  }

  return { init, render, updateStats };
})();