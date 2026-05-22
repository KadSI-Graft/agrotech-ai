// Этот файл подключается только на dashboard.html
window.addEventListener('DOMContentLoaded', () => {
    const ctxFuel = document.getElementById('fuelChart')?.getContext('2d');
    const ctxFert = document.getElementById('fertilizerChart')?.getContext('2d');
    const ctxSeed = document.getElementById('seedChart')?.getContext('2d');
    if (ctxFuel) {
        new Chart(ctxFuel, {
            type: 'bar',
            data: { labels: ['Вспашка','Посев','Подкормка','Уборка'], datasets: [{ label: 'л/га', data: [10.2, 3.2, 1.2, 11.5], backgroundColor: '#3c8c40' }] }
        });
    }
    if (ctxFert) {
        new Chart(ctxFert, {
            type: 'line',
            data: { labels: ['N', 'P₂O₅', 'K₂O'], datasets: [{ label: 'кг/га', data: [45, 30, 15], borderColor: '#2e7d32', tension: 0.3 }] }
        });
    }
    if (ctxSeed) {
        new Chart(ctxSeed, {
            type: 'bar',
            data: { labels: ['Пшеница','Ячмень','Кукуруза'], datasets: [{ label: 'ц/га', data: [2.2, 2.1, 0.28], backgroundColor: '#c5b55c' }] }
        });
    }
});