function initCharts() {
    const fuelCanvas = document.getElementById('fuelChart');
    const fertCanvas = document.getElementById('fertilizerChart');
    const seedCanvas = document.getElementById('seedChart');
    
    if (fuelCanvas) {
        new Chart(fuelCanvas, {
            type: 'bar',
            data: { labels: ['Вспашка','Посев','Подкормка','Уборка'], datasets: [{ label: 'л/га', data: [10.2, 3.2, 1.2, 11.5], backgroundColor: '#3c8c40' }] },
            options: { responsive: true, maintainAspectRatio: true }
        });
    }
    if (fertCanvas) {
        new Chart(fertCanvas, {
            type: 'line',
            data: { labels: ['N', 'P₂O₅', 'K₂O'], datasets: [{ label: 'кг/га', data: [45, 30, 15], borderColor: '#2e7d32', tension: 0.3 }] },
            options: { responsive: true, maintainAspectRatio: true }
        });
    }
    if (seedCanvas) {
        new Chart(seedCanvas, {
            type: 'bar',
            data: { labels: ['Пшеница','Ячмень','Кукуруза'], datasets: [{ label: 'ц/га', data: [2.2, 2.1, 0.28], backgroundColor: '#c5b55c' }] },
            options: { responsive: true, maintainAspectRatio: true }
        });
    }
}

// Запускаем после полной загрузки страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCharts);
} else {
    initCharts();
}