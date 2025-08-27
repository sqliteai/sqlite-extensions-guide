import sqlite3
import os

# Path to your compiled extension (.dylib for macOS/iOS, .so for linux/Android, .dll for Windows)
# Using `https://github.com/sqliteai/sqlite-js` extension as an example
EXTENSION_PATH = os.path.abspath("js")

# Connect to SQLite and enable extension loading
conn = sqlite3.connect(":memory:")
conn.enable_load_extension(True)

# Load the extension
try:
    conn.load_extension(EXTENSION_PATH)
    print("Extension loaded successfully.")
except sqlite3.OperationalError as e:
    print(f"Failed to load extension: {e}")

conn.enable_load_extension(False)

# Optionally test it (e.g., call a custom SQL function)
cursor = conn.execute("SELECT js_version();")
print(cursor.fetchone())
