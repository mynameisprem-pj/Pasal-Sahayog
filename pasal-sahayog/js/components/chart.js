/* js/components/chart.js — Lightweight canvas pie chart, no dependencies */

const Chart = (() => {
  const COLORS = [
    '#2d6a4f','#52b788','#95d5b2','#1b4332','#40916c',
    '#e07b39','#4f52c5','#d62839','#f4a261','#8fa89a',
  ];

  function drawPie(canvas, data) {
    // data: [{ label, value, color }]
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const cx = size / 2, cy = size / 2;
    const r  = size / 2 - 6;
    const total = data.reduce((s, d) => s + d.value, 0);

    ctx.clearRect(0, 0, size, size);

    if (total === 0) return;

    let start = -Math.PI / 2;
    data.forEach((seg, i) => {
      const slice = (seg.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + slice);
      ctx.closePath();
      ctx.fillStyle = seg.color || COLORS[i % COLORS.length];
      ctx.fill();
      // Small gap
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      start += slice;
    });

    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.54, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
  }

  function renderDashboardChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const items = Store.getItems();
    if (items.length === 0) {
      container.innerHTML = '<div class="chart-empty">Add items to see overview</div>';
      return;
    }

    // Group by category
    const catMap = {};
    items.forEach(item => {
      const cat = item.category || 'Uncategorized';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });

    const sorted = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6); // max 6 categories shown

    const data = sorted.map(([label, value], i) => ({
      label, value, color: COLORS[i % COLORS.length]
    }));

    const total = items.length;

    container.innerHTML = `
      <div class="chart-inner">
        <div class="pie-container">
          <canvas id="pie-canvas" width="110" height="110"></canvas>
          <div class="pie-center">
            <span class="pie-center-val">${total}</span>
            <span class="pie-center-lbl">items</span>
          </div>
        </div>
        <div class="chart-legend" id="chart-legend"></div>
      </div>
    `;

    const canvas = document.getElementById('pie-canvas');
    drawPie(canvas, data);

    const legend = document.getElementById('chart-legend');
    legend.innerHTML = data.map((d, i) => `
      <div class="legend-item">
        <span class="legend-dot" style="background:${d.color}"></span>
        <span class="legend-name">${Helpers.esc(d.label)}</span>
        <span class="legend-val">${d.value}</span>
      </div>
    `).join('');
  }

  return { renderDashboardChart, COLORS };
})();