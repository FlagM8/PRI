document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const languageSelect = document.getElementById('language-select');
    const durationSelect = document.getElementById('duration-select');
    const startTestBtn = document.getElementById('start-test');
    const testConfigArea = document.querySelector('.test-config');
    const testArea = document.querySelector('.test-area');
    const resultsArea = document.querySelector('.test-results');
    const textDisplay = document.getElementById('text-display');
    const typingInput = document.getElementById('typing-input');
    const timeRemainingEl = document.getElementById('time-remaining');
    const currentWpmEl = document.getElementById('current-wpm');
    const currentAccuracyEl = document.getElementById('current-accuracy');
    const resultWpmEl = document.getElementById('result-wpm');
    const resultAccuracyEl = document.getElementById('result-accuracy');
    const resultDurationEl = document.getElementById('result-duration');
    const retryTestBtn = document.getElementById('retry-test');
    const saveResultsBtn = document.getElementById('save-results');
    
    // Test state
    let testActive = false;
    let testStartTime;
    let testEndTime;
    let timeRemaining;
    let timerInterval;
    let currentLanguage;
    let currentWordIndex = 0;
    let currentCharIndex = 0;
    let correctCharCount = 0;
    let incorrectCharCount = 0;
    let totalTypedChars = 0;
    let testText = [];
    let typedHistory = [];
    let mistakesByChar = {};
    let mistakesByWord = {};
    let progressData = {};
    
    // Sample texts for different languages
    // In a real implementation, these would be fetched from a server
    const sampleTexts = {
        'alphabetic': [
            "The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow. How vexingly quick daft zebras jump! Pack my box with five dozen liquor jugs. Jackdaws love my big sphinx of quartz. Five or six big jet planes zoomed quickly by the tower.",
            "She sells seashells by the seashore. The shells she sells are surely seashells. Peter Piper picked a peck of pickled peppers. A peck of pickled peppers Peter Piper picked. If Peter Piper picked a peck of pickled peppers, where's the peck of pickled peppers Peter Piper picked?",
            "A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine.",
            "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place."
        ],
        'logographic': [
            "你好，世界。这是一个打字测试。我希望你能够快速准确地打字。祝你好运！",
            "春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。",
            "子曰：学而时习之，不亦说乎？有朋自远方来，不亦乐乎？人不知而不愠，不亦君子乎？",
            "おはようございます。これはタイピングテストです。速く正確に入力できることを願っています。"
        ]
    };
    
    // Initialize
    function init() {
        // Event listeners
        startTestBtn.addEventListener('click', startTest);
        typingInput.addEventListener('input', handleTyping);
        retryTestBtn.addEventListener('click', resetTest);
        
        if (saveResultsBtn) {
            saveResultsBtn.addEventListener('click', saveResults);
        }
        
        // Initialize test text based on default language
        updateTestText();
    }
    
    // Start the typing test
    function startTest() {
        if (testActive) return;
        
        // Update test text if needed
        updateTestText();
        
        // Reset state
        testActive = true;
        currentWordIndex = 0;
        currentCharIndex = 0;
        correctCharCount = 0;
        incorrectCharCount = 0;
        totalTypedChars = 0;
        typedHistory = [];
        mistakesByChar = {};
        mistakesByWord = {};
        progressData = {};
        
        // Setup UI
        testConfigArea.style.display = 'none';
        testArea.style.display = 'block';
        resultsArea.style.display = 'none';
        typingInput.value = '';
        typingInput.focus();
        
        // Update display
        renderTestText();
        
        // Start timer
        timeRemaining = parseInt(durationSelect.value);
        timeRemainingEl.textContent = timeRemaining;
        testStartTime = new Date();
        
        timerInterval = setInterval(() => {
            timeRemaining--;
            timeRemainingEl.textContent = timeRemaining;
            
            // Record progress data every 5 seconds
            if (timeRemaining % 5 === 0 || timeRemaining === 0) {
                const elapsedTime = Math.floor((new Date() - testStartTime) / 1000);
                const currentWpm = calculateWPM();
                progressData[elapsedTime] = {
                    wpm: currentWpm,
                    errors: incorrectCharCount
                };
                
                // Update current WPM display
                currentWpmEl.textContent = currentWpm;
                currentAccuracyEl.textContent = calculateAccuracy();
            }
            
            if (timeRemaining <= 0) {
                endTest();
            }
        }, 1000);
    }
    
    // End the typing test
    function endTest() {
        testActive = false;
        clearInterval(timerInterval);
        testEndTime = new Date();
        
        // Calculate final results
        const finalWpm = calculateWPM();
        const finalAccuracy = calculateAccuracy();
        const actualDuration = Math.floor((testEndTime - testStartTime) / 1000);
        
        // Update results display
        resultWpmEl.textContent = finalWpm;
        resultAccuracyEl.textContent = finalAccuracy + '%';
        resultDurationEl.textContent = actualDuration + 's';
        
        // Show results screen
        testArea.style.display = 'none';
        resultsArea.style.display = 'block';
        
        // Generate heatmap and progress graph
        generateHeatmap(mistakesByChar);
        generateProgressGraph(progressData);
        
        // Generate problematic words list
        const problematicWordsEl = document.getElementById('problematic-words');
        problematicWordsEl.innerHTML = 'Hello a tak test';
        
        const sortedWords = Object.entries(mistakesByWord)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        sortedWords.forEach(([word, count]) => {
            const li = document.createElement('li');
            li.textContent = `"${word}" - ${count} error${count > 1 ? 's' : ''}`;
            problematicWordsEl.appendChild(li);
        });
    }
    
    // Reset the test
    function resetTest() {
        clearInterval(timerInterval);
        testActive = false;
        
        // Reset UI
        testConfigArea.style.display = 'block';
        testArea.style.display = 'none';
        resultsArea.style.display = 'none';
    }
    
    // Save test results to the server
    function saveResults() {
        // Only execute if the user is logged in
        const saveResultsBtn = document.getElementById('save-results');
        if (!saveResultsBtn) return;
        
        const finalWpm = calculateWPM();
        const finalAccuracy = calculateAccuracy();
        const duration = parseInt(durationSelect.value);
        const languageId = parseInt(languageSelect.value);
        
        // Prepare data for the AJAX request
        const data = {
            language_id: languageId,
            duration: duration,
            wpm: finalWpm,
            accuracy: finalAccuracy,
            problematic_chars: mistakesByChar,
            problematic_words: mistakesByWord,
            progress_data: progressData
        };
        
        // Send AJAX request to save results
        fetch('save_test.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Results saved successfully!');
            } else {
                alert('Failed to save results: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error saving results:', error);
            alert('An error occurred while saving your results.');
        });
    }
    
    // Update the test text based on selected language
    function updateTestText() {
        const languageId = parseInt(languageSelect.value);
        const languageOption = languageSelect.options[languageSelect.selectedIndex];
        const languageGroup = languageOption.parentNode.label.toLowerCase();
        
        // Get a random sample text for the selected language type
        const textPool = sampleTexts[languageGroup] || sampleTexts['alphabetic'];
        const randomIndex = Math.floor(Math.random() * textPool.length);
        
        // Split the text into words
        testText = textPool[randomIndex].split(' ');
        currentLanguage = {
            id: languageId,
            type: languageGroup
        };
    }
    
    // Render the current test text with proper formatting
    function renderTestText() {
        textDisplay.innerHTML = '';
        
        testText.forEach((word, wordIndex) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = wordIndex === currentWordIndex ? 'current-word' : '';
            
            // Split the word into characters
            [...word].forEach((char, charIndex) => {
                const charSpan = document.createElement('span');
                charSpan.textContent = char;
                
                // Add appropriate class if this is the current word
                if (wordIndex === currentWordIndex) {
                    if (charIndex === currentCharIndex) {
                        charSpan.className = 'current-char';
                    } else if (charIndex < currentCharIndex) {
                        // Check typed history to determine if this character was typed correctly
                        const typedChar = typedHistory[charIndex];
                        if (typedChar === char) {
                            charSpan.className = 'correct-char';
                        } else {
                            charSpan.className = 'incorrect-char';
                        }
                    }
                }
                
                wordSpan.appendChild(charSpan);
            });
            
            textDisplay.appendChild(wordSpan);
            
            // Add space between words
            if (wordIndex < testText.length - 1) {
                const spaceSpan = document.createElement('span');
                spaceSpan.textContent = ' ';
                spaceSpan.className = wordIndex === currentWordIndex ? 'current-space' : '';
                textDisplay.appendChild(spaceSpan);
            }
        });
        
        // Scroll to make sure the current word is visible
        if (currentWordIndex > 0) {
            const currentWordElement = textDisplay.querySelector('.current-word');
            if (currentWordElement) {
                currentWordElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
    
    // Handle typing input
    function handleTyping(e) {
        if (!testActive) return;
        
        const typedValue = typingInput.value;
        const currentWord = testText[currentWordIndex];
        
        // Handle space (word completion)
        if (typedValue.endsWith(' ')) {
            // Evaluate the word
            const typedWord = typedValue.trim();
            evaluateWord(typedWord, currentWord);
            
            // Move to the next word
            currentWordIndex++;
            currentCharIndex = 0;
            typedHistory = [];
            typingInput.value = '';
            
            // Check if we've reached the end of the test text
            if (currentWordIndex >= testText.length) {
                // Get a new text and continue
                updateTestText();
                currentWordIndex = 0;
            }
        } else {
            // Update character index and history
            currentCharIndex = typedValue.length;
            typedHistory = typedValue.split('');
            
            // Evaluate characters
            evaluateChars(typedValue, currentWord);
        }
        
        // Update display
        renderTestText();
        
        // Update WPM and accuracy in real-time
        currentWpmEl.textContent = calculateWPM();
        currentAccuracyEl.textContent = calculateAccuracy();
    }
    
    // Evaluate word accuracy
    function evaluateWord(typed, original) {
        if (typed !== original) {
            // Record the mistake
            mistakesByWord[original] = (mistakesByWord[original] || 0) + 1;
        }
    }
    
    // Evaluate character accuracy
    function evaluateChars(typed, original) {
        const maxLength = Math.max(typed.length, original.length);
        
        for (let i = 0; i < maxLength; i++) {
            const typedChar = typed[i] || '';
            const originalChar = original[i] || '';
            
            // If we have a typed character
            if (typedChar) {
                totalTypedChars++;
                
                // Compare with the original
                if (typedChar === originalChar) {
                    correctCharCount++;
                } else {
                    incorrectCharCount++;
                    
                    // Record mistake by character
                    mistakesByChar[originalChar] = (mistakesByChar[originalChar] || 0) + 1;
                }
            }
        }
    }
    
    // Calculate words per minute
    function calculateWPM() {
        // Standard word length is considered to be 5 characters
        const standardWordLength = 5;
        const elapsedMinutes = (new Date() - testStartTime) / 60000;
        const wordsTyped = totalTypedChars / standardWordLength;
        
        return Math.round(wordsTyped / elapsedMinutes);
    }
    
    // Calculate accuracy percentage
    function calculateAccuracy() {
        if (totalTypedChars === 0) return 100;
        return Math.round((correctCharCount / totalTypedChars) * 100);
    }
    
    // Initialize the app
    init();
});