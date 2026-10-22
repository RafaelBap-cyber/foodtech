const contactService = require("../services/contactService");
const authService = require("../services/authService");
const { sendJson, handle } = require("../middleware");

const list = handle(async (req, res) => {
  const usuario = await authService.usuarioAtual(req);
  const conversations = await contactService.listarConversas(usuario);
  sendJson(res, 200, { ok: true, conversations });
});

const conversation = handle(async (req, res) => {
  const usuario = await authService.usuarioAtual(req);
  const conversa = await contactService.buscarConversa(usuario, req.params.profileId);
  sendJson(res, 200, { ok: true, ...conversa });
});

const send = handle(async (req, res) => {
  const usuario = await authService.usuarioAtual(req);
  const message = await contactService.enviar(usuario, req.body || {});
  sendJson(res, 201, { ok: true, message });
});

module.exports = { list, conversation, send };
