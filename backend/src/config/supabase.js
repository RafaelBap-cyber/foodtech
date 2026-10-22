const { supabase } = require("./index");

// Só o back-end fala com o Supabase. A chave de serviço ignora o RLS,
// então nunca deve ser enviada para o navegador.

function isConfigured() {
  return Boolean(supabase.url && supabase.anonKey && supabase.serviceKey);
}

async function call(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    const error = new Error(
      (data && (data.msg || data.message || data.error_description || data.error)) ||
        "Erro ao falar com o banco de dados."
    );
    error.status = response.status;
    error.code = data && (data.code || data.error_code);
    throw error;
  }

  return data;
}

// Tabelas (PostgREST). Ex.: rest("ongs?select=*&order=name")
function rest(path, { method = "GET", body, prefer } = {}) {
  const headers = {
    apikey: supabase.serviceKey,
    Authorization: `Bearer ${supabase.serviceKey}`,
    "Content-Type": "application/json",
  };
  if (prefer) headers.Prefer = prefer;

  return call(`${supabase.url}/rest/v1/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

// Supabase Auth. admin: usa a chave de serviço; token: age como o usuário logado.
function auth(path, { method = "GET", body, token, admin = false } = {}) {
  const key = admin ? supabase.serviceKey : supabase.anonKey;
  const headers = { apikey: key, "Content-Type": "application/json" };
  if (token || admin) headers.Authorization = `Bearer ${token || key}`;

  return call(`${supabase.url}/auth/v1/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

module.exports = { isConfigured, rest, auth };
