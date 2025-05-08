<?php
require_once __DIR__ . '/config.php';

class Database {
    private $pdo;
    
    public function __construct() {
        try {
            $this->pdo = new PDO("sqlite:" . DB_PATH);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->exec('PRAGMA foreign_keys = ON');
        } catch (PDOException $e) {
            die("Database connection failed: " . $e->getMessage());
        }
    }
    
    // User related methods
    public function createUser($username, $password, $email = null) {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        $stmt = $this->pdo->prepare("
            INSERT INTO users (username, password, email)
            VALUES (?, ?, ?)
        ");
        
        return $stmt->execute([$username, $hashed_password, $email]);
    }
    
    public function getUserByUsername($username) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function verifyUser($username, $password) {
        $user = $this->getUserByUsername($username);
        
        if ($user && password_verify($password, $user['password'])) {
            return $user;
        }
        
        return false;
    }
    
    // Language related methods
    public function getLanguages() {
        $stmt = $this->pdo->prepare("SELECT id, name, type FROM langs ORDER BY name ASC");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getLanguageById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM langs WHERE id = ?");
        $stmt->execute([$id]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    // Typing test related methods
    public function saveTypingTest($userId, $languageId, $duration, $wpm, $accuracy) {
        try {
            // Begin transaction
            $this->pdo->beginTransaction();

            // Insert the typing test
            $stmt = $this->pdo->prepare("
                INSERT INTO typing_tests (user_id, language_id, duration, wpm, accuracy)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([$userId, $languageId, $duration, $wpm, $accuracy]);

            // Retrieve the last inserted ID immediately after the insert
            $testId = $this->pdo->lastInsertId();

            // Commit the transaction
            $this->pdo->commit();

            // Return the correct test ID
            return $testId;
        } catch (Exception $e) {
            // Roll back the transaction on error
            $this->pdo->rollBack();
            throw $e;
        }
    }
    
    public function saveTestDetails($testId, $problematicChars, $problematicWords, $progressData) {
        $stmt = $this->pdo->prepare("
            INSERT INTO test_details (test_id, problematic_chars, problematic_words, progress_data)
            VALUES (?, ?, ?, ?)
        ");
        
        return $stmt->execute([
            $testId,
            json_encode($problematicChars),
            json_encode($problematicWords),
            json_encode($progressData)
        ]);
    }
    
    public function getTestResults($userId, $limit = 10) {
        $stmt = $this->pdo->prepare("
            SELECT t.*, l.name as language_name, l.type as language_type, l.id
            FROM typing_tests t
            JOIN langs l ON t.language_id = l.id
            WHERE t.user_id = ?
            ORDER BY t.date DESC
            LIMIT ?
        ");
        
        $stmt->execute([$userId, $limit]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getTestDetails($testId) {
        // Ensure the test ID is correctly retrieved and used
        $stmt = $this->pdo->prepare("
            SELECT * FROM test_details WHERE test_id = ?
        ");
        $stmt->execute([$testId]); // Use the exact test ID provided

        $details = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($details) {
            $details['problematic_chars'] = json_decode($details['problematic_chars'], true);
            $details['problematic_words'] = json_decode($details['problematic_words'], true);
            $details['progress_data'] = json_decode($details['progress_data'], true);
        }

        return $details;
    }
    
    // XML generation methods
    public function generateUserXml($userId) {
        $user = $this->getUserById($userId);
        $tests = $this->getTestResults($userId);
        
        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->formatOutput = true;
        
        $root = $dom->createElement('user');
        $root->setAttribute('id', $user['id']);
        $dom->appendChild($root);
        
        $userInfo = $dom->createElement('info');
        $userInfo->appendChild($dom->createElement('username', $user['username']));
        $userInfo->appendChild($dom->createElement('email', $user['email'] ?? ''));
        $userInfo->appendChild($dom->createElement('created_at', $user['created_at']));
        $root->appendChild($userInfo);
        
        $testsElem = $dom->createElement('tests');
        foreach ($tests as $test) {
            $testElem = $dom->createElement('test');
            $testElem->setAttribute('id', $test['id']);
            
            $testElem->appendChild($dom->createElement('language', $test['language_name']));
            $testElem->appendChild($dom->createElement('type', $test['language_type']));
            $testElem->appendChild($dom->createElement('duration', $test['duration']));
            $testElem->appendChild($dom->createElement('wpm', $test['wpm']));
            $testElem->appendChild($dom->createElement('accuracy', $test['accuracy']));
            $testElem->appendChild($dom->createElement('date', $test['date']));
            
            $testsElem->appendChild($testElem);
        }
        $root->appendChild($testsElem);
        
        return $dom->saveXML();
    }
    
    public function generateTestXml($testId) {
        $test = $this->getTestById($testId);
        if (!$test) {
            throw new Exception("Test with ID $testId not found.");
        }

        $details = $this->getTestDetails($testId);
        $language = $this->getLanguageById($test['language_id']);
        if (!$language) {
            throw new Exception("Language with ID {$test['language_id']} not found.");
        }

        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->formatOutput = true;

        $root = $dom->createElement('typing_test');
        $root->setAttribute('id', (string) $test['id']);
        $dom->appendChild($root);

        $infoElem = $dom->createElement('info');
        $infoElem->appendChild($dom->createElement('language', $language['name'] ?? 'Unknown'));
        $infoElem->appendChild($dom->createElement('type', $language['type'] ?? 'Unknown'));
        $infoElem->appendChild($dom->createElement('duration', (string) ($test['duration'] ?? '0')));
        $infoElem->appendChild($dom->createElement('wpm', (string) ($test['wpm'] ?? '0')));
        $infoElem->appendChild($dom->createElement('accuracy', (string) ($test['accuracy'] ?? '0')));
        $infoElem->appendChild($dom->createElement('date', $test['date'] ?? 'Unknown'));
        $root->appendChild($infoElem);

        if ($details) {
            $detailsElem = $dom->createElement('details');

            $charsElem = $dom->createElement('problematic_chars');
            foreach ($details['problematic_chars'] ?? [] as $char => $count) {
                $charElem = $dom->createElement('char');
                $charElem->setAttribute('value', $char);
                $charElem->setAttribute('count', (string) $count);
                $charsElem->appendChild($charElem);
            }
            $detailsElem->appendChild($charsElem);

            $wordsElem = $dom->createElement('problematic_words');
            foreach ($details['problematic_words'] ?? [] as $word => $count) {
                $wordElem = $dom->createElement('word');
                $wordElem->setAttribute('value', $word);
                $wordElem->setAttribute('count', (string) $count);
                $wordsElem->appendChild($wordElem);
            }
            $detailsElem->appendChild($wordsElem);

            $progressElem = $dom->createElement('progress');
            foreach ($details['progress_data'] ?? [] as $time => $data) {
                $timeElem = $dom->createElement('time_point');
                $timeElem->setAttribute('seconds', (string) $time);
                $timeElem->setAttribute('wpm', (string) ($data['wpm'] ?? '0'));
                $timeElem->setAttribute('errors', (string) ($data['errors'] ?? '0'));
                $progressElem->appendChild($timeElem);
            }
            $detailsElem->appendChild($progressElem);

            $root->appendChild($detailsElem);
        }

        return $dom->saveXML();
    }
    
    private function getUserById($userId) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    private function getTestById($testId) {
        $stmt = $this->pdo->prepare("SELECT * FROM typing_tests WHERE id = ?");
        $stmt->execute([$testId]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>