/**
 * Progress Graph Generator
 * Creates a line graph showing WPM and accuracy over time
 */
function generateProgressGraph(progressData) {
    const container = document.getElementById('progress-graph');
    container.innerHTML = '';
    
    // If no progress data, show a message
    if (Object.keys(progressData).length === 0) {
        const message = document.createElement('p');
        message.textContent = 'No progress data available.';
        message.className = 'no-data-message';
        container.appendChild(message);
        return;
    }
    
    // Create SVG element
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "250");
    svg.setAttribute("viewBox", "0 0 600 250");
    svg.setAttribute("class", "progress-chart");
    
    // Get data points sorted by time
    const timePoints = Object.keys(progressData).sort((a, b) => parseInt(a) - parseInt(b));
    const wpmPoints = timePoints.map(time => progressData[time].wpm);
    const errorPoints = timePoints.map(time => progressData[time].errors);
    
    // Calculate max values for scaling
    const maxTime = parseInt(timePoints[timePoints.length - 1]) || 60;
    const maxWpm = Math.max(...wpmPoints, 1) * 1.2; // Add 20% headroom
    const maxErrors = Math.max(...errorPoints, 1) * 1.2;
    
    // Define graph dimensions
    const graphWidth = 550;
    const graphHeight = 200;
    const marginLeft = 50;
    const marginBottom = 30;
    const marginTop = 20;
    
    // Create axis and grid
    createAxis(svg, maxTime, maxWpm, maxErrors, graphWidth, graphHeight, marginLeft, marginBottom, marginTop);
    
    // Create WPM line
    const wpmLine = createLine(timePoints, wpmPoints, maxTime, maxWpm, graphWidth, graphHeight, marginLeft, marginBottom, marginTop);
    wpmLine.setAttribute("stroke", "#4285f4");
    wpmLine.setAttribute("class", "wpm-line");
    svg.appendChild(wpmLine);
    
    // Create error line
    const errorLine = createLine(timePoints, errorPoints, maxTime, maxErrors, graphWidth, graphHeight, marginLeft, marginBottom, marginTop);
    errorLine.setAttribute("stroke", "#db4437");
    errorLine.setAttribute("class", "error-line");
    errorLine.setAttribute("stroke-dasharray", "5,5");
    svg.appendChild(errorLine);
    
    // Add data points for WPM
    timePoints.forEach((time, i) => {
        const wpm = wpmPoints[i];
        const x = marginLeft + (parseInt(time) / maxTime) * graphWidth;
        const y = marginTop + graphHeight - (wpm / maxWpm) * graphHeight;
        
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", "4");
        circle.setAttribute("fill", "#4285f4");
        circle.setAttribute("class", "data-point wpm-point");
        circle.setAttribute("data-time", time);
        circle.setAttribute("data-wpm", wpm);
        
        // Add tooltip
        const title = document.createElementNS(svgNS, "title");
        title.textContent = `${time}s: ${wpm} WPM`;
        circle.appendChild(title);
        
        svg.appendChild(circle);
    });
    
    // Add legend
    const legend = createLegend(svg);
    svg.appendChild(legend);
    
    container.appendChild(svg);
}

/**
 * Create a path element for the line
 */
function createLine(timePoints, dataPoints, maxTime, maxValue, width, height, marginLeft, marginBottom, marginTop) {
    const svgNS = "http://www.w3.org/2000/svg";
    const path = document.createElementNS(svgNS, "path");
    
    let d = "M";
    
    timePoints.forEach((time, i) => {
        const x = marginLeft + (parseInt(time) / maxTime) * width;
        const y = marginTop + height - (dataPoints[i] / maxValue) * height;
        
        if (i === 0) {
            d += `${x},${y}`;
        } else {
            d += ` L${x},${y}`;
        }
    });
    
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-width", "2");
    
    return path;
}

/**
 * Create axis and grid lines
 */
function createAxis(svg, maxTime, maxWpm, maxErrors, width, height, marginLeft, marginBottom, marginTop) {
    const svgNS = "http://www.w3.org/2000/svg";
    
    // Create X and Y axis
    const xAxis = document.createElementNS(svgNS, "line");
    xAxis.setAttribute("x1", marginLeft);
    xAxis.setAttribute("y1", marginTop + height);
    xAxis.setAttribute("x2", marginLeft + width);
    xAxis.setAttribute("y2", marginTop + height);
    xAxis.setAttribute("stroke", "#999");
    xAxis.setAttribute("stroke-width", "1");
    xAxis.setAttribute("class", "axis x-axis");
    
    const yAxis = document.createElementNS(svgNS, "line");
    yAxis.setAttribute("x1", marginLeft);
    yAxis.setAttribute("y1", marginTop);
    yAxis.setAttribute("x2", marginLeft);
    yAxis.setAttribute("y2", marginTop + height);
    yAxis.setAttribute("stroke", "#999");
    yAxis.setAttribute("stroke-width", "1");
    yAxis.setAttribute("class", "axis y-axis");
    
    svg.appendChild(xAxis);
    svg.appendChild(yAxis);
    
    // Create X-axis labels
    const timeStep = Math.ceil(maxTime / 5);
    for (let t = 0; t <= maxTime; t += timeStep) {
        const x = marginLeft + (t / maxTime) * width;
        
        // Draw grid line
        const gridLine = document.createElementNS(svgNS, "line");
        gridLine.setAttribute("x1", x);
        gridLine.setAttribute("y1", marginTop);
        gridLine.setAttribute("x2", x);
        gridLine.setAttribute("y2", marginTop + height);
        gridLine.setAttribute("stroke", "#eee");
        gridLine.setAttribute("stroke-width", "1");
        gridLine.setAttribute("class", "grid-line x-grid-line");
        svg.appendChild(gridLine);
        
        // Draw tick
        const tick = document.createElementNS(svgNS, "line");
        tick.setAttribute("x1", x);
        tick.setAttribute("y1", marginTop + height);
        tick.setAttribute("x2", x);
        tick.setAttribute("y2", marginTop + height + 5);
        tick.setAttribute("stroke", "#999");
        tick.setAttribute("stroke-width", "1");
        tick.setAttribute("class", "tick x-tick");
        svg.appendChild(tick);
        
        // Add label
        const label = document.createElementNS(svgNS, "text");
        label.setAttribute("x", x);
        label.setAttribute("y", marginTop + height + 20);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("font-size", "12");
        label.setAttribute("fill", "#666");
        label.setAttribute("class", "axis-label x-label");
        label.textContent = `${t}s`;
        svg.appendChild(label);
    }
    
    // Create Y-axis labels for WPM
    const wpmStep = Math.ceil(maxWpm / 5);
    for (let w = 0; w <= maxWpm; w += wpmStep) {
        const y = marginTop + height - (w / maxWpm) * height;
        
        // Draw grid line
        const gridLine = document.createElementNS(svgNS, "line");
        gridLine.setAttribute("x1", marginLeft);
        gridLine.setAttribute("y1", y);
        gridLine.setAttribute("x2", marginLeft + width);
        gridLine.setAttribute("y2", y);
        gridLine.setAttribute("stroke", "#eee");
        gridLine.setAttribute("stroke-width", "1");
        gridLine.setAttribute("class", "grid-line y-grid-line");
        svg.appendChild(gridLine);
        
        // Draw tick
        const tick = document.createElementNS(svgNS, "line");
        tick.setAttribute("x1", marginLeft - 5);
        tick.setAttribute("y1", y);
        tick.setAttribute("x2", marginLeft);
        tick.setAttribute("y2", y);
        tick.setAttribute("stroke", "#999");
        tick.setAttribute("stroke-width", "1");
        tick.setAttribute("class", "tick y-tick");
        svg.appendChild(tick);
        
        // Add label
        const label = document.createElementNS(svgNS, "text");
        label.setAttribute("x", marginLeft - 10);
        label.setAttribute("y", y + 4);
        label.setAttribute("text-anchor", "end");
        label.setAttribute("font-size", "12");
        label.setAttribute("fill", "#666");
        label.setAttribute("class", "axis-label y-label");
        label.textContent = `${w}`;
        svg.appendChild(label);

    }
}