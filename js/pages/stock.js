/* js/pages/stock.js */

const StockPage = (() => {
  let activeCategory = 'all';
  let searchQuery = '';
  let viewMode = 'all';

  function setViewMode(mode) {
    viewMode = mode === 'low' || mode === 'out' ? mode : 'all';
    activeCategory = 'all';
    searchQuery = '';

    const input = document.getElementById('stock-search-input');
    const clear = document.getElementById('stock-search-clear');
    if (input) input.value = '';
    if (clear) clear.style.display = 'none';
  }

  function renderChips() {
    const chips = document.getElementById('filter-chips');
    if (!chips) return;
    const cats = Store.getCategories();
    chips.innerHTML = `<button class="chip ${activeCategory === 'all' ? 'active' : ''}" data-cat="all">All</button>`;
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `chip ${activeCategory === cat ? 'active' : ''}`;
      btn.dataset.cat = cat;
      btn.textContent = cat;
      chips.appendChild(btn);
    });
  }

  function renderList() {
    const list  = document.getElementById('stock-list');
    const badge = document.getElementById('stock-count-badge');
    if (!list) return;

    const settings = Store.getSettings();
    let items = Store.getItems();

    if (viewMode === 'low') {
      items = items.filter(i => i.minAlert > 0 && i.quantity > 0 && i.quantity <= i.minAlert);
    } else if (viewMode === 'out') {
      items = items.filter(i => i.quantity === 0);
    } else if (!settings.showZero) {
      items = items.filter(i => i.quantity > 0);
    }

    const filtered = Helpers.filterItems(items, { query: searchQuery, category: activeCategory });

    if (badge) badge.textContent = `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`;

    list.innerHTML = '';
    if (filtered.length === 0) {
      const emptyIcon = searchQuery ? '🔍' : viewMode === 'low' ? '⚠️' : viewMode === 'out' ? '❌' : '📦';
      const emptyTitle = searchQuery
        ? 'No results'
        : viewMode === 'low'
          ? 'No low stock items'
          : viewMode === 'out'
            ? 'No out of stock items'
            : 'Empty stock';
      const msg = searchQuery || activeCategory !== 'all'
        ? 'No items match your filter'
        : viewMode === 'low'
          ? 'No low stock items right now'
          : viewMode === 'out'
            ? 'No out of stock items right now'
            : 'No items yet. Tap + to add one!';
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${emptyIcon}</div>
          <div class="empty-title">${emptyTitle}</div>
          <div class="empty-sub">${msg}</div>
        </div>`;
      return;
    }

    filtered.forEach(item => list.appendChild(ItemCard.render(item)));
  }

  function render() {
    renderChips();
    renderList();
  }

  function _bindSearch() {
    const input = document.getElementById('stock-search-input');
    const clear = document.getElementById('stock-search-clear');

    const doSearch = Helpers.debounce((q) => {
      searchQuery = q;
      clear.style.display = q ? '' : 'none';
      renderList();
    }, 250);

    input?.addEventListener('input', (e) => doSearch(e.target.value));
    clear?.addEventListener('click', () => {
      input.value = '';
      doSearch('');
      input.focus();
    });
  }

  function _bindChips() {
    const chips = document.getElementById('filter-chips');
    chips?.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      activeCategory = chip.dataset.cat;
      chips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderList();
    });
  }

  function init() {
    _bindSearch();
    _bindChips();
  }

  // Call when items change to refresh count badge
  function refreshCount() {
    const badge = document.getElementById('stock-count-badge');
    if (badge) {
      const count = Store.getItems().length;
      badge.textContent = `${count} item${count !== 1 ? 's' : ''}`;
    }
  }

  return { init, render, refreshCount, setViewMode };
})();