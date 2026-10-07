import { useCallback, useEffect, useState } from 'react';
import { deleteBackground, loadBackground, prepareImage, saveBackground } from '../lib/imageStore';

/** Imagen de fondo propia: URL lista para CSS, y acciones para subirla o quitarla. */
export function useCustomBackground() {
  const [url, setUrl] = useState<string | null>(null);

  const show = useCallback((blob: Blob | undefined) => {
    setUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return blob ? URL.createObjectURL(blob) : null;
    });
  }, []);

  useEffect(() => {
    loadBackground().then(show).catch(() => {});
  }, [show]);

  /** Reduce, guarda y muestra la imagen. Devuelve su luminosidad (0 oscura – 1 clara). */
  const upload = useCallback(
    async (file: File) => {
      const { blob, luminance } = await prepareImage(file);
      await saveBackground(blob);
      show(blob);
      return luminance;
    },
    [show],
  );

  const remove = useCallback(async () => {
    await deleteBackground();
    show(undefined);
  }, [show]);

  return { url, upload, remove };
}
