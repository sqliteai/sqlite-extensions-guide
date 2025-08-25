# SQLite Extensions in Expo/React Native

A comprehensive guide to integrating SQLite extensions in Expo and React Native applications using OP-SQLite.

## 🤖 Android Setup

### Step 1: Download Android Extension

1. Go to [sqlite-sync releases](https://github.com/sqliteai/sqlite-sync/releases)
2. Download your preferred .zip architecture releases:
    - arm64-v8a - Modern 64-bit ARM devices (recommended for most users)
    - x86_64 - 64-bit x86 emulators and Intel-based devices

### Step 2: Place Extension Files

Extract the `.so` files in the following directory structure:

```
/android
  /app
    /src
      /main
        /jniLibs
          /arm64-v8a
            cloudsync.so
          /x86_64
            cloudsync.so
```

> **Note:** Create the `jniLibs` directory structure if it doesn't exist.

## 🍎 iOS Setup

### Step 1: Download iOS Extension

1. Go to [sqlite-sync releases](https://github.com/sqliteai/sqlite-sync/releases)
2. Download the `cloudsync-apple-xcframework-*.zip`
3. Extract `CloudSync.xcframework`

### Step 2: Add Framework to Project

1. Place the framework in your project:
   ```
   /ios
     /[app-name]
       /Frameworks
         /CloudSync.xcframework
   ```

2. **Open Xcode:**
   - Open Existing Project → Select your Expo app's `ios` folder
   - Click on your app name (top left, with Xcode logo)

3. **Configure Target:**
   - Go to **Targets** → **[app-name]** → **General** tab
   - Scroll down to **"Frameworks, Libraries, and Embedded Content"**
   - Click **"+"** → **"Add Other…"** → **"Add Files…"**
   - Select `/ios/[app-name]/Frameworks/CloudSync.xcframework`

4. **Set Embed Options:**
   - Ensure the **"Embed"** column shows either:
     - **"Embed & Sign"** (recommended)
     - **"Embed Without Signing"**

5. **Verify Build Phases:**
   - Go to **"Build Phases"** tab
   - Check that **"Embed Frameworks"** section contains **CloudSync**

6. Close Xcode

## 📦 Install OP-SQLite

### For React Native:
```bash
npm install @op-engineering/op-sqlite
npx pod-install
```

### For Expo:
```bash
npx expo install @op-engineering/op-sqlite
npx expo prebuild
```

## 💻 Implementation

### Basic Setup

```javascript
import { getDylibPath, open } from "@op-engineering/op-sqlite";
import { Platform } from 'react-native';

// Open database connection
const db = open({ name: 'to-do-app' });
```

### Load Extension

```javascript
const loadCloudSyncExtension = async () => {
  let extensionPath;

  console.log('Loading CloudSync extension...');
  
  try {
    if (Platform.OS === "ios") {
      extensionPath = getDylibPath("ai.sqlite.cloudsync", "CloudSync");
    } else {
      extensionPath = 'cloudsync';
    }

    // Load the extension
    db.loadExtension(extensionPath);

    // Verify extension loaded successfully
    const version = await db.execute('SELECT cloudsync_version();');
    console.log(`CloudSync extension loaded successfully, version: ${version.rows[0]['cloudsync_version()']}`);
    
    return true;
  } catch (error) {
    console.error('Error loading CloudSync extension:', error);
    return false;
  }
};
```

## 📚 Usage Examples

For comprehensive usage examples and best practices, refer to the official [Expo to-do-app example](https://github.com/sqliteai/sqlite-sync/tree/main/examples/to-do-app).

## 📝 Additional Resources

- [OP-SQLite Documentation](https://github.com/OP-Engineering/op-sqlite)
- [SQLite Sync Repository](https://github.com/sqliteai/sqlite-sync)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native SQLite Guide](https://reactnative.dev/)

---

**Note**: This setup requires native code generation. Make sure to run `npx expo prebuild` after installing OP-SQLite and adding the extension files.