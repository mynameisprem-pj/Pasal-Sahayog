/* js/components/toast.js */

const Toast = (() => {
  let timer;
  const el = () => document.getElementById('toast');

  function show(msg, type = 'default', duration = 2800) {
    const t = el();
    if (!t) return;
    clearTimeout(timer);
    t.textContent = msg;
    t.className = 'toast show ' + type;
    timer = setTimeout(() => hide(), duration);
  }

  function hide() {
    const t = el();
    if (t) t.className = 'toast';
  }

  return { show, hide };
})();