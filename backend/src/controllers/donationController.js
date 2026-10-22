const donationService = require("../services/donationService");
const authService = require("../services/authService");
const { sendJson, handle } = require("../middleware");

const list = handle(async (req, res) => {
  const usuario = await authService.usuarioAtual(req);
  const donations = await donationService.listar(usuario);
  sendJson(res, 200, { ok: true, donations });
});

const get = handle(async (req, res) => {
  const usuario = await authService.usuarioAtual(req);
  const donation = await donationService.buscar(usuario, req.params.id);
  sendJson(res, 200, { ok: true, donation });
});

const create = handle(async (req, res) => {
  const usuario = await authService.usuarioAtual(req);
  const donation = await donationService.criar(usuario, req.body || {});
  sendJson(res, 201, { ok: true, donation });
});

const updateStatus = handle(async (req, res) => {
  const usuario = await authService.usuarioAtual(req);
  const donation = await donationService.mudarStatus(usuario, req.params.id, (req.body || {}).status);
  sendJson(res, 200, { ok: true, donation });
});

module.exports = { list, get, create, updateStatus };
