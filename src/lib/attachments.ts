const DB_NAME = "openboard.files";
const STORE = "files";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const request = run(transaction.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

export async function putFile(id: string, file: Blob) {
  await tx("readwrite", (store) => store.put(file, id));
}

export async function getFile(id: string) {
  return tx<Blob | undefined>("readonly", (store) => store.get(id) as IDBRequest<Blob | undefined>);
}

export async function deleteFile(id: string) {
  await tx("readwrite", (store) => store.delete(id));
}

export async function getFileUrl(id: string) {
  const blob = await getFile(id);
  return blob ? URL.createObjectURL(blob) : null;
}

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
