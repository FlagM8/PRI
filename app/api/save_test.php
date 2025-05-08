<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/database.php';

header('Content-Type: application/json');

try {
    // Get raw XML input
    $xmlInput = file_get_contents('php://input');

    // Validate XML against the schema
    $xsdPath = XML_SCHEMA_PATH . '/tests.xsd';
    $dom = new DOMDocument();
    $dom->loadXML($xmlInput);

    if (!$dom->schemaValidate($xsdPath)) {
        throw new Exception('Invalid XML format.');
    }

    // Parse XML
    $xml = simplexml_load_string($xmlInput);
    $info = $xml->info;
    $details = $xml->details;

    // Extract data
    $languageId = (int) $info->language_id;
    $duration = (int) $info->duration;
    $wpm = (float) $info->wpm;
    $accuracy = (float) $info->accuracy;

    $problematicChars = [];
    foreach ($details->problematic_chars->char as $char) {
        $problematicChars[(string) $char['value']] = (int) $char['count'];
    }

    $problematicWords = [];
    foreach ($details->problematic_words->word as $word) {
        $problematicWords[(string) $word['value']] = (int) $word['count'];
    }

    $progressData = [];
    foreach ($details->progress->time_point as $timePoint) {
        $progressData[(int) $timePoint['seconds']] = [
            'wpm' => (float) $timePoint['wpm'],
            'errors' => (int) $timePoint['errors']
        ];
    }

    // Save to database
    $db = new Database();
    $userId = $_SESSION['user_id'] ?? null;

    if (!$userId) {
        throw new Exception('User not logged in.');
    }

    $testId = $db->saveTypingTest($userId, $languageId, $duration, $wpm, $accuracy);
    $db->saveTestDetails($testId, $problematicChars, $problematicWords, $progressData);

    echo json_encode(['success' => true, 'message' => 'Test results saved successfully.']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
