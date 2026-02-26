/**
 * Redimensionamento e compressão de imagem para upload leve.
 * Prioriza tamanho sobre qualidade.
 */

const MAX_DIMENSION_PX = 800;
const JPEG_QUALITY = 0.45;

/**
 * Redimensiona e comprime uma imagem para JPEG leve
 * @param file - Arquivo de imagem (JPG, PNG, WebP)
 * @returns Promise com base64 da imagem comprimida
 */
export async function compressImageForUpload(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Canvas context não disponível"));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const { width, height } = img;
      let w = width;
      let h = height;

      if (w > MAX_DIMENSION_PX || h > MAX_DIMENSION_PX) {
        if (w > h) {
          h = Math.round((h * MAX_DIMENSION_PX) / w);
          w = MAX_DIMENSION_PX;
        } else {
          w = Math.round((w * MAX_DIMENSION_PX) / h);
          h = MAX_DIMENSION_PX;
        }
      }

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
      URL.revokeObjectURL(objectUrl);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Falha ao carregar imagem"));
    };
    img.src = objectUrl;
  });
}
