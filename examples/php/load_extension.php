<?php
ini_set("sqlite3.extension_dir", "/usr/lib/php/20240924");

/**
 * Install the official SQLite package for PHP in your system.
 * Then, in the PHP ini, uncomment `extension=sqlite3` and set 
 * the path to the SQLite3 extensions directory:
 *      ```
 *      [sqlite3]
 *      ; Directory pointing to SQLite3 extensions
 *      ; https://php.net/sqlite3.extension-dir
 *      sqlite3.extension_dir = <PATH>
 *      ```
 */

$db = new SQLite3(':memory:');

// Name of the  compiled extension (.dylib for macOS/iOS, .so for linux/Android, .dll for Windows).
// The extension file must be located in the directory specified in the configure option `sqlite3.extension_dir`.
// https://www.php.net/manual/en/sqlite3.loadextension.php
$loaded = $db->loadExtension('js.so');
print_r("Extension loaded: " . ($loaded ? "true" : "false") . "\n");

$result = $db->query("SELECT js_version();");
while ($row = $result->fetchArray()) {
    print_r($row);
}
