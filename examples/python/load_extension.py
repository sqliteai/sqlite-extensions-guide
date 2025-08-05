import sqlite3
import os

# Path to your compiled extension (.dylib for macOS/iOS, .so for linux/Android, .dll for Windows)
EXTENSION_PATH = os.path.abspath("my_extension.dylib")

# Connect to SQLite and enable extension loading
conn = sqlite3.connect(":memory:")
conn.enable_load_extension(True)

# Load the extension
try:
    conn.load_extension(EXTENSION_PATH)
    print("Extension loaded successfully.")
except sqlite3.OperationalError as e:
    print(f"Failed to load extension: {e}")

# Optionally test it (e.g., call a custom SQL function)
cursor = conn.execute("SELECT my_custom_function(42);")
print(cursor.fetchone())
