const db = require("../config/supabase");
const { httpError } = require("../middleware");

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_TEXTO = 1000;
const MAX_MENSAGENS = 200;

// Busca perfis (com o id da ONG, quando for ONG) e devolve um mapa por id.
async function buscarPerfis(ids) {
  if (!ids.length) return {};

  const lista = ids.join(",");
  const [perfis, ongs] = await Promise.all([
    db.rest(`profiles?select=id,name,user_type&id=in.(${lista})`),
    db.rest(`ongs?select=id,profile_id&profile_id=in.(${lista})`),
  ]);
  const ongPorPerfil = Object.fromEntries(ongs.map((ong) => [ong.profile_id, ong.id]));

  return Object.fromEntries(perfis.map((perfil) => [perfil.id, {
    id: perfil.id,
    name: perfil.name,
    profile: perfil.user_type,
    ongId: ongPorPerfil[perfil.id] || null,
  }]));
}

async function buscarContato(usuario, outroId) {
  if (!UUID.test(outroId || "")) throw httpError(404, "Contato não encontrado.");
  if (outroId === usuario.id) throw httpError(400, "Não é possível conversar consigo mesmo.");

  const contato = (await buscarPerfis([outroId]))[outroId];
  if (!contato) throw httpError(404, "Contato não encontrado.");

  // As conversas são sempre entre um doador e uma ONG.
  if (contato.profile === usuario.profile) {
    throw httpError(403, usuario.profile === "ong"
      ? "ONGs só conversam com doadores."
      : "Doadores só conversam com ONGs.");
  }

  return contato;
}

const entre = (a, b) =>
  `or=(and(sender_id.eq.${a},receiver_id.eq.${b}),and(sender_id.eq.${b},receiver_id.eq.${a}))`;

function paraApi(row, usuario) {
  return {
    id: row.id,
    content: row.content,
    donation_id: row.donation_id,
    created_at: row.created_at,
    mine: row.sender_id === usuario.id,
  };
}

// Lista de conversas: uma por contato, com a última mensagem.
async function listarConversas(usuario) {
  const rows = await db.rest(
    `messages?select=sender_id,receiver_id,content,created_at` +
      `&or=(sender_id.eq.${usuario.id},receiver_id.eq.${usuario.id})&order=created_at.desc&limit=500`
  );

  const ultimas = new Map();
  rows.forEach((row) => {
    const outro = row.sender_id === usuario.id ? row.receiver_id : row.sender_id;
    if (!ultimas.has(outro)) ultimas.set(outro, row);
  });

  const perfis = await buscarPerfis([...ultimas.keys()]);
  return [...ultimas.entries()]
    .filter(([outro]) => perfis[outro])
    .map(([outro, row]) => ({
      ...perfis[outro],
      lastMessage: row.content,
      lastAt: row.created_at,
      lastFromMe: row.sender_id === usuario.id,
    }));
}

async function buscarConversa(usuario, outroId) {
  const contato = await buscarContato(usuario, outroId);
  const rows = await db.rest(
    `messages?select=id,sender_id,content,donation_id,created_at&${entre(usuario.id, contato.id)}` +
      `&order=created_at.desc&limit=${MAX_MENSAGENS}`
  );

  return { with: contato, messages: rows.reverse().map((row) => paraApi(row, usuario)) };
}

async function enviar(usuario, { receiver_id, content, donation_id }) {
  const texto = (content || "").trim();
  if (!texto) throw httpError(400, "Escreva uma mensagem.");
  if (texto.length > MAX_TEXTO) throw httpError(400, `Use no máximo ${MAX_TEXTO} caracteres.`);

  const contato = await buscarContato(usuario, receiver_id);
  const doador = usuario.profile === "donor" ? usuario.id : contato.id;
  const ongId = usuario.profile === "ong" ? usuario.ongId : contato.ongId;
  if (!ongId) throw httpError(400, "Esta ONG ainda não tem cadastro completo.");

  // A ONG só escreve para quem já falou com ela ou doou para ela.
  if (usuario.profile === "ong") {
    const [conversa, doacao] = await Promise.all([
      db.rest(`messages?select=id&${entre(usuario.id, contato.id)}&limit=1`),
      db.rest(`donations?select=id&donor_id=eq.${doador}&ong_id=eq.${ongId}&limit=1`),
    ]);
    if (!conversa.length && !doacao.length) {
      throw httpError(403, "A ONG só pode escrever para doadores que já entraram em contato ou doaram.");
    }
  }

  if (donation_id) {
    const [doacao] = UUID.test(donation_id)
      ? await db.rest(`donations?select=id&id=eq.${donation_id}&donor_id=eq.${doador}&ong_id=eq.${ongId}`)
      : [];
    if (!doacao) throw httpError(400, "Esta doação não é entre vocês dois.");
  }

  const [row] = await db.rest("messages", {
    method: "POST",
    prefer: "return=representation",
    body: {
      sender_id: usuario.id,
      receiver_id: contato.id,
      donation_id: donation_id || null,
      content: texto,
    },
  });

  return paraApi(row, usuario);
}

module.exports = { listarConversas, buscarConversa, enviar };
