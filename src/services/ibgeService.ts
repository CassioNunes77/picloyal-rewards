/**
 * Serviço para consulta à API do IBGE (estados e municípios).
 * 100% gratuito, sem API key.
 */

export interface IbgeState {
  id: number;
  nome: string;
  sigla: string;
}

export interface IbgeCity {
  id: number;
  nome: string;
}

const IBGE_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";

export async function fetchStates(): Promise<IbgeState[]> {
  const res = await fetch(`${IBGE_BASE}/estados?orderBy=nome`);
  const data = await res.json();
  return data;
}

export async function fetchCitiesByState(stateCode: string): Promise<IbgeCity[]> {
  const res = await fetch(`${IBGE_BASE}/estados/${stateCode}/municipios?orderBy=nome`);
  const data = await res.json();
  return data;
}
