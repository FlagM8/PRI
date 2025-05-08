<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/database.php';

$auth = new Auth();
if (!$auth->isLoggedIn()) {
    header('Location: login.php');
    exit;
}

$db = Database::getInstance(); // Use the singleton instance
$userId = $auth->getCurrentUserId();
$username = $auth->getCurrentUsername();

// Fetch user statistics
$tests = $db->getTestResults($userId, 100); // Fetch up to 100 tests
$totalTests = count($tests);
$personalBest = null;
$avgWpm = 0;
$avgAccuracy = 0;
$mostTakenTest = [];
$problematicWords = [];

if ($totalTests > 0) {
    $totalWpm = 0;
    $totalAccuracy = 0;
    $testCounts = [];

    foreach ($tests as $test) {
        $totalWpm += $test['wpm'];
        $totalAccuracy += $test['accuracy'];

        $testKey = $test['language_name'] . ' (' . $test['language_type'] . ')';
        if (!isset($testCounts[$testKey])) {
            $testCounts[$testKey] = 0;
        }
        $testCounts[$testKey]++;

        // Track personal best
        if (!$personalBest || $test['wpm'] > $personalBest['wpm']) {
            $personalBest = $test;
        }
    }

    $avgWpm = round($totalWpm / $totalTests, 2);
    $avgAccuracy = round($totalAccuracy / $totalTests, 2);

    // Find the most taken test
    arsort($testCounts);
    $mostTakenTest = array_key_first($testCounts);

    // Fetch problematic words from the most recent test
    $latestTestDetails = $db->getTestDetails($tests[0]['id']);
    if ($latestTestDetails && isset($latestTestDetails['problematic_words'])) {
        $problematicWords = $latestTestDetails['problematic_words'];
    }
}

// Handle test details request
if (isset($_GET['test_id'])) {
    try {
        $testId = (int) $_GET['test_id'];
        $testXml = $db->generateTestXml($testId);

        // Transform XML using XSL
        $xslPath = XML_TRANSFORM_PATH . '/tests.xsl';
        $html = transform_xml($testXml, $xslPath);

        echo $html;
    } catch (Exception $e) {
        echo '<p>Error: ' . htmlspecialchars($e->getMessage()) . '</p>';
    }
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile - Typing Speed Test</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <header>
        <div class="container">
            <h1>Typing Speed Test</h1>
            <nav>
                <ul>
                    <li><a href="index.php">Home</a></li>
                    <li><a href="test.php">Take Test</a></li>
                    <li><a href="profile.php" class="active">Profile</a></li>
                    <li><a href="logout.php">Logout (<?= htmlspecialchars($username) ?>)</a></li>
                </ul>
            </nav>
        </div>
    </header>
    
    <main>
        <div class="container">
            <section class="profile-summary">
                <h2>Welcome, <?= htmlspecialchars($username) ?></h2>
                <div class="stats">
                    <p><strong>Total Tests Taken:</strong> <?= $totalTests ?></p>
                    <p><strong>Average WPM:</strong> <?= $avgWpm ?></p>
                    <p><strong>Average Accuracy:</strong> <?= $avgAccuracy ?>%</p>
                    <p><strong>Most Taken Test:</strong> <?= htmlspecialchars($mostTakenTest) ?></p>
                    <?php if ($personalBest): ?>
                        <p><strong>Personal Best:</strong> <?= $personalBest['wpm'] ?> WPM (<?= $personalBest['accuracy'] ?>% accuracy)</p>
                    <?php endif; ?>
                </div>
            </section>
            
            <section class="problematic-words">
                <h3>Problematic Words (Most Recent Test)</h3>
                <?php if (!empty($problematicWords)): ?>
                    <ul>
                        <?php foreach ($problematicWords as $word => $count): ?>
                            <li><?= htmlspecialchars($word) ?> (<?= $count ?> errors)</li>
                        <?php endforeach; ?>
                    </ul>
                <?php else: ?>
                    <p>No problematic words found.</p>
                <?php endif; ?>
            </section>
            
            <section class="test-history">
                <h3>Test History</h3>
                <?php if ($totalTests > 0): ?>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Language</th>
                                <th>WPM</th>
                                <th>Accuracy</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($tests as $test): ?>
                                <tr>
                                    <td><?= htmlspecialchars($test['date']) ?></td>
                                    <td><?= htmlspecialchars($test['language_name']) ?> (<?= htmlspecialchars($test['language_type']) ?>)</td>
                                    <td><?= htmlspecialchars($test['wpm']) ?></td>
                                    <td><?= htmlspecialchars($test['accuracy']) ?>%</td>
                                    <td><a href="profile.php?test_id=<?= htmlspecialchars($test['id']) ?>" class="button secondary">Show Details</a></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php else: ?>
                    <p>No tests taken yet.</p>
                <?php endif; ?>
            </section>
        </div>
    </main>
    
    <footer>
        <div class="container">
            <p>&copy; <?= date('Y') ?> Typing Speed Test</p>
        </div>
    </footer>
</body>
</html>
