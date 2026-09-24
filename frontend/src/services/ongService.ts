import type { Ong } from "../components/ong/OngCard";

// Endereço do backend. O organizador pode ajustar depois.
const API_URL = "http://localhost:3000";

export type NovaOng = Omit<Ong, "id"> & { senha: string };

export async function listarOngs(alimento?: string): Promise<Ong[]> {
  const query = alimento ? `?alimento=${encodeURIComponent(alimento)}` : "";
  const resposta = await fetch(`${API_URL}/ongs${query}`);
  if (!resposta.ok) throw new Error("Erro ao listar ONGs");
  return resposta.json();
}

export async function buscarOng(id: number): Promise<Ong> {
  const resposta = await fetch(`${API_URL}/ongs/${id}`);
  if (!resposta.ok) throw new Error("ONG não encontrada");
  return resposta.json();
}

export async function cadastrarOng(dados: NovaOng): Promise<Ong> {
  const resposta = await fetch(`${API_URL}/ongs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!resposta.ok) throw new Error("Erro ao cadastrar ONG");
  return resposta.json();
}

export async function atualizarOng(
  id: number,
  dados: Partial<Omit<Ong, "id">>
): Promise<Ong> {
  const resposta = await fetch(`${API_URL}/ongs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!resposta.ok) throw new Error("Erro ao atualizar ONG");
  return resposta.json();
}