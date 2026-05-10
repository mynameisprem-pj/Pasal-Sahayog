/* js/components/itemCard.js */

const ItemCard = (() => {
  function getStatus(item) {
    if (item.quantity === 0) return 'out';
    if (item.minAlert > 0 && item.quantity <= item.minAlert) return 'low';
    return 'ok';
  }

  function getStatusHtml(item) {
    const s = getStatus(item);
    if (s === 'out') return '<span class="item-status status-out">Out of stock</span>';
    if (s === 'low') return '<span class="item-status status-low">Low stock</span>';
    return '';
  }

  function getCardClass(item) {
    const s = getStatus(item);
    if (s === 'out') return 'item-card out-stock';
    if (s === 'low') return 'item-card low-stock';
    return 'item-card';
  }

  function render(item) {
    const qtyClass = item.quantity === 0 ? 'qty-num zero' : 'qty-num';
    const card = document.createElement('div');
    card.className = getCardClass(item);
    card.dataset.id = item.id;
    card.innerHTML = `
      <div class="item-card-left">
        <div class="item-name">${Helpers.esc(item.name)}</div>
        <div class="item-meta">
          <span class="item-cat">${Helpers.esc(item.category)}</span>
          ${getStatusHtml(item)}
        </div>
      </div>
      <div class="item-qty-wrap">
        <button class="qty-btn minus" data-id="${item.id}" data-delta="-1" aria-label="Decrease">−</button>
        <span class="${qtyClass}" id="qty-${item.id}">${item.quantity}</span>
        <button class="qty-btn plus" data-id="${item.id}" data-delta="1" aria-label="Increase">+</button>
      </div>
    `;

    // Long press / tap for action
    card.addEventListener('click', (e) => {
      // Ignore if + or - was clicked
      if (e.target.classList.contains('qty-btn')) return;
      Modal.openAction(item.id);
    });

    return card;
  }

  function updateCardQty(id, newQty) {
    // Update all qty displays for this item
    document.querySelectorAll(`#qty-${id}`).forEach(el => {
      el.textContent = newQty;
      el.className = newQty === 0 ? 'qty-num zero' : 'qty-num';
    });
    // Update card class
    const item = Store.getItems().find(i => i.id === id);
    if (!item) return;
    document.querySelectorAll(`.item-card[data-id="${id}"]`).forEach(card => {
      card.className = getCardClass(item);
      const statusEl = card.querySelector('.item-meta');
      if (statusEl) {
        const statusHtml = getStatusHtml(item);
        const existingStatus = statusEl.querySelector('.item-status');
        if (existingStatus) existingStatus.remove();
        if (statusHtml) statusEl.insertAdjacentHTML('beforeend', statusHtml);
      }
    });
  }

  return { render, updateCardQty, getStatus };
})();