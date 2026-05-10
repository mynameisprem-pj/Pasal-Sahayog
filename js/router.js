/* js/router.js */

const Router = (() => {
  let currentPage = 'dashboard';
  const pages = ['dashboard', 'stock', 'settings'];

  function navigate(page) {
    if (!pages.includes(page)) return;
    currentPage = page;

    // Switch pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');

    // Update nav
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });

    // Render page-specific content
    if (page === 'dashboard') Dashboard.render();
    if (page === 'stock')     StockPage.render();
    if (page === 'settings')  Settings.render();
  }

  function init() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.page === 'stock') {
          StockPage.setViewMode('all');
        }
        navigate(btn.dataset.page);
      });
    });
    // Start on dashboard
    navigate('dashboard');
  }

  return { init, navigate, getCurrent: () => currentPage };
})();