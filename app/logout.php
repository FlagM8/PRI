<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/auth.php';

$auth = new Auth();
$auth->logout();

header('Location: index.php');
exit;
?>