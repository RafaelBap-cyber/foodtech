const { findRoute } = require("../backend/src/app");
const { sendJson } = require("../backend/src/middleware");

// Entrada da API na Vercel. O vercel.json reescreve /api/<caminho> para
// /api?path=<caminho>, e aqui a rota é resolvida igual ao backend/src/server.js.
module.exports = (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const caminho = url.searchParams.get("path") || "";
  url.searchParams.delete("path");
  const pathname = `/api/${caminho}`.replace(/\/$/, "");

  const route = findRoute(req.method, pathname);
  if (!route || !route.handler) {
    sendJson(res, 501, { ok: false, message: "Rota ainda não implementada." });
    return;
  }

  try {
    req.body = req.body || {};
  } catch (error) {
    sendJson(res, 400, { ok: false, message: "Não foi possível ler a requisição." });
    return;
  }

  req.params = route.params;
  req.query = Object.fromEntries(url.searchParams);
  route.handler(req, res);
};
