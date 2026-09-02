const databaseName = 'movieTrackerDb';
const tableName = 'clientHashCache';

function openDb() {
  const request = indexedDB.open(databaseName, 1);

  return new Promise<IDBDatabase>((resolve, reject) => {
    request.onupgradeneeded = () => {
      request.result.createObjectStore(tableName);
    }

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function get(key: IDBValidKey): Promise<string> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const request = (
      db.transaction(tableName).objectStore(tableName).get(key)
    );
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function set(key: IDBValidKey, value: unknown) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const request = (
      db.transaction(tableName, 'readwrite')
      .objectStore(tableName)
      .put(value, key)
    );

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
