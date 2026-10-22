const db = require("../config/supabase");

// Usado só quando o Supabase não está configurado (sem backend/.env).
const mockOngs = [
  {
    id: 1,
    nome: "ONG Mão Amiga",
    email: "contato@maoamiga.org",
    telefone: "(15) 99999-0001",
    endereco: "Rua das Flores, 100, Sorocaba - SP",
    cidade: "Sorocaba - SP",
    latitude: -23.5015,
    longitude: -47.4526,
    descricao: "Distribui cestas básicas para famílias da região.",
    alimentosAceitos: ["Arroz", "Feijão", "Macarrão"],
  },
  {
    id: 2,
    nome: "Banco de Alimentos Esperança",
    email: "contato@esperanca.org",
    telefone: "(15) 99999-0002",
    endereco: "Av. Central, 250, Sorocaba - SP",
    cidade: "Sorocaba - SP",
    latitude: -23.4969,
    longitude: -47.4451,
    descricao: "Recebe alimentos perecíveis e não perecíveis.",
    alimentosAceitos: ["Frutas", "Verduras", "Leite"],
  },
];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Colunas da ONG + alimentos aceitos (ong_food_types -> food_types).
const SELECT =
  "id,profile_id,name,description,phone,street,number,neighborhood,city,state,latitude,longitude," +
  "ong_food_types(food_types(name))";

function montarEndereco(row) {
  const rua = [row.street, row.number].filter(Boolean).join(", ");
  const cidade = [row.city, row.state].filter(Boolean).join(" - ");
  return [rua, row.neighborhood, cidade].filter(Boolean).join(", ");
}

// Converte a linha do banco para o formato que o front-end já usa.
function paraApi(row, email) {
  return {
    id: row.id,
    profileId: row.profile_id,
    nome: row.name,
    email: email || "",
    telefone: row.phone || "",
    endereco: montarEndereco(row),
    cidade: [row.city, row.state].filter(Boolean).join(" - "),
    latitude: row.latitude,
    longitude: row.longitude,
    descricao: row.description || "",
    alimentosAceitos: (row.ong_food_types || [])
      .map((item) => item.food_types && item.food_types.name)
      .filter(Boolean),
  };
}

function filtrarPorAlimento(ongs, alimento) {
  if (!alimento) return ongs;

  const termo = alimento.toLowerCase();
  return ongs.filter((ong) =>
    ong.alimentosAceitos.some((item) => item.toLowerCase() === termo)
  );
}

async function listarOngs(alimento) {
  if (!db.isConfigured()) return filtrarPorAlimento(mockOngs.slice(), alimento);

  const rows = await db.rest(`ongs?select=${SELECT}&order=name`);
  return filtrarPorAlimento(rows.map((row) => paraApi(row)), alimento);
}

async function buscarOngPorId(id) {
  if (!db.isConfigured()) return mockOngs.find((ong) => String(ong.id) === String(id));
  if (!UUID.test(id)) return undefined;

  const [row] = await db.rest(`ongs?select=${SELECT}&id=eq.${id}`);
  if (!row) return undefined;

  // O e-mail fica no Supabase Auth, não na tabela ongs.
  const user = await db.auth(`admin/users/${row.profile_id}`, { admin: true }).catch(() => null);
  return paraApi(row, user && user.email);
}

module.exports = { listarOngs, buscarOngPorId, paraApi, SELECT };
