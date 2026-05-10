/* js/store.js — Single source of truth for all data */

const Store = (() => {
  const KEYS = {
    SHOP:     'ps_shop',
    ITEMS:    'ps_items',
    SETTINGS: 'ps_settings',
    ONBOARDED:'ps_onboarded',
  };

  // ── Helpers ──
  function get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }
  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch { return false; }
  }

  // ── Shop ──
  function getShop() {
    return get(KEYS.SHOP, { name: '', address: '', logo: '' });
  }
  function saveShop(shop) {
    return set(KEYS.SHOP, shop);
  }

  // ── Items ──
  function getItems() {
    return get(KEYS.ITEMS, []);
  }
  function saveItems(items) {
    return set(KEYS.ITEMS, items);
  }
  function addItem(item) {
    const items = getItems();
    const newItem = {
      id:        Helpers.uid(),
      name:      item.name.trim(),
      category:  item.category.trim(),
      quantity:  parseInt(item.quantity) || 0,
      minAlert:  parseInt(item.minAlert) || 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    items.unshift(newItem);
    saveItems(items);
    return newItem;
  }
  function updateItem(id, updates) {
    const items = getItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates, updatedAt: Date.now() };
    saveItems(items);
    return items[idx];
  }
  function deleteItem(id) {
    const items = getItems().filter(i => i.id !== id);
    saveItems(items);
  }
  function adjustQty(id, delta) {
    const items = getItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    const newQty = Math.max(0, (items[idx].quantity || 0) + delta);
    items[idx].quantity = newQty;
    items[idx].updatedAt = Date.now();
    saveItems(items);
    return items[idx];
  }

  // ── Settings ──
  function getSettings() {
    return get(KEYS.SETTINGS, { alerts: true, showZero: true });
  }
  function saveSettings(s) {
    return set(KEYS.SETTINGS, { ...getSettings(), ...s });
  }

  // ── Onboarding ──
  function isOnboarded() {
    return !!localStorage.getItem(KEYS.ONBOARDED);
  }
  function markOnboarded() {
    localStorage.setItem(KEYS.ONBOARDED, '1');
  }

  // ── Full export/import ──
  function exportAll() {
    return {
      version: 1,
      exportedAt: Date.now(),
      shop:     getShop(),
      items:    getItems(),
      settings: getSettings(),
    };
  }
  function importAll(data) {
    if (!data || data.version !== 1) return false;
    if (data.shop)     saveShop(data.shop);
    if (data.items)    saveItems(data.items);
    if (data.settings) set(KEYS.SETTINGS, data.settings);
    markOnboarded();
    return true;
  }

  // ── Clear ──
  function clearAll() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }

  // ── Categories ──
  function getCategories() {
    const items = getItems();
    const cats = [...new Set(items.map(i => i.category).filter(Boolean))];
    return cats.sort();
  }

  // ── Low stock items ──
  function getLowStockItems() {
    const settings = getSettings();
    if (!settings.alerts) return [];
    return getItems().filter(i => i.minAlert > 0 && i.quantity <= i.minAlert);
  }

  return {
    getShop, saveShop,
    getItems, saveItems, addItem, updateItem, deleteItem, adjustQty,
    getSettings, saveSettings,
    isOnboarded, markOnboarded,
    exportAll, importAll, clearAll,
    getCategories, getLowStockItems,
  };
})();