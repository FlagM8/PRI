<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/auth.php';

// Initialize auth and logout
$auth = new Auth();
$auth->logout();

// Redirect to homepage
header('Location: index.php');
exit;
?>