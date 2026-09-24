export interface Ong {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  latitude: number;
  longitude: number;
  descricao: string;
  alimentosAceitos: string[];
}

export type NovaOng = Omit<Ong, "id"> & { senha: string };

// Dados de exemplo.
const ongs: Ong[] = [
  {
    id: 1,
    nome: "ONG Mão Amiga",
    email: "contato@maoamiga.org",
    telefone: "(15) 99999-0001",
    endereco: "Rua das Flores, 100, Sorocaba - SP",
    latitude: -23.5015,
    longitude: -47.4526,
    descricao: "Distribui cestas básicas para famílias da região.",
    alimentosAceitos: ["arroz", "feijão", "macarrão"],
  },
  {
    id: 2,
    nome: "Banco de Alimentos Esperança",
    email: "contato@esperanca.org",
    telefone: "(15) 99999-0002",
    endereco: "Av. Central, 250, Sorocaba - SP",
    latitude: -23.4969,
    longitude: -47.4451,
    descricao: "Recebe alimentos perecíveis e não perecíveis.",
    alimentosAceitos: ["frutas", "verduras", "leite"],
  },
];

export function listarOngs(alimento?: string): Ong[] {
  if (!alimento) return ongs;
  return ongs.filter((ong) =>
    ong.alimentosAceitos.some((a) => a.toLowerCase() === alimento.toLowerCase())
  );
}

export function buscarOngPorId(id: number): Ong | undefined {
  return ongs.find((ong) => ong.id === id);
}

export function cadastrarOng(dados: NovaOng): Ong {
  const { senha, ...semSenha } = dados; // a senha será tratada pelo Supabase Auth
  const nova: Ong = { id: ongs.length + 1, ...semSenha };
  ongs.push(nova);
  return nova;
}

export function atualizarOng(
  id: number,
  dados: Partial<Omit<Ong, "id">>
): Ong | undefined {
  const ong = ongs.find((o) => o.id === id);
  if (!ong) return undefined;
  Object.assign(ong, dados);
  return ong;
}