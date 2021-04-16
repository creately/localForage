import idb from './idb';

const TEST_DB_NAME = 'localforage.testdb';

// Firefox Private mode doesn't support IndexedDB, however the only way to detect this
// is by trying to open a database and checking for errors.
function testIndexDBAvailability() {
    return new Promise(function(resolve) {
        if (!idb || !idb.open) {
            resolve(false);
        }

        const request = idb.open(TEST_DB_NAME);

        request.onsuccess = function() {
            return resolve(true);
        };

        request.onerror = function(event) {
            console.warn('IndexedDB unavailable -', request.error);
            return resolve(false);
        };
    });
}

function deleteTestDB() {
    idb.deleteDatabase(TEST_DB_NAME);
}

function isIndexedDBValid() {
    try {
        // Initialize IndexedDB; fall back to vendor-prefixed versions
        // if needed.

        return testIndexDBAvailability().then(function(isAvailable) {
            deleteTestDB();
            return Promise.resolve(isAvailable);
        });

        // We mimic PouchDB here;
        //
        // We test for openDatabase because IE Mobile identifies itself
        // as Safari. Oh the lulz...
        var isSafari =
            typeof openDatabase !== 'undefined' &&
            /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) &&
            !/Chrome/.test(navigator.userAgent) &&
            !/BlackBerry/.test(navigator.platform);

        var hasFetch =
            typeof fetch === 'function' &&
            fetch.toString().indexOf('[native code') !== -1;

        // Safari <10.1 does not meet our requirements for IDB support
        // (see: https://github.com/pouchdb/pouchdb/issues/5572).
        // Safari 10.1 shipped with fetch, we can use that to detect it.
        // Note: this creates issues with `window.fetch` polyfills and
        // overrides; see:
        // https://github.com/localForage/localForage/issues/856
        return (
            (!isSafari || hasFetch) &&
            typeof indexedDB !== 'undefined' &&
            // some outdated implementations of IDB that appear on Samsung
            // and HTC Android devices <4.4 are missing IDBKeyRange
            // See: https://github.com/mozilla/localForage/issues/128
            // See: https://github.com/mozilla/localForage/issues/272
            typeof IDBKeyRange !== 'undefined'
        );
    } catch (e) {
        return false;
    }
}

export default isIndexedDBValid;
