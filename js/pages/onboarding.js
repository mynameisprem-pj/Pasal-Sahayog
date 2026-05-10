/* js/pages/onboarding.js */

const Onboarding = (() => {
  let currentSlide = 1;
  let logoBase64 = null;
  const prefs = { alerts: true, showZero: true };

  function goToSlide(n) {
    const prev = document.getElementById(`ob-slide-${currentSlide}`);
    const next = document.getElementById(`ob-slide-${n}`);
    if (!prev || !next) return;

    prev.classList.remove('active');
    prev.classList.add('exit');
    setTimeout(() => prev.classList.remove('exit'), 420);

    next.classList.add('active');
    currentSlide = n;
    _updateDots();
  }

  function _updateDots() {
    [1, 2, 3].forEach(i => {
      const dot = document.getElementById(`dot-${i}`);
      if (dot) dot.classList.toggle('active', i === currentSlide);
    });
  }

  function _bindLogoUpload() {
    const zone = document.getElementById('logo-upload-zone');
    const input = document.getElementById('logo-file-input');
    if (!zone || !input) return;

    zone.addEventListener('click', () => input.click());
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const raw = await Helpers.fileToBase64(file);
      logoBase64 = await Helpers.cropImageToCircle(raw);
      const preview = document.getElementById('logo-preview');
      const ph = document.getElementById('logo-placeholder');
      preview.src = logoBase64;
      preview.style.display = '';
      ph.style.display = 'none';
      input.value = '';
    });
  }

  function _bindToggles() {
    const alertToggle = document.getElementById('pref-alerts');
    const zeroToggle  = document.getElementById('pref-zero');

    alertToggle?.addEventListener('click', () => {
      prefs.alerts = !prefs.alerts;
      alertToggle.classList.toggle('on', prefs.alerts);
    });
    zeroToggle?.addEventListener('click', () => {
      prefs.showZero = !prefs.showZero;
      zeroToggle.classList.toggle('on', prefs.showZero);
    });
  }

  function _finish() {
    const name = document.getElementById('shop-name-input')?.value.trim();
    const addr = document.getElementById('shop-addr-input')?.value.trim();

    Store.saveShop({ name: name || 'My Shop', address: addr || '', logo: logoBase64 || '' });
    Store.saveSettings({ alerts: prefs.alerts, showZero: prefs.showZero });
    Store.markOnboarded();
    App.showMainApp();
  }

  function init() {
    _bindLogoUpload();
    _bindToggles();

    // Slide 1 → 2
    document.getElementById('btn-ob-start')?.addEventListener('click', () => goToSlide(2));

    // Slide 2 back
    document.getElementById('btn-ob-back-2')?.addEventListener('click', () => goToSlide(1));

    // Slide 2 → 3
    document.getElementById('btn-ob-next-2')?.addEventListener('click', () => {
      const name = document.getElementById('shop-name-input')?.value.trim();
      if (!name) {
        Toast.show('Please enter your shop name', 'error');
        document.getElementById('shop-name-input')?.focus();
        return;
      }
      goToSlide(3);
    });

    // Slide 3 back
    document.getElementById('btn-ob-back-3')?.addEventListener('click', () => goToSlide(2));

    // Finish
    document.getElementById('btn-ob-finish')?.addEventListener('click', _finish);
  }

  return { init };
})();