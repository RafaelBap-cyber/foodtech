function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendNotFound(res) {
  res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
  res.end("<!DOCTYPE html><meta charset=\"utf-8\"><title>Não encontrado</title><p>Página não encontrada.</p>");
}

// Erro com mensagem que pode ser mostrada ao usuário.
function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  error.expose = true;
  return error;
}

// Executa um handler assíncrono e transforma qualquer erro em resposta JSON.
// Erros inesperados (ex.: falha no Supabase) viram 500 sem expor detalhes.
function handle(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (error) {
      if (!error.expose) console.error(error);
      const status = error.expose ? error.status : 500;
      const message = error.expose ? error.message : "Erro interno no servidor.";
      sendJson(res, status, { ok: false, message });
    }
  };
}

module.exports = { sendJson, sendNotFound, httpError, handle };
