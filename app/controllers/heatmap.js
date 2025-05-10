document.addEventListener('DOMContentLoaded', function () {
    const heatmapContainer = document.getElementById('char-heatmap-container');
    if (heatmapContainer) {
        const charData = Array.from(heatmapContainer.querySelectorAll('.char-item'));

        if (charData.length === 0) {
            console.warn('No data points found for the character heatmap.');
            return;
        }

        charData.forEach(item => {
            const char = item.getAttribute('data-char');
            const count = parseInt(item.getAttribute('data-count'), 10);

            const charDiv = document.createElement('div');
            charDiv.className = 'heat-char';
            charDiv.innerHTML = `<span class="char-value">${char}</span><span class="char-count">${count}</span>`;

            const intensity = Math.min(count * 20, 100);
            charDiv.style.backgroundColor = `rgba(255, 99, 71, ${intensity / 100})`;

            heatmapContainer.appendChild(charDiv);
        });
    }
});
