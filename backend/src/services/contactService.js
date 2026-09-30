async function listMessages() {
  const error = new Error("Consulta de mensagens ainda não implementada.");
  error.status = 501;
  throw error;
}

module.exports = { listMessages };
