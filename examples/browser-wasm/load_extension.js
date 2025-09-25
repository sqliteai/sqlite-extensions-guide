/**
 * This example uses the package `@sqliteai/sqlite-wasm`.
 * This version of SQLite WASM is bundled with SQLite Sync and SQLite Vector extensions.
 * Extensions cannot be loaded at runtime in the browser environment.
 * 
 * Run: 
 *     `npm install @sqliteai/sqlite-wasm`
 * and serve the page with:
 *     `npx serve .`
 */

import { sqlite3Worker1Promiser } from '@sqliteai/sqlite-wasm';

const log = console.log;
const error = console.error;

const initializeSQLite = async () => {
  try {
    log('Loading and initializing SQLite3 module with sqlite-sync extension...');

    const promiser = await new Promise((resolve) => {
      const _promiser = sqlite3Worker1Promiser({
        onready: () => resolve(_promiser),
      });
    });

    const configResponse = await promiser('config-get', {});
    log('Running SQLite3 version', configResponse.result.version.libVersion);

    const openResponse = await promiser('open', {
      filename: 'file:mydb.sqlite3',
    });
    const { dbId } = openResponse;
    
    await promiser('exec', { 
        dbId, 
        sql: 'SELECT cloudsync_version();', // or vector_version()
        callback: (result) => {
            if (!result.row) {
                return;
            }
            log('Include SQLite Sync version: ', result.row[0]);
        }
    });

  } catch (err) {
    if (!(err instanceof Error)) {
      err = new Error(err.result.message);
    }
    error(err.name, err.message);
  }
};

initializeSQLite();