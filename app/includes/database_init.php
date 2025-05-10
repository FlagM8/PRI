<?php

$dbPath = __DIR__ . '/../data/typing_test.db';

$dbDir = dirname($dbPath);
if (!file_exists($dbDir)) {
    mkdir($dbDir, 0755, true);
}

try {
    $pdo = new PDO("sqlite:$dbPath");
    
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $pdo->exec('PRAGMA foreign_keys = ON');
    
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            email TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");
    
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS langs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            type TEXT NOT NULL,
            words TEXT NOT NULL
        )
    ");
    
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS typing_tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            language_id INTEGER,
            duration INTEGER NOT NULL,
            wpm REAL NOT NULL,
            accuracy REAL NOT NULL,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (language_id) REFERENCES langs(id)
        )
    ");
    
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS test_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            test_id INTEGER NOT NULL,
            problematic_chars TEXT,
            problematic_words TEXT,
            progress_data TEXT,
            FOREIGN KEY (test_id) REFERENCES typing_tests(id)
        )
    ");
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM langs");
    if ($stmt->fetchColumn() == 0) {
        $languages = [
            ['English', 'natural', 'the, be, to, of, and, a, in, that, have, I, it, for, not, on, with, he, as, you, do, at, this, but, his, by, from, they, we, say, her, she, or, an, will, my, one, all, would, there, their, what, so, up, out, if, about, who, get, which, go, me, can, like, time, no, just, him, know, take, people, into, year, your, good, some, could, them, see, other, than, then, now, look, only, come, its, over, think, also, back, after, use, two, how, our, work, first, well, way, even, new, want, because, any, these, give, day, most, us'],
            ['Czech', 'natural', 'a, že, se, na, v, je, to, jsem, si, z, ale, do, už, jak, tak, když, mě, co, kde, kdo, proč, ano, ne, ty, já, on, ona, my, vy, oni, být, mít, dělat, říkat, vidět, jít, vědět, chtít, přijít, myslet, vzít, dát, používat, najít, říci, pracovat, volat, zkusit, cítit, stát, nechat, začít, ukázat, slyšet, hrát, běžet, psát, číst, mluvit, jíst, pít, spát, učit, učit se, čekat, žít, milovat, nenávidět'],
            ['Python', 'programming', 'def, class, import, from, for, while, if, else, elif, return, print, input, try, except, finally, lambda, yield, pass, break, continue, global, nonlocal, assert, with, as, raise, del, is, in, not, or, and, True, False, None, int, float, str, list, dict, set, tuple, range, len, open, close, read, write, append, extend, insert, remove, pop, clear, sort, reverse, keys, values, items'],
            ['JavaScript', 'programming', 'function, const, let, var, if, else, for, while, return, console, log, document, window, async, await, promise, fetch, JSON, parse, stringify, map, filter, reduce, forEach, push, pop, shift, unshift, slice, splice, indexOf, includes, find, findIndex, keys, values, entries, setTimeout, setInterval, clearTimeout, clearInterval, addEventListener, removeEventListener, querySelector, querySelectorAll, innerHTML, textContent, classList, appendChild, removeChild, createElement'],
            ['PHP', 'programming', 'echo, print, if, else, elseif, for, while, foreach, function, include, require, array, isset, empty, global, static, public, private, protected, abstract, interface, implements, extends, final, const, var, new, clone, try, catch, finally, throw, use, namespace, trait, self, parent, instanceof, __construct, __destruct, __call, __get, __set, __isset, __unset, __toString, __invoke, __clone, __sleep, __wakeup, __serialize, __unserialize,']
        ];
        
        $stmt = $pdo->prepare("INSERT INTO langs (name, type, words) VALUES (?, ?, ?)");
        
        foreach ($languages as $language) {
            $stmt->execute($language);
        }
    }
} catch (PDOException $e) {
    die("Database initialization failed: " . $e->getMessage());
}
?>