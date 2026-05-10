/* js/utils/backup.js */

const Backup = (() => {
  function exportData() {
    const data = Store.exportAll();
    const date = new Date().toISOString().slice(0, 10);
    const filename = `pasalsahayog_backup_${date}.json`;
    Helpers.downloadJSON(data, filename);
    Toast.show('Backup downloaded!', 'success');
  }

  function importData(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.name.endsWith('.json')) {
        Toast.show('Please select a valid .json backup file', 'error');
        return reject('invalid file');
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const ok = Store.importAll(data);
          if (ok) {
            Toast.show('Data restored successfully!', 'success');
            resolve(data);
          } else {
            Toast.show('Invalid backup file format', 'error');
            reject('invalid format');
          }
        } catch {
          Toast.show('Could not read backup file', 'error');
          reject('parse error');
        }
      };
      reader.readAsText(file);
    });
  }

  return { exportData, importData };
})();