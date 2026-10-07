// Imagen de fondo propia del usuario, guardada en IndexedDB (localStorage no alcanza para imágenes).

const DB = 'semanas';
const STORE = 'files';
const KEY = 'background';
const MAX_WIDTH = 2560;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = run(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const loadBackground = () => tx<Blob | undefined>('readonly', (s) => s.get(KEY));
export const saveBackground = (blob: Blob) => tx('readwrite', (s) => s.put(blob, KEY));
export const deleteBackground = () => tx('readwrite', (s) => s.delete(KEY));

/** Reduce la imagen a 2560 px de ancho (webp) y mide su luminosidad promedio (0 oscuro – 1 claro). */
export async function prepareImage(file: File): Promise<{ blob: Blob; luminance: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo procesar la imagen'))), 'image/webp', 0.78),
  );

  const small = document.createElement('canvas');
  small.width = small.height = 32;
  const ctx = small.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, 32, 32);
  const data = ctx.getImageData(0, 0, 32, 32).data;
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  bitmap.close();
  return { blob, luminance: sum / (data.length / 4) / 255 };
}
