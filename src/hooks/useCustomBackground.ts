import { useCallback, useEffect, useState } from 'react';
import type { BackgroundStore } from '../data/stores';
import { prepareImage } from '../lib/imageStore';

/** Imagen de fondo propia: URL lista para CSS, y acciones para subirla o quitarla. */
export function useCustomBackground(store: BackgroundStore) {
  const [url, setUrl] = useState<string | null>(null);

  const show = useCallback((blob: Blob | undefined) => {
    setUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return blob ? URL.createObjectURL(blob) : null;
    });
  }, []);

  useEffect(() => {
    store.load().then(show).catch(() => {});
  }, [store, show]);

  /** Reduce, guarda y muestra la imagen. Devuelve su luminosidad (0 oscura – 1 clara). */
  const upload = useCallback(
    async (file: File) => {
      const { blob, luminance } = await prepareImage(file);
      await store.save(blob);
      show(blob);
      return luminance;
    },
    [store, show],
  );

  const remove = useCallback(async () => {
    await store.remove();
    show(undefined);
  }, [store, show]);

  return { url, upload, remove };
}
