const db = require("../config/supabase");
const { httpError } = require("../middleware");

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function exigirSupabase() {
  if (!db.isConfigured()) {
    throw httpError(503, "O login ainda não está configurado neste servidor (faltam as chaves do Supabase).");
  }
}

function validarConta({ name, email, phone, password }) {
  if (!name || name.trim().length < 3) throw httpError(400, "Informe o nome completo.");
  if (!email || !EMAIL.test(email.trim())) throw httpError(400, "Informe um e-mail válido.");

  const digitos = (phone || "").replace(/\D/g, "");
  if (digitos.length < 10 || digitos.length > 11) throw httpError(400, "Informe um telefone com DDD.");

  if (!password || password.length < 6) throw httpError(400, "A senha precisa ter pelo menos 6 caracteres.");
}

function validarOng(ong) {
  if (!ong) throw httpError(400, "Informe os dados da ONG.");
  if (!ong.street || !ong.number || !ong.city) throw httpError(400, "Informe rua, número e cidade da ONG.");
  if (!/^[A-Za-z]{2}$/.test(ong.state || "")) throw httpError(400, "Informe a UF com 2 letras, como SP.");
}

// Converte o endereço em coordenadas (OpenStreetMap) para a ONG aparecer no mapa.
// Se o serviço não responder, a ONG é cadastrada sem coordenadas.
async function geocodificar({ street, number, neighborhood, city, state }) {
  const q = [`${street}, ${number}`, neighborhood, city, state, "Brasil"].filter(Boolean).join(", ");
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
      { headers: { "User-Agent": "FoodTech (projeto academico)" }, signal: AbortSignal.timeout(5000) }
    );
    const [lugar] = await response.json();
    return lugar ? { latitude: Number(lugar.lat), longitude: Number(lugar.lon) } : {};
  } catch {
    return {};
  }
}

// Monta o usuário no formato usado pelo front-end.
async function montarUsuario(authUser) {
  const [perfil] = await db.rest(`profiles?select=id,name,phone,user_type&id=eq.${authUser.id}`);
  if (!perfil) throw httpError(403, "Esta conta não tem perfil no FoodTech.");

  let ongId = null;
  if (perfil.user_type === "ong") {
    const [ong] = await db.rest(`ongs?select=id&profile_id=eq.${perfil.id}`);
    ongId = ong ? ong.id : null;
  }

  return {
    id: perfil.id,
    name: perfil.name,
    email: authUser.email,
    phone: perfil.phone || "",
    profile: perfil.user_type,
    ongId,
  };
}

async function login({ email, password }) {
  exigirSupabase();
  if (!email || !password) throw httpError(400, "Informe e-mail e senha.");

  let sessao;
  try {
    sessao = await db.auth("token?grant_type=password", {
      method: "POST",
      body: { email: email.trim(), password },
    });
  } catch (error) {
    if (error.status === 400) throw httpError(401, "E-mail ou senha inválidos.");
    throw error;
  }

  return { token: sessao.access_token, user: await montarUsuario(sessao.user) };
}

async function cadastrar(dados) {
  exigirSupabase();
  const userType = dados.userType === "ong" ? "ong" : "donor";
  validarConta(dados);
  if (userType === "ong") validarOng(dados.ong);

  let authUser;
  try {
    authUser = await db.auth("admin/users", {
      method: "POST",
      admin: true,
      body: {
        email: dados.email.trim(),
        password: dados.password,
        email_confirm: true,
        user_metadata: { name: dados.name.trim() },
      },
    });
  } catch (error) {
    if (error.status === 422) throw httpError(409, "Já existe uma conta com este e-mail.");
    throw error;
  }

  try {
    await db.rest("profiles", {
      method: "POST",
      body: { id: authUser.id, name: dados.name.trim(), phone: dados.phone.trim(), user_type: userType },
    });

    if (userType === "ong") {
      const ong = dados.ong;
      const endereco = {
        street: ong.street.trim(),
        number: String(ong.number).trim(),
        neighborhood: (ong.neighborhood || "").trim() || null,
        city: ong.city.trim(),
        state: ong.state.trim().toUpperCase(),
        zip_code: (ong.zipCode || "").trim() || null,
      };

      const [registro] = await db.rest("ongs", {
        method: "POST",
        prefer: "return=representation",
        body: {
          profile_id: authUser.id,
          name: dados.name.trim(),
          description: (ong.description || "").trim() || null,
          phone: dados.phone.trim(),
          ...endereco,
          ...(await geocodificar(endereco)),
        },
      });

      const alimentos = Array.isArray(ong.foodTypeIds) ? ong.foodTypeIds : [];
      if (alimentos.length) {
        await db.rest("ong_food_types", {
          method: "POST",
          body: alimentos.map((id) => ({ ong_id: registro.id, food_type_id: id })),
        });
      }
    }
  } catch (error) {
    // Desfaz a conta criada; perfil e ONG somem junto (ON DELETE CASCADE).
    await db.auth(`admin/users/${authUser.id}`, { method: "DELETE", admin: true }).catch(() => {});
    throw error;
  }

  return login({ email: dados.email, password: dados.password });
}

// Lê o token do cabeçalho Authorization e devolve o usuário logado.
async function usuarioAtual(req) {
  exigirSupabase();
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) throw httpError(401, "Faça login para continuar.");

  let authUser;
  try {
    authUser = await db.auth("user", { token });
  } catch {
    throw httpError(401, "Sua sessão expirou. Entre novamente.");
  }

  return montarUsuario(authUser);
}

async function atualizarDados(usuario, { name, phone }) {
  if (!name || name.trim().length < 3) throw httpError(400, "Informe o nome completo.");
  const digitos = (phone || "").replace(/\D/g, "");
  if (digitos.length < 10 || digitos.length > 11) throw httpError(400, "Informe um telefone com DDD.");

  await db.rest(`profiles?id=eq.${usuario.id}`, {
    method: "PATCH",
    body: { name: name.trim(), phone: phone.trim(), updated_at: new Date().toISOString() },
  });

  return { ...usuario, name: name.trim(), phone: phone.trim() };
}

async function trocarSenha(usuario, { currentPassword, newPassword }) {
  if (!newPassword || newPassword.length < 6) {
    throw httpError(400, "A nova senha precisa ter pelo menos 6 caracteres.");
  }

  // Confere a senha atual tentando entrar com ela.
  await login({ email: usuario.email, password: currentPassword || "" }).catch((error) => {
    if (error.status === 401) throw httpError(400, "A senha atual está incorreta.");
    throw error;
  });

  await db.auth(`admin/users/${usuario.id}`, {
    method: "PUT",
    admin: true,
    body: { password: newPassword },
  });
}

module.exports = { login, cadastrar, usuarioAtual, atualizarDados, trocarSenha };
