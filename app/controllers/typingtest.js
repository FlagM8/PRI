
document.addEventListener('DOMContentLoaded', function() { 
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

    startTestButton.addEventListener('click', startTest);
    typingInput.addEventListener('input', checkInput);
    retryButton.addEventListener('click', resetTest);
    
    if (saveButton) {
        saveButton.addEventListener('click', saveResults);
    }


    function startTest() {
        testConfigArea.style.display = 'none';
        testArea.style.display = 'block';
        resultsArea.style.display = 'none';
        
        const languageId = languageSelect.value;
        testDuration = parseInt(durationSelect.value);
        timeLeft = testDuration;
        
        timeRemaining.textContent = timeLeft;
        resultDuration.textContent = testDuration + 's';
        
        fetchTestText(languageId);
    }

    function fetchTestText(languageId) {
        fetch(`api/get_language_words.php?language_id=${languageId}`)
            .then(response => {
                console.log('Response status:', response.status); 
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data); 
                if (data.success) {
                    const wordList = data.words.split(',').map(word => word.trim()); // Split words by comma, trim spaces
                    testText = generateInfiniteWords(wordList); // Generate "infinite" words, unless you type above 200 wpm and are willing to waste 5 minutes of your life
                    displayText(); //displays the ui
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
                console.error('Error fetching words:', error); 
                alert('Error fetching words. Please try again.');
            });
    }

    function generateInfiniteWords(wordList) {
        const infiniteWords = [];
        while (infiniteWords.length < 1000) { 
            const shuffled = [...wordList].sort(() => Math.random() - 0.5); // Shuffle the words by creating a shallow copy and sorting randomly
            infiniteWords.push(...shuffled); //push the shuffled words into the infiniteWords array
        }
        return infiniteWords;
    }


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
            
            if (index < testText.length - 1) {
                const spaceSpan = document.createElement('span');
                spaceSpan.className = 'char space';
                spaceSpan.textContent = ' ';
                textDisplay.appendChild(spaceSpan);
            }
        });
    }

    function updateTimer() {
        timeLeft--;
        timeRemaining.textContent = timeLeft;
        
        calculateWPM();
        
        trackProgress();
        
        if (timeLeft <= 0) {
            endTest();
        }
    }

    function checkInput() {
        if (!testStarted) return;
        
        const words = textDisplay.querySelectorAll('.word'); 
        const currentWord = words[currentWordIndex]; 
        const typedValue = typingInput.value;
        
        const wordText = testText[currentWordIndex]; 
        
        const chars = currentWord.querySelectorAll('.char'); 
        
        for (let i = 0; i < chars.length; i++) { 
            if (i < typedValue.length) { 
                chars[i].classList.remove('current');
                
                if (typedValue[i] === wordText[i]) {
                    chars[i].classList.add('correct');
                    chars[i].classList.remove('incorrect');
                } else {
                    chars[i].classList.add('incorrect');
                    chars[i].classList.remove('correct');
                    
                    if (!errorChars[wordText[i]]) {
                        errorChars[wordText[i]] = 0;
                    }
                    errorChars[wordText[i]]++;
                }
            } else {
                chars[i].classList.remove('correct');
                chars[i].classList.remove('incorrect');
                
                if (i === typedValue.length) {
                    chars[i].classList.add('current');
                } else {
                    chars[i].classList.remove('current');
                }
            }
        }
        
        if (typedValue.endsWith(' ') || (typedValue.length === wordText.length && currentWordIndex === testText.length - 1)) {
            const typedWord = typedValue.trim();
            for (let i = 0; i < Math.min(typedWord.length, wordText.length); i++) {
                if (typedWord[i] === wordText[i]) {
                    correctChars++;
                }
            }
            totalChars += wordText.length;
            
            if (typedWord !== wordText) {
                if (!errorWords[wordText]) {
                    errorWords[wordText] = 0;
                }
                errorWords[wordText]++;
            }
            
            currentWord.classList.remove('current');
            currentWordIndex++;
            typingInput.value = '';
            
            if (currentWordIndex < testText.length) {
                words[currentWordIndex].classList.add('current');
            } else {
                endTest();
            }
        }
        
        calculateAccuracy();
    }


    function calculateWPM() {
        if (testStarted) {
            const timeElapsed = (testDuration - timeLeft) / 60; 
            const wpm = timeElapsed > 0 ? Math.round((correctChars / 5) / timeElapsed) : 0;
            
            currentWpm.textContent = wpm;
        }
    }

    function calculateAccuracy() {
        if (totalChars > 0) {
            const accuracy = Math.round((correctChars / totalChars) * 100);
            currentAccuracy.textContent = accuracy;
        }
    }


    function trackProgress() {
        if (testStarted) {
            const timeElapsed = testDuration - timeLeft;
            const wpm = parseInt(currentWpm.textContent);
            const errors = Object.keys(errorChars).reduce((sum, key) => sum + errorChars[key], 0); // gets array of keys, sum up values, adds each value to an accumulator sum
            
            progressData[timeElapsed] = {
                wpm: wpm,
                errors: errors
            };
        }
    }

    function endTest() {
        clearInterval(timer);
        testStarted = false;
        
        testArea.style.display = 'none';
        resultsArea.style.display = 'block';
        
        resultWpm.textContent = currentWpm.textContent;
        resultAccuracy.textContent = currentAccuracy.textContent + '%';
        
        drawProgressGraph();
        
        showCharHeatmap();
        
        showProblematicWords();
    }

    function drawProgressGraph() {
        const graphContainer = document.getElementById('progress-graph');
        graphContainer.innerHTML = '';
        
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 200;
        graphContainer.appendChild(canvas);
        
        const ctx = canvas.getContext('2d'); 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.beginPath();
        ctx.moveTo(40, 20);
        ctx.lineTo(40, 180);
        ctx.lineTo(380, 180);
        ctx.strokeStyle = '#333';
        ctx.stroke();
        
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
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('Time (s)', 200, 195);
        ctx.save();
        ctx.rotate(-Math.PI/2);
        ctx.fillText('WPM', -100, 20);
        ctx.restore();
    }

    function showCharHeatmap() {
        const heatmapContainer = document.getElementById('char-heatmap');
        heatmapContainer.innerHTML = '';
        
        const sortedChars = Object.entries(errorChars)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); 
        
        sortedChars.forEach(([char, count]) => {
            const charDiv = document.createElement('div');
            charDiv.className = 'heat-char';
            charDiv.innerHTML = `<span class="char-value">${char}</span><span class="char-count">${count}</span>`;
            
            const intensity = Math.min(count * 20, 100);
            charDiv.style.backgroundColor = `rgba(255, 99, 71, ${intensity/100})`;
            
            heatmapContainer.appendChild(charDiv);
        });
    }


    function showProblematicWords() {
        const wordsContainer = document.getElementById('problematic-words');
        wordsContainer.innerHTML = '';
        
        const sortedWords = Object.entries(errorWords)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); 
        
        sortedWords.forEach(([word, count]) => {
            const li = document.createElement('li');
            li.textContent = `${word} (${count})`;
            wordsContainer.appendChild(li);
        });
    }

    function resetTest() {
        clearInterval(timer);
        currentWordIndex = 0;
        correctChars = 0;
        totalChars = 0;
        errorChars = {};
        errorWords = {};
        progressData = {};
        testStarted = false;
        
        resultsArea.style.display = 'none';
        testConfigArea.style.display = 'block';
    }

    function saveResults() {
        const wpm = parseInt(currentWpm.textContent);
        const accuracy = parseInt(currentAccuracy.textContent);
        const languageId = languageSelect.value;

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