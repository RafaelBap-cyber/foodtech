const db = require("../config/supabase");
const { httpError } = require("../middleware");

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UNIDADES = ["kg", "g", "l", "un", "porcoes"];
const MAX_DESCRICAO = 300;
const MAX_ITENS = 20;

// Mudanças de status que a ONG pode fazer.
const PROXIMOS_STATUS = {
  pending: ["accepted", "cancelled"],
  accepted: ["completed", "cancelled"],
};

const SELECT =
  "id,donor_id,ong_id,status,description,created_at,updated_at," +
  "ongs(name,profile_id),profiles(name),donation_items(id,food_type_id,quantity,unit,food_types(name))";

// Converte a linha do banco para o formato usado pelo front-end.
function paraApi(row) {
  return {
    id: row.id,
    donor_id: row.donor_id,
    donor_name: row.profiles ? row.profiles.name : "",
    ong_id: row.ong_id,
    ong_name: row.ongs ? row.ongs.name : "",
    ong_profile_id: row.ongs ? row.ongs.profile_id : null,
    status: row.status,
    description: row.description || "",
    created_at: row.created_at,
    updated_at: row.updated_at,
    items: (row.donation_items || []).map((item) => ({
      id: item.id,
      food_type_id: item.food_type_id,
      food_type_name: item.food_types ? item.food_types.name : "",
      quantity: Number(item.quantity),
      unit: item.unit,
    })),
  };
}

// Doador vê as doações que fez; ONG vê as que recebeu.
function filtroDoUsuario(usuario) {
  if (usuario.profile === "ong") {
    if (!usuario.ongId) throw httpError(403, "Sua conta de ONG não tem uma organização cadastrada.");
    return `ong_id=eq.${usuario.ongId}`;
  }
  return `donor_id=eq.${usuario.id}`;
}

async function listar(usuario) {
  const rows = await db.rest(
    `donations?select=${SELECT}&${filtroDoUsuario(usuario)}&order=created_at.desc`
  );
  return rows.map(paraApi);
}

async function buscar(usuario, id) {
  if (!UUID.test(id)) throw httpError(404, "Doação não encontrada.");
  const [row] = await db.rest(`donations?select=${SELECT}&id=eq.${id}&${filtroDoUsuario(usuario)}`);
  if (!row) throw httpError(404, "Doação não encontrada.");
  return paraApi(row);
}

async function validarCriacao({ ong_id, description, items }) {
  if (!ong_id || !UUID.test(ong_id)) throw httpError(400, "Escolha a ONG que vai receber a doação.");
  const [ong] = await db.rest(`ongs?select=id&id=eq.${ong_id}`);
  if (!ong) throw httpError(400, "A ONG escolhida não existe.");

  if (description && description.length > MAX_DESCRICAO) {
    throw httpError(400, `Use no máximo ${MAX_DESCRICAO} caracteres nas observações.`);
  }

  if (!Array.isArray(items) || items.length === 0) throw httpError(400, "Adicione pelo menos um item.");
  if (items.length > MAX_ITENS) throw httpError(400, `Adicione no máximo ${MAX_ITENS} itens.`);

  const tipos = await db.rest("food_types?select=id");
  const tiposValidos = new Set(tipos.map((tipo) => tipo.id));

  items.forEach((item) => {
    const quantidade = Number(item.quantity);
    if (!tiposValidos.has(item.food_type_id)) throw httpError(400, "Escolha o tipo de alimento de cada item.");
    if (!Number.isFinite(quantidade) || quantidade <= 0 || quantidade > 99999999.99) {
      throw httpError(400, "Informe uma quantidade válida em cada item.");
    }
    if (!UNIDADES.includes(item.unit)) throw httpError(400, "Escolha a unidade de cada item.");
  });
}

async function criar(usuario, dados) {
  if (usuario.profile !== "donor") throw httpError(403, "Só doadores podem registrar doações.");
  await validarCriacao(dados);

  const [doacao] = await db.rest("donations", {
    method: "POST",
    prefer: "return=representation",
    body: {
      donor_id: usuario.id,
      ong_id: dados.ong_id,
      description: (dados.description || "").trim() || null,
    },
  });

  try {
    await db.rest("donation_items", {
      method: "POST",
      body: dados.items.map((item) => ({
        donation_id: doacao.id,
        food_type_id: item.food_type_id,
        quantity: Math.round(Number(item.quantity) * 100) / 100,
        unit: item.unit,
      })),
    });
  } catch (error) {
    // Sem itens a doação não faz sentido: desfaz.
    await db.rest(`donations?id=eq.${doacao.id}`, { method: "DELETE" }).catch(() => {});
    throw error;
  }

  return buscar(usuario, doacao.id);
}

async function mudarStatus(usuario, id, status) {
  if (usuario.profile !== "ong") throw httpError(403, "Só a ONG pode responder a uma doação.");

  const doacao = await buscar(usuario, id);
  const permitidos = PROXIMOS_STATUS[doacao.status] || [];
  if (!permitidos.includes(status)) {
    throw httpError(400, "Essa mudança de status não é permitida.");
  }

  await db.rest(`donations?id=eq.${doacao.id}`, {
    method: "PATCH",
    body: { status, updated_at: new Date().toISOString() },
  });

  return buscar(usuario, id);
}

module.exports = { listar, buscar, criar, mudarStatus };
