/* js/pages/settings.js */

const Settings = (() => {
  function _syncToggles() {
    const s = Store.getSettings();
    const alertsToggle = document.getElementById('setting-alerts');
    const zeroToggle   = document.getElementById('setting-zero');
    if (alertsToggle) alertsToggle.classList.toggle('on', !!s.alerts);
    if (zeroToggle)   zeroToggle.classList.toggle('on', !!s.showZero);
  }

  function render() {
    _syncToggles();
    App.refreshShopInfo(); // keep banner in sync
  }

  function init() {
    // Preference toggles
    document.getElementById('setting-alerts')?.addEventListener('click', (e) => {
      const s = Store.getSettings();
      Store.saveSettings({ alerts: !s.alerts });
      e.currentTarget.classList.toggle('on', !s.alerts);
      Notifications.updateBadge();
    });
    document.getElementById('setting-zero')?.addEventListener('click', (e) => {
      const s = Store.getSettings();
      Store.saveSettings({ showZero: !s.showZero });
      e.currentTarget.classList.toggle('on', !s.showZero);
    });

    // Backup
    document.getElementById('btn-backup')?.addEventListener('click', () => {
      Backup.exportData();
    });

    // Restore
    const restoreBtn   = document.getElementById('btn-restore');
    const restoreInput = document.getElementById('restore-file-input');
    restoreBtn?.addEventListener('click', () => restoreInput?.click());
    restoreInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        await Backup.importData(file);
        App.refresh();
      } catch {}
      restoreInput.value = '';
    });

    // Clear all data - now opens modal instead of browser confirm
    document.getElementById('btn-clear-data-trigger')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-clear-data');
      if (modal) modal.classList.add('open');
    });

    document.getElementById('modal-clear-data-close')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-clear-data');
      if (modal) modal.classList.remove('open');
    });

    document.getElementById('modal-clear-data-cancel')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-clear-data');
      if (modal) modal.classList.remove('open');
    });

    document.getElementById('modal-clear-data-confirm')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-clear-data');
      if (modal) modal.classList.remove('open');
      Store.clearAll();
      Toast.show('All data cleared', 'default');
      // Reload to onboarding
      setTimeout(() => location.reload(), 1000);
    });

    // Disclaimer
    document.getElementById('btn-disclaimer')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-disclaimer');
      if (modal) modal.classList.add('open');
    });

    document.getElementById('modal-disclaimer-close')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-disclaimer');
      if (modal) modal.classList.remove('open');
    });

    document.getElementById('modal-disclaimer-close-btn')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-disclaimer');
      if (modal) modal.classList.remove('open');
    });
  }

  return { init, render };
})();