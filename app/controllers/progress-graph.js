document.addEventListener('DOMContentLoaded', function () {
    const graphContainer = document.getElementById('progress-graph-container');
    const canvas = document.getElementById('progress-graph-canvas');

    if (graphContainer && canvas) {
        const ctx = canvas.getContext('2d');
        const dataPoints = Array.from(graphContainer.querySelectorAll('.data-point'));

        if (dataPoints.length === 0) {
            console.warn('No data points found for the progress graph.');
            return;
        }

        const times = dataPoints.map(point => parseInt(point.getAttribute('data-seconds'), 10));
        const wpms = dataPoints.map(point => parseInt(point.getAttribute('data-wpm'), 10));
        const errors = dataPoints.map(point => parseInt(point.getAttribute('data-errors'), 10));

        console.log('Extracted Times:', times);
        console.log('Extracted WPMs:', wpms);
        console.log('Extracted Errors:', errors);

        canvas.width = graphContainer.offsetWidth;
        canvas.height = 200;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.moveTo(40, 10);
        ctx.lineTo(40, 190);
        ctx.lineTo(canvas.width - 10, 190);
        ctx.strokeStyle = '#333';
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;

        wpms.forEach((wpm, index) => {
            const x = 40 + ((canvas.width - 50) * (times[index] / Math.max(...times)));
            const y = 190 - (180 * (wpm / Math.max(...wpms)));

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        ctx.fillStyle = '#f44336';
        errors.forEach((error, index) => {
            const x = 40 + ((canvas.width - 50) * (times[index] / Math.max(...times)));
            const y = 190 - (180 * (error / Math.max(...errors)));

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });

        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('Time (s)', canvas.width / 2, 195);
        ctx.save();
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('WPM', -100, 20);
        ctx.restore();
    }
});
