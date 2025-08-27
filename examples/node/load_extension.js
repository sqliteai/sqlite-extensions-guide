/**
 * This example uses the package `better-sqlite3`.
 * Run: `npm install better-sqlite3`
 */

const Database = require("better-sqlite3");
const db = new Database(":memory:");

// Path to your compiled extension (.dylib for macOS/iOS, .so for linux/Android, .dll for Windows)
// Using `https://github.com/sqliteai/sqlite-js` extension as an example
db.loadExtension("./js");

const result = db.prepare("SELECT js_version();").get();
console.log(result);
