/**
 * Typing Test Controller
 * Handles the functionality for the typing speed test
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const startTestButton = document.getElementById('start-test');
    const testConfigArea = document.querySelector('.test-config');
    const testArea = document.querySelector('.test-area');
    const resultsArea = document.querySelector('.test-results');
    const textDisplay = document.getElementById('text-display');
    const typingInput = document.getElementById('typing-input');
    const timeRemaining = document.getElementById('time-remaining');
    const currentWpm = document.getElementById('current-wpm');
    const currentAccuracy = document.getElementById('current-accuracy');
    const resultWpm = document.getElementById('result-wpm');
    const resultAccuracy = document.getElementById('result-accuracy');
    const resultDuration = document.getElementById('result-duration');
    const retryButton = document.getElementById('retry-test');
    const saveButton = document.getElementById('save-results');
    const languageSelect = document.getElementById('language-select');
    const durationSelect = document.getElementById('duration-select');
    
    // Variables
    let timer;
    let timeLeft;
    let testStarted = false;
    let testText = [];
    let currentWordIndex = 0;
    let correctChars = 0;
    let totalChars = 0;
    let errorChars = {};
    let errorWords = {};
    let progressData = {};
    let testDuration;

    // Event Listeners
    startTestButton.addEventListener('click', startTest);
    typingInput.addEventListener('input', checkInput);
    retryButton.addEventListener('click', resetTest);
    
    if (saveButton) {
        saveButton.addEventListener('click', saveResults);
    }

    /**
     * Start the typing test
     */
    function startTest() {
        // Hide config and show test area
        testConfigArea.style.display = 'none';
        testArea.style.display = 'block';
        resultsArea.style.display = 'none';
        
        // Get the selected language and duration
        const languageId = languageSelect.value;
        testDuration = parseInt(durationSelect.value);
        timeLeft = testDuration;
        
        // Update the UI
        timeRemaining.textContent = timeLeft;
        resultDuration.textContent = testDuration + 's';
        
        // Fetch test text based on selected language
        fetchTestText(languageId);
    }

    /**
     * Fetch sample text for the test from the server
     * @param {number} languageId - ID of the selected language
     */
    function fetchTestText(languageId) {
        fetch(`api/get_language_words.php?language_id=${languageId}`)
            .then(response => {
                console.log('Response status:', response.status); // Log response status
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data); // Log response data
                if (data.success) {
                    const wordList = data.words.split(',').map(word => word.trim());
                    testText = generateInfiniteWords(wordList);
                    displayText();
                    typingInput.value = '';
                    typingInput.focus();
                    testStarted = true;
                    timer = setInterval(updateTimer, 1000);
                    trackProgress();
                } else {
                    alert('Failed to fetch words for the selected language: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching words:', error); // Log fetch error
                alert('Error fetching words. Please try again.');
            });
    }

    /**
     * Generate an infinite stream of random words
     * @param {array} wordList - Array of words to shuffle and pick from
     * @return {array} Infinite array of random words
     */
    function generateInfiniteWords(wordList) {
        const infiniteWords = [];
        while (infiniteWords.length < 1000) { // Arbitrary large number to simulate infinity
            const shuffled = [...wordList].sort(() => Math.random() - 0.5);
            infiniteWords.push(...shuffled);
        }
        return infiniteWords;
    }

    /**
     * Display the test text in the UI
     */
    function displayText() {
        textDisplay.innerHTML = '';
        
        testText.forEach((word, index) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = index === 0 ? 'word current' : 'word';
            
            [...word].forEach(char => {
                const charSpan = document.createElement('span');
                charSpan.className = 'char';
                charSpan.textContent = char;
                wordSpan.appendChild(charSpan);
            });
            
            textDisplay.appendChild(wordSpan);
            
            // Add space after word (except last word)
            if (index < testText.length - 1) {
                const spaceSpan = document.createElement('span');
                spaceSpan.className = 'char space';
                spaceSpan.textContent = ' ';
                textDisplay.appendChild(spaceSpan);
            }
        });
    }

    /**
     * Update the timer and end test when time runs out
     */
    function updateTimer() {
        timeLeft--;
        timeRemaining.textContent = timeLeft;
        
        // Update WPM calculation every second
        calculateWPM();
        
        // Track progress for the graph
        trackProgress();
        
        if (timeLeft <= 0) {
            endTest();
        }
    }

    /**
     * Check user input against the test text
     */
    function checkInput() {
        if (!testStarted) return;
        
        const words = textDisplay.querySelectorAll('.word');
        const currentWord = words[currentWordIndex];
        const typedValue = typingInput.value;
        
        // Get the current word text
        const wordText = testText[currentWordIndex];
        
        // Check character by character
        const chars = currentWord.querySelectorAll('.char');
        
        for (let i = 0; i < chars.length; i++) {
            if (i < typedValue.length) {
                chars[i].classList.remove('current');
                
                // Check if character is correct
                if (typedValue[i] === wordText[i]) {
                    chars[i].classList.add('correct');
                    chars[i].classList.remove('incorrect');
                } else {
                    chars[i].classList.add('incorrect');
                    chars[i].classList.remove('correct');
                    
                    // Track problematic characters
                    if (!errorChars[wordText[i]]) {
                        errorChars[wordText[i]] = 0;
                    }
                    errorChars[wordText[i]]++;
                }
            } else {
                chars[i].classList.remove('correct');
                chars[i].classList.remove('incorrect');
                
                // Highlight current position
                if (i === typedValue.length) {
                    chars[i].classList.add('current');
                } else {
                    chars[i].classList.remove('current');
                }
            }
        }
        
        // Check for word completion (space)
        if (typedValue.endsWith(' ') || (typedValue.length === wordText.length && currentWordIndex === testText.length - 1)) {
            // Count correct characters
            const typedWord = typedValue.trim();
            for (let i = 0; i < Math.min(typedWord.length, wordText.length); i++) {
                if (typedWord[i] === wordText[i]) {
                    correctChars++;
                }
            }
            totalChars += wordText.length;
            
            // Track problematic words
            if (typedWord !== wordText) {
                if (!errorWords[wordText]) {
                    errorWords[wordText] = 0;
                }
                errorWords[wordText]++;
            }
            
            // Move to next word
            currentWord.classList.remove('current');
            currentWordIndex++;
            typingInput.value = '';
            
            // If there are more words, highlight the next one
            if (currentWordIndex < testText.length) {
                words[currentWordIndex].classList.add('current');
            } else {
                // End test if all words are typed
                endTest();
            }
        }
        
        // Calculate accuracy
        calculateAccuracy();
    }

    /**
     * Calculate words per minute
     */
    function calculateWPM() {
        if (testStarted) {
            // WPM = (characters typed / 5) / minutes
            const timeElapsed = (testDuration - timeLeft) / 60; // convert to minutes
            const wpm = timeElapsed > 0 ? Math.round((correctChars / 5) / timeElapsed) : 0;
            
            currentWpm.textContent = wpm;
        }
    }

    /**
     * Calculate typing accuracy percentage
     */
    function calculateAccuracy() {
        if (totalChars > 0) {
            const accuracy = Math.round((correctChars / totalChars) * 100);
            currentAccuracy.textContent = accuracy;
        }
    }

    /**
     * Track progress for the graph
     */
    function trackProgress() {
        if (testStarted) {
            const timeElapsed = testDuration - timeLeft;
            const wpm = parseInt(currentWpm.textContent);
            const errors = Object.keys(errorChars).reduce((sum, key) => sum + errorChars[key], 0);
            
            progressData[timeElapsed] = {
                wpm: wpm,
                errors: errors
            };
        }
    }

    /**
     * End the typing test and show results
     */
    function endTest() {
        clearInterval(timer);
        testStarted = false;
        
        // Hide test area and show results
        testArea.style.display = 'none';
        resultsArea.style.display = 'block';
        
        // Show final results
        resultWpm.textContent = currentWpm.textContent;
        resultAccuracy.textContent = currentAccuracy.textContent + '%';
        
        // Draw the progress graph
        drawProgressGraph();
        
        // Show character heatmap
        showCharHeatmap();
        
        // Show problematic words
        showProblematicWords();
    }

    /**
     * Draw the progress graph
     */
    function drawProgressGraph() {
        const graphContainer = document.getElementById('progress-graph');
        graphContainer.innerHTML = '';
        
        // In a real application, use a charting library
        // This is a simple placeholder that creates a basic graph
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 200;
        graphContainer.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw axes
        ctx.beginPath();
        ctx.moveTo(40, 20);
        ctx.lineTo(40, 180);
        ctx.lineTo(380, 180);
        ctx.strokeStyle = '#333';
        ctx.stroke();
        
        // Draw WPM data
        ctx.beginPath();
        let firstPoint = true;
        
        Object.keys(progressData).forEach((time, index) => {
            const x = 40 + (340 * (parseInt(time) / testDuration));
            const y = 180 - (progressData[time].wpm * 2);
            
            if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('Time (s)', 200, 195);
        ctx.save();
        ctx.rotate(-Math.PI/2);
        ctx.fillText('WPM', -100, 20);
        ctx.restore();
    }

    /**
     * Show character heatmap (most problematic characters)
     */
    function showCharHeatmap() {
        const heatmapContainer = document.getElementById('char-heatmap');
        heatmapContainer.innerHTML = '';
        
        // Sort characters by error frequency
        const sortedChars = Object.entries(errorChars)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Top 10
        
        sortedChars.forEach(([char, count]) => {
            const charDiv = document.createElement('div');
            charDiv.className = 'heat-char';
            charDiv.innerHTML = `<span class="char-value">${char}</span><span class="char-count">${count}</span>`;
            
            // Add intensity based on error count
            const intensity = Math.min(count * 20, 100);
            charDiv.style.backgroundColor = `rgba(255, 99, 71, ${intensity/100})`;
            
            heatmapContainer.appendChild(charDiv);
        });
    }

    /**
     * Show problematic words
     */
    function showProblematicWords() {
        const wordsContainer = document.getElementById('problematic-words');
        wordsContainer.innerHTML = '';
        
        // Sort words by error frequency
        const sortedWords = Object.entries(errorWords)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Top 10
        
        sortedWords.forEach(([word, count]) => {
            const li = document.createElement('li');
            li.textContent = `${word} (${count})`;
            wordsContainer.appendChild(li);
        });
    }

    /**
     * Reset the test to try again
     */
    function resetTest() {
        clearInterval(timer);
        currentWordIndex = 0;
        correctChars = 0;
        totalChars = 0;
        errorChars = {};
        errorWords = {};
        progressData = {};
        testStarted = false;
        
        // Hide results and show config
        resultsArea.style.display = 'none';
        testConfigArea.style.display = 'block';
    }

    /**
     * Save test results to the database via XML
     */
    function saveResults() {
        // Get final results
        const wpm = parseInt(currentWpm.textContent);
        const accuracy = parseInt(currentAccuracy.textContent);
        const languageId = languageSelect.value;

        // Construct XML data
        const xmlData = `
            <typing_test>
                <info>
                    <language_id>${languageId}</language_id>
                    <duration>${testDuration}</duration>
                    <wpm>${wpm}</wpm>
                    <accuracy>${accuracy}</accuracy>
                </info>
                <details>
                    <problematic_chars>
                        ${Object.entries(errorChars).map(([char, count]) => `
                            <char value="${char}" count="${count}" />
                        `).join('')}
                    </problematic_chars>
                    <problematic_words>
                        ${Object.entries(errorWords).map(([word, count]) => `
                            <word value="${word}" count="${count}" />
                        `).join('')}
                    </problematic_words>
                    <progress>
                        ${Object.entries(progressData).map(([time, data]) => `
                            <time_point seconds="${time}" wpm="${data.wpm}" errors="${data.errors}" />
                        `).join('')}
                    </progress>
                </details>
            </typing_test>
        `;

        // Send XML data to the server
        fetch('api/save_test.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: xmlData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Test results saved successfully!');
            } else {
                alert('Error saving results: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error saving results:', error);
            alert('Error saving results. Please try again.');
        });
    }
});