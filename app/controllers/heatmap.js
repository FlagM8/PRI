/**
 * Character Heatmap Generator
 * Creates a visual heatmap of typing errors by character
 */
function generateHeatmap(mistakesByChar) {
    const container = document.getElementById('char-heatmap');
    container.innerHTML = '';
    
    // If no mistakes, show a message
    if (Object.keys(mistakesByChar).length === 0) {
        const message = document.createElement('p');
        message.textContent = 'No errors detected! Perfect typing!';
        message.className = 'no-errors-message';
        container.appendChild(message);
        return;
    }
    
    // Find the maximum error count for color scaling
    const maxErrors = Math.max(...Object.values(mistakesByChar));
    
    // Sort characters by error count (descending)
    const sortedChars = Object.entries(mistakesByChar)
        .sort((a, b) => b[1] - a[1]);
    
    // Create keyboard layouts
    const layouts = {
        'alphabetic': createAlphabeticLayout(sortedChars, maxErrors),
        'logographic': createListLayout(sortedChars, maxErrors)
    };
    
    // Determine layout type based on language
    const layoutType = currentLanguage && currentLanguage.type || 'alphabetic';
    container.appendChild(layouts[layoutType]);
}

/**
 * Creates a keyboard layout heatmap for alphabetic languages
 */
function createAlphabeticLayout(sortedChars, maxErrors) {
    const keyboardDiv = document.createElement('div');
    keyboardDiv.className = 'keyboard-heatmap';
    
    // Standard QWERTY keyboard layout
    const keyboardLayout = [
        ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
        ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
        ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
        ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
        ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Menu', 'Ctrl']
    ];
    
    // Convert sortedChars to a lookup object for easy access
    const errorCounts = {};
    sortedChars.forEach(([char, count]) => {
        errorCounts[char.toLowerCase()] = count;
    });
    
    // Create each row of the keyboard
    keyboardLayout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        
        row.forEach(key => {
            const keyDiv = document.createElement('div');
            keyDiv.className = 'keyboard-key';
            const lowerKey = key.toLowerCase();
            
            // Custom classes for special keys
            if (['backspace', 'tab', 'caps', 'shift', 'enter', 'ctrl', 'win', 'alt', 'menu', 'space'].includes(lowerKey)) {
                keyDiv.classList.add(`key-${lowerKey}`);
            }
            
            // Set the key text
            keyDiv.textContent = key;
            
            // Apply heat if there are errors for this key
            if (errorCounts[lowerKey]) {
                const errorRatio = errorCounts[lowerKey] / maxErrors;
                const heatColor = getHeatColor(errorRatio);
                keyDiv.style.backgroundColor = heatColor;
                
                // Add error count as data attribute
                keyDiv.dataset.errors = errorCounts[lowerKey];
                keyDiv.title = `${lowerKey}: ${errorCounts[lowerKey]} errors`;
                
                // Add heat class for styling
                keyDiv.classList.add('key-heat');
            }
            
            rowDiv.appendChild(keyDiv);
        });
        
        keyboardDiv.appendChild(rowDiv);
    });
    
    return keyboardDiv;
}

/**
 * Creates a list layout heatmap for logographic languages
 */
function createListLayout(sortedChars, maxErrors) {
    const listDiv = document.createElement('div');
    listDiv.className = 'char-list-heatmap';
    
    // Show only top 20 most problematic characters
    const topChars = sortedChars.slice(0, 20);
    
    topChars.forEach(([char, count]) => {
        const charDiv = document.createElement('div');
        charDiv.className = 'char-item';
        
        const errorRatio = count / maxErrors;
        const heatColor = getHeatColor(errorRatio);
        
        charDiv.style.backgroundColor = heatColor;
        charDiv.innerHTML = `<span class="char-value">${char}</span><span class="char-count">${count}</span>`;
        
        listDiv.appendChild(charDiv);
    });
    
    return listDiv;
}

/**
 * Generate a heat color based on the error ratio
 * Red (high errors) to Green (low errors)
 */
function getHeatColor(ratio) {
    // Color ranges from light pink to dark red
    const r = Math.floor(255);
    const g = Math.floor(255 * (1 - ratio * 0.8));
    const b = Math.floor(255 * (1 - ratio));
    return `rgb(${r}, ${g}, ${b})`;
}