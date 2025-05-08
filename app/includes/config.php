<?php
// Configuration settings for the typing test application

// Database configuration
define('DB_PATH', getenv('DB_PATH') ?: __DIR__ . '/../data/typing_test.db');

// XML paths
define('XML_SCHEMA_PATH', __DIR__ . '/../xml/schemas');
define('XML_TEMPLATE_PATH', __DIR__ . '/../xml/templates');
define('XML_TRANSFORM_PATH', __DIR__ . '/../xml/transformations');

// Session configuration
ini_set('session.cookie_httponly', 1);
session_start();

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Function to validate XML with XSD
function validate_xml($xml_string, $xsd_file) {
    libxml_use_internal_errors(true);
    
    $xml = new DOMDocument();
    $xml->loadXML($xml_string);
    
    if (!$xml->schemaValidate($xsd_file)) {
        $errors = libxml_get_errors();
        libxml_clear_errors();
        return ['valid' => false, 'errors' => $errors];
    }
    
    return ['valid' => true, 'errors' => []];
}

// Function to transform XML using XSL
function transform_xml($xml_string, $xsl_file) {
    $xml = new DOMDocument();
    $xml->loadXML($xml_string);
    
    $xsl = new DOMDocument();
    $xsl->load($xsl_file);
    
    $processor = new XSLTProcessor();
    $processor->importStylesheet($xsl);
    
    return $processor->transformToXML($xml);
}

function initialize_database() {
    $db = new PDO('sqlite:' . DB_PATH);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

//     // Create the languages table if it doesn't exist
//     $db->exec("
//         CREATE TABLE IF NOT EXISTS languages (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             name TEXT NOT NULL,
//             type TEXT NOT NULL
//         )
//     ");

//     // Optionally, insert default data if the table is empty
//     $stmt = $db->query("SELECT COUNT(*) FROM languages");
//     if ($stmt->fetchColumn() == 0) {
//         $db->exec("
//             INSERT INTO languages (name, type) VALUES
//             ('English', 'alphabetic'),
//             ('French', 'alphabetic'),
//             ('German', 'alphabetic'),
//             ('Chinese', 'logographic'),
//             ('Japanese', 'logographic')
//         ");
//     }
}

// // Initialize the database
 initialize_database();
?>