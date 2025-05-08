<?php
require_once __DIR__ . '/../includes/database.php';

header('Content-Type: application/json');

if (!isset($_GET['language_id'])) {
    echo json_encode(['success' => false, 'message' => 'Language ID is required.']);
    exit;
}

$languageId = intval($_GET['language_id']);
$db = new Database();

$language = $db->getLanguageById($languageId);

if ($language) {
    echo json_encode(['success' => true, 'words' => $language['words']]);
} else {
    echo json_encode(['success' => false, 'message' => 'Language not found.']);
}
?>
