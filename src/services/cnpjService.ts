/**
 * Serviço de validação de CNPJ via BrasilAPI
 * https://brasilapi.com.br/api/cnpj/v1/{cnpj}
 */

const BRASIL_API_CNPJ = "https://brasilapi.com.br/api/cnpj/v1";

export type CnpjValidationResult =
  | { valid: true; razaoSocial?: string }
  | { valid: false; error?: string };

/**
 * Valida CNPJ consultando a BrasilAPI.
 * Retorna { valid: true } se o CNPJ existe na Receita Federal.
 * Retorna { valid: false } se não encontrado ou erro na API.
 */
export async function validateCnpj(cnpj: string): Promise<CnpjValidationResult> {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) {
    return { valid: false, error: "CNPJ deve ter 14 dígitos" };
  }

  try {
    const res = await fetch(`${BRASIL_API_CNPJ}/${digits}`);
    if (res.ok) {
      const data = (await res.json()) as { razao_social?: string };
      return { valid: true, razaoSocial: data.razao_social };
    }
    return { valid: false, error: "CNPJ não encontrado" };
  } catch (e) {
    console.warn("[cnpjService] Erro ao validar CNPJ:", e);
    return { valid: false, error: "Erro ao consultar CNPJ" };
  }
}
