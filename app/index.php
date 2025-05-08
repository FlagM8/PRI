<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/database_init.php'; // Initialize the database

$auth = new Auth();
$isLoggedIn = $auth->isLoggedIn();
$username = $auth->getCurrentUsername();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Typing Speed Test - Home</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <header>
        <div class="container">
            <h1>Typing Speed Test</h1>
            <nav>
                <ul>
                    <li><a href="index.php" class="active">Home</a></li>
                    <li><a href="test.php">Take Test</a></li>
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
            <section>
                <h2>Welcome to Typing Speed Test</h2>
                <p>Improve your typing skills and track your progress with our typing speed test. Choose from various languages and test durations to challenge yourself.</p>
                <div class="actions">
                    <a href="test.php" class="button primary">Take a Test</a>
                    <?php if (!$isLoggedIn): ?>
                        <a href="register.php" class="button secondary">Register</a>
                        <a href="login.php" class="button secondary">Login</a>
                    <?php endif; ?>
                </div>
            </section>
            
            <section>
                <h2>Features</h2>
                <ul>
                    <li>Test your typing speed in multiple languages.</li>
                    <li>Track your progress with detailed graphs and heatmaps.</li>
                    <li>Save your results and compare with others.</li>
                </ul>
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
