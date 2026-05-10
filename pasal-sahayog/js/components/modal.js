/* js/components/modal.js */

const Modal = (() => {
  let editingId = null;

  // ── Generic open/close ──
  function open(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
    document.body.style.overflow = '';
  }
  function closeAll() {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    document.body.style.overflow = '';
  }

  // ── Close on overlay click ──
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('open')) {
      e.target.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // ── Add/Edit Item Modal ──
  function openAddItem() {
    editingId = null;
    document.getElementById('modal-item-title').textContent = 'Add Item';
    document.getElementById('modal-item-save').textContent = 'Save Item';
    document.getElementById('field-name').value = '';
    document.getElementById('field-cat').value = '';
    document.getElementById('field-qty').value = '';
    document.getElementById('field-min').value = '';
    _populateCatDatalist();
    open('modal-item');
    setTimeout(() => document.getElementById('field-name').focus(), 350);
  }

  function openEditItem(id) {
    const item = Store.getItems().find(i => i.id === id);
    if (!item) return;
    editingId = id;
    document.getElementById('modal-item-title').textContent = 'Edit Item';
    document.getElementById('modal-item-save').textContent = 'Update Item';
    document.getElementById('field-name').value = item.name;
    document.getElementById('field-cat').value = item.category;
    document.getElementById('field-qty').value = item.quantity;
    document.getElementById('field-min').value = item.minAlert;
    _populateCatDatalist();
    open('modal-item');
  }

  function _populateCatDatalist() {
    const dl = document.getElementById('cat-datalist');
    if (!dl) return;
    const cats = Store.getCategories();
    dl.innerHTML = cats.map(c => `<option value="${Helpers.esc(c)}">`).join('');
  }

  function saveItem() {
    const name = document.getElementById('field-name').value.trim();
    const cat  = document.getElementById('field-cat').value.trim();
    const qty  = document.getElementById('field-qty').value;
    const min  = document.getElementById('field-min').value;

    if (!name) { Toast.show('Item name is required', 'error'); return; }
    if (!cat)  { Toast.show('Category is required', 'error'); return; }
    if (qty === '') { Toast.show('Quantity is required', 'error'); return; }

    if (editingId) {
      Store.updateItem(editingId, {
        name, category: cat,
        quantity: parseInt(qty) || 0,
        minAlert: parseInt(min) || 0,
      });
      Toast.show('Item updated', 'success');
    } else {
      Store.addItem({ name, category: cat, quantity: qty, minAlert: min });
      Toast.show('Item added!', 'success');
    }

    close('modal-item');
    editingId = null;
    App.refresh();
  }

  // ── Action Modal (edit/delete) ──
  function openAction(id) {
    const item = Store.getItems().find(i => i.id === id);
    if (!item) return;
    document.getElementById('modal-action-title').textContent = item.name;
    const info = document.getElementById('action-item-info');
    info.innerHTML = `
      <div class="ai-name">${Helpers.esc(item.name)}</div>
      <div class="ai-meta">
        ${Helpers.esc(item.category)} &nbsp;·&nbsp; Stock: ${item.quantity}
        ${item.minAlert ? ` &nbsp;·&nbsp; Alert: ${item.minAlert}` : ''}
      </div>
    `;
    document.getElementById('btn-action-edit').onclick = () => {
      close('modal-action');
      setTimeout(() => openEditItem(id), 200);
    };
    document.getElementById('btn-action-delete').onclick = () => {
      close('modal-action');
      confirmDelete(id, item.name);
    };
    open('modal-action');
  }

  function confirmDelete(id, name) {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      Store.deleteItem(id);
      Toast.show('Item deleted', 'default');
      App.refresh();
    }
  }

  // ── Edit Shop Modal ──
  let editShopLogoBase64 = null;

  function openEditShop() {
    const shop = Store.getShop();
    editShopLogoBase64 = shop.logo || null;
    document.getElementById('edit-shop-name').value = shop.name || '';
    document.getElementById('edit-shop-addr').value = shop.address || '';
    const preview = document.getElementById('edit-logo-preview');
    const ph = document.getElementById('edit-logo-placeholder');
    if (shop.logo) {
      preview.src = shop.logo;
      preview.style.display = '';
      ph.style.display = 'none';
    } else {
      preview.style.display = 'none';
      ph.style.display = '';
    }
    open('modal-edit-shop');
  }

  function saveShop() {
    const name = document.getElementById('edit-shop-name').value.trim();
    if (!name) { Toast.show('Shop name is required', 'error'); return; }
    Store.saveShop({
      name,
      address: document.getElementById('edit-shop-addr').value.trim(),
      logo: editShopLogoBase64 || '',
    });
    close('modal-edit-shop');
    App.refreshShopInfo();
    Toast.show('Shop info updated', 'success');
  }

  // Logo upload for edit shop
  function _initEditShopLogo() {
    const zone = document.getElementById('edit-logo-zone');
    const input = document.getElementById('edit-logo-input');
    if (!zone || !input) return;
    zone.addEventListener('click', () => input.click());
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const b64 = await Helpers.fileToBase64(file);
      editShopLogoBase64 = await Helpers.cropImageToCircle(b64);
      const preview = document.getElementById('edit-logo-preview');
      const ph = document.getElementById('edit-logo-placeholder');
      preview.src = editShopLogoBase64;
      preview.style.display = '';
      ph.style.display = 'none';
      input.value = '';
    });
  }

  // ── Bind all modal buttons ──
  function init() {
    // Item modal
    document.getElementById('modal-item-close')?.addEventListener('click', () => close('modal-item'));
    document.getElementById('modal-item-cancel')?.addEventListener('click', () => close('modal-item'));
    document.getElementById('modal-item-save')?.addEventListener('click', saveItem);

    // Action modal
    document.getElementById('modal-action-close')?.addEventListener('click', () => close('modal-action'));

    // Edit shop modal
    document.getElementById('modal-edit-shop-close')?.addEventListener('click', () => close('modal-edit-shop'));
    document.getElementById('modal-edit-shop-cancel')?.addEventListener('click', () => close('modal-edit-shop'));
    document.getElementById('modal-edit-shop-save')?.addEventListener('click', saveShop);
    document.getElementById('btn-edit-shop')?.addEventListener('click', openEditShop);
    _initEditShopLogo();

    // FAB
    document.getElementById('fab-add')?.addEventListener('click', openAddItem);

    // Enter key in item form
    ['field-name','field-cat','field-qty','field-min'].forEach(id => {
      document.getElementById(id)?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveItem();
      });
    });

    // Global qty +/- delegation
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.qty-btn');
      if (!btn) return;
      e.stopPropagation();
      const id = btn.dataset.id;
      const delta = parseInt(btn.dataset.delta);
      if (!id || isNaN(delta)) return;
      const updated = Store.adjustQty(id, delta);
      if (updated) {
        ItemCard.updateCardQty(id, updated.quantity);
        Notifications.updateBadge();
        Dashboard.updateStats();
      }
    });
  }

  return { init, openAddItem, openEditItem, openAction, openEditShop, close, closeAll, open };
})();