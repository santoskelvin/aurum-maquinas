// Gráficos de Rentabilidade - Renderização simplificada
(function () {
  'use strict';
  
  function initCharts() {
    const charts = document.querySelectorAll('.bar-chart');
    if (charts.length === 0) return;

    const data = {
      'Renda Fixa': [20, 40, 65, 80, 120],
      'Alavancagem': [30, 55, 90, 110, 140],
      'Ações': [25, 50, 75, 95, 130]
    };

    charts.forEach(chart => {
      const card = chart.closest('.chart-card');
      if (!card) return;
      
      const titleElement = card.querySelector('h4');
      if (!titleElement) return;
      
      const title = titleElement.textContent;
      const heights = data[title] || [20, 40, 60, 80, 100];

      const svg = chart;
      const width = 300;
      const height = 160;
      const barCount = heights.length;
      const barWidth = (width - 40) / barCount - 10;
      const maxHeight = Math.max(...heights);
      const padding = 20;
      const spacing = 10;

      heights.forEach((h, i) => {
        const barHeight = (h / maxHeight) * (height - padding * 2);
        const x = padding + i * (barWidth + spacing);
        const y = height - padding - barHeight;

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', barWidth);
        rect.setAttribute('height', barHeight);
        rect.setAttribute('fill', '#D4A44E');
        rect.setAttribute('rx', '4');
        svg.appendChild(rect);
      });
    });
  }

  // Inicializar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCharts);
  } else {
    initCharts();
  }
})();

