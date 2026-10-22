function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendNotFound(res) {
  res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
  res.end("<!DOCTYPE html><meta charset=\"utf-8\"><title>Não encontrado</title><p>Página não encontrada.</p>");
}

module.exports = { sendJson, sendNotFound };
