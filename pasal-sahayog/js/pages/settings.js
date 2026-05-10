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

    // Clear all data
    document.getElementById('btn-clear-data')?.addEventListener('click', () => {
      if (confirm('Delete ALL data including shop info and items? This cannot be undone.')) {
        Store.clearAll();
        Toast.show('All data cleared', 'default');
        // Reload to onboarding
        setTimeout(() => location.reload(), 1000);
      }
    });
  }

  return { init, render };
})();