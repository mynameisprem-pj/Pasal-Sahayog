/* js/components/notifications.js */

const Notifications = (() => {
  function getLowItems() {
    return Store.getLowStockItems();
  }

  function updateBadge() {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;
    const count = getLowItems().length;
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  function renderPanel() {
    const list = document.getElementById('notif-list');
    if (!list) return;
    const items = getLowItems();
    if (items.length === 0) {
      list.innerHTML = '<div class="notif-empty">✅ All items are well-stocked</div>';
      return;
    }
    list.innerHTML = items.map(item => {
      const isOut = item.quantity === 0;
      const dotClass = isOut ? 'out' : 'low';
      const msg = isOut
        ? `Out of stock`
        : `Only ${item.quantity} left (min: ${item.minAlert})`;
      return `
        <div class="notif-item">
          <span class="notif-dot ${dotClass}"></span>
          <div class="notif-text">
            <strong>${Helpers.esc(item.name)}</strong>
            <span>${Helpers.esc(item.category)} · ${msg}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function init() {
    // Bell button
    document.getElementById('notif-btn')?.addEventListener('click', () => {
      renderPanel();
      Modal.open('notif-panel-overlay');
    });
    document.getElementById('notif-panel-close')?.addEventListener('click', () => {
      Modal.close('notif-panel-overlay');
    });
  }

  return { init, updateBadge, renderPanel };
})();