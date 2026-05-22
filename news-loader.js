async function loadRealNews() {
    const container = document.getElementById('newsContainer');
    if (!container) return;
    container.innerHTML = '<p>Загрузка свежих новостей...</p>';
    try {
        // Используем CORS-прокси для RSS-ленты (agroxxi.ru)
        const rssUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.agroxxi.ru/rss/news.xml';
        const response = await fetch(rssUrl);
        const data = await response.json();
        if (data && data.items && data.items.length > 0) {
            const newsHtml = data.items.slice(0, 6).map(item => `
                <div class="news-card">
                    <h3>📢 ${item.title}</h3>
                    <p>${item.description ? item.description.substring(0, 120) + '…' : ''}</p>
                    <a href="${item.link}" target="_blank" rel="noopener noreferrer">Читать далее →</a>
                    <div style="font-size:0.7rem; margin-top:8px;">${new Date(item.pubDate).toLocaleDateString()}</div>
                </div>
            `).join('');
            container.innerHTML = newsHtml;
        } else {
            throw new Error('Нет новостей');
        }
    } catch (error) {
        console.warn('Не удалось загрузить RSS, показываем примеры');
        container.innerHTML = `
            <div class="news-card"><h3>🌾 Цифровые двойники полей</h3><p>Россельхозцентр внедряет спутниковый мониторинг.</p><a href="#">Подробнее</a></div>
            <div class="news-card"><h3>🚜 Рынок ИИ в АПК растёт</h3><p>К 2026 году объём решений вырастет на 34%.</p><a href="#">Подробнее</a></div>
            <div class="news-card"><h3>📈 Новые субсидии</h3><p>Фермеры получат гранты на цифровизацию.</p><a href="#">Подробнее</a></div>
        `;
    }
}