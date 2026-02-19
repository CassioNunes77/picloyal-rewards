/**
 * Serviço para upload de imagens no ImgBB
 * API: https://api.imgbb.com/
 */

const IMGBB_API_URL = "https://api.imgbb.com/1/upload";

export interface ImgBBUploadResponse {
  data: {
    id: string;
    url: string;
    display_url: string;
    delete_url: string;
  };
}

/**
 * Faz upload de uma imagem em base64 para o ImgBB
 * @param base64Image - string base64 da imagem (com ou sem prefixo data:image/...)
 * @returns URL direta da imagem ou null em caso de erro
 */
export async function uploadImageToImgBB(base64Image: string): Promise<string | null> {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey) {
    console.error("❌ [imgbbService] VITE_IMGBB_API_KEY não configurada no .env");
    return null;
  }

  // Remove prefixo data:image/xxx;base64, se existir
  const base64Data = base64Image.includes(",") ? base64Image.split(",")[1]! : base64Image;

  const formData = new FormData();
  formData.append("key", apiKey);
  formData.append("image", base64Data);

  try {
    const response = await fetch(IMGBB_API_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ [imgbbService] Erro no upload:", response.status, errText);
      return null;
    }

    const json = (await response.json()) as ImgBBUploadResponse;
    return json.data?.url ?? null;
  } catch (error) {
    console.error("❌ [imgbbService] Erro ao fazer upload:", error);
    return null;
  }
}

/**
 * Converte um File para base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
