/* js/app.js — App initialization and global helpers */

const App = (() => {
  // ── Refresh shared UI ──
  function refreshShopInfo() {
    const shop = Store.getShop();

    // Top bar
    const topName = document.getElementById('top-shop-name');
    const topAddr = document.getElementById('top-shop-addr');
    const topLogo = document.getElementById('top-logo');
    if (topName) topName.textContent = shop.name || 'My Shop';
    if (topAddr) topAddr.textContent = shop.address || '';
    if (topLogo) {
      if (shop.logo) {
        topLogo.innerHTML = `<img src="${shop.logo}" alt="logo">`;
      } else {
        topLogo.innerHTML = '🏪';
      }
    }

    // Settings banner
    const bName = document.getElementById('settings-banner-name');
    const bAddr = document.getElementById('settings-banner-addr');
    const bLogo = document.getElementById('settings-banner-logo');
    if (bName) bName.textContent = shop.name || 'My Shop';
    if (bAddr) bAddr.textContent = shop.address || '';
    if (bLogo) {
      if (shop.logo) {
        bLogo.innerHTML = `<img src="${shop.logo}" alt="logo">`;
      } else {
        bLogo.innerHTML = '🏪';
      }
    }
  }

  // ── Full refresh (after add/edit/delete) ──
  function refresh() {
    const page = Router.getCurrent();
    refreshShopInfo();
    if (page === 'dashboard') Dashboard.render();
    if (page === 'stock')     StockPage.render();
    if (page === 'settings')  Settings.render();
    Notifications.updateBadge();
  }

  // ── Show main app after onboarding ──
  function showMainApp() {
    document.getElementById('screen-onboarding')?.classList.remove('active');
    document.getElementById('screen-app')?.classList.add('active');
    refreshShopInfo();
    Router.init();
    Notifications.updateBadge();
  }

  // ── Bootstrap ──
  function init() {
    // Init all modules
    Modal.init();
    Notifications.init();
    Dashboard.init();
    StockPage.init();
    Settings.init();
    Onboarding.init();

    if (Store.isOnboarded()) {
      showMainApp();
    }
    // else onboarding is already shown (active by default in HTML)

    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  }

  return { init, refresh, refreshShopInfo, showMainApp };
})();

// Start
document.addEventListener('DOMContentLoaded', App.init);