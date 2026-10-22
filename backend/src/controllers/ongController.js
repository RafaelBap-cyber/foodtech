const ongService = require("../services/ongService");
const { sendJson, httpError, handle } = require("../middleware");

const listar = handle(async (req, res) => {
  const ongs = await ongService.listarOngs(req.query.alimento);
  sendJson(res, 200, { ok: true, ongs });
});

const buscar = handle(async (req, res) => {
  const ong = await ongService.buscarOngPorId(req.params.id);
  if (!ong) throw httpError(404, "ONG não encontrada");
  sendJson(res, 200, { ok: true, ong });
});

module.exports = { listar, buscar };
