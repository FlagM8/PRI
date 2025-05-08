<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/database.php';

$auth = new Auth();
$isLoggedIn = $auth->isLoggedIn();
$username = $auth->getCurrentUsername();

$db = new Database();

$languages = $db->getLanguages();


// Group languages by type
$groupedLanguages = [];
foreach ($languages as $language) {
    $type = ucfirst($language['type']); // Capitalize the first letter of the type
    if (!isset($groupedLanguages[$type])) {
        $groupedLanguages[$type] = [];
    }
    $groupedLanguages[$type][] = $language;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Typing Test - Typing Speed Test</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <header>
        <div class="container">
            <h1>Typing Speed Test</h1>
            <nav>
                <ul>
                    <li><a href="index.php">Home</a></li>
                    <li><a href="test.php" class="active">Take Test</a></li>
                    <?php if ($isLoggedIn): ?>
                        <li><a href="profile.php">Profile</a></li>
                        <li><a href="logout.php">Logout (<?= htmlspecialchars($username) ?>)</a></li>
                    <?php else: ?>
                        <li><a href="login.php">Login</a></li>
                        <li><a href="register.php">Register</a></li>
                    <?php endif; ?>
                </ul>
            </nav>
        </div>
    </header>
    
    <main>
        <div class="container">
            <section class="test-section">
                <div class="test-config">
                    <h2>Typing Test</h2>
                    
                    <div class="test-options">
                        <div class="form-group">
                            <label for="language-select">Language:</label>
                            <select id="language-select">
                                <?php foreach ($groupedLanguages as $type => $typeLanguages): ?>
                                    <optgroup label="<?= htmlspecialchars($type) ?>">
                                        <?php foreach ($typeLanguages as $language): ?>
                                            <option value="<?= htmlspecialchars($language['id']) ?>">
                                                <?= htmlspecialchars($language['name']) ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </optgroup>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="duration-select">Duration:</label>
                            <select id="duration-select">
                                <option value="30">30 seconds</option>
                                <option value="60" selected>1 minute</option>
                                <option value="120">2 minutes</option>
                                <option value="300">5 minutes</option>
                            </select>
                        </div>
                        
                        <button id="start-test" class="button primary">Start Test</button>
                    </div>
                </div>
                
                <div class="test-area" style="display: none;">
                    <div class="test-header">
                        <div class="timer">Time: <span id="time-remaining">60</span>s</div>
                        <div class="wpm">WPM: <span id="current-wpm">0</span></div>
                        <div class="accuracy">Accuracy: <span id="current-accuracy">100</span>%</div>
                    </div>
                    
                    <div class="text-display" id="text-display"></div>
                    
                    <div class="input-area">
                        <input type="text" id="typing-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
                    </div>
                </div>
                
                <div class="test-results" style="display: none;">
                    <h2>Test Results</h2>
                    
                    <div class="results-summary">
                        <div class="result-item">
                            <div class="result-label">WPM</div>
                            <div class="result-value" id="result-wpm">0</div>
                        </div>
                        
                        <div class="result-item">
                            <div class="result-label">Accuracy</div>
                            <div class="result-value" id="result-accuracy">0%</div>
                        </div>
                        
                        <div class="result-item">
                            <div class="result-label">Duration</div>
                            <div class="result-value" id="result-duration">0s</div>
                        </div>
                    </div>
                    
                    <div class="results-details">
                        <div class="result-section">
                            <h3>Progress Graph</h3>
                            <div class="progress-graph" id="progress-graph"></div>
                        </div>
                        
                        <div class="result-section">
                            <h3>Character Heatmap</h3>
                            <div class="char-heatmap" id="char-heatmap"></div>
                        </div>
                        
                        <div class="result-section">
                            <h3>Problematic Words</h3>
                            <ul class="problematic-words" id="problematic-words"></ul>
                        </div>
                    </div>
                    
                    <div class="result-actions">
                        <button id="retry-test" class="button secondary">Try Again</button>
                        <?php if ($isLoggedIn): ?>
                            <button id="save-results" class="button primary">Save Results</button>
                        <?php else: ?>
                            <a href="login.php" class="button primary">Login to Save Results</a>
                        <?php endif; ?>
                    </div>
                </div>
            </section>
        </div>
    </main>
    
    <footer>
        <div class="container">
            <p>&copy; <?= date('Y') ?> Typing Speed Test</p>
        </div>
    </footer>
    
    <script src="controllers/typingtest.js"></script>
    <script src="controllers/heatmap.js"></script>
    <script src="controllers/progress-graph.js"></script>
</body>
</html>