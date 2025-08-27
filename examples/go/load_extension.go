/*
This example uses the package `mattn/go-sqlite3`
https://pkg.go.dev/modernc.org/sqlite

Install:
	`go get github.com/mattn/go-sqlite3`
*/

package main

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/mattn/go-sqlite3"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	// Register the SQLite driver with extensions enabled
	sql.Register("sqlite3_with_extensions",
		&sqlite3.SQLiteDriver{
			Extensions: []string{
				// Path to your compiled extension (.dylib for macOS/iOS, .so for linux/Android, .dll for Windows)
				// Using `https://github.com/sqliteai/sqlite-js` extension as an example
				"./js",
			},
		})

	// Open database with custom driver that has extensions
	db, err := sql.Open("sqlite3_with_extensions", ":memory:")
	if err != nil {
		log.Fatal("Failed to open database:", err)
	}
	defer db.Close()

	var version string
	err = db.QueryRow("SELECT js_version();").Scan(&version)
	if err != nil {
		log.Fatal("Failed to execute js_version():", err)
	}

	fmt.Printf("AI Version: %s\n", version)
}
