const ongService = require("../services/ongService");
const { sendJson } = require("../middleware");

function listar(req, res) {
  const ongs = ongService.listarOngs(req.query.alimento);
  sendJson(res, 200, { ok: true, ongs });
}

function buscar(req, res) {
  const ong = ongService.buscarOngPorId(req.params.id);
  if (!ong) {
    sendJson(res, 404, { ok: false, message: "ONG não encontrada" });
    return;
  }
  sendJson(res, 200, { ok: true, ong });
}

function cadastrar(req, res) {
  const { nome, email, senha, telefone, endereco } = req.body || {};
  if (!nome || !email || !senha || !telefone || !endereco) {
    sendJson(res, 400, { ok: false, message: "Preencha todos os campos obrigatórios" });
    return;
  }

  const ong = ongService.cadastrarOng(req.body);
  sendJson(res, 201, { ok: true, ong });
}

function atualizar(req, res) {
  const ong = ongService.atualizarOng(req.params.id, req.body || {});
  if (!ong) {
    sendJson(res, 404, { ok: false, message: "ONG não encontrada" });
    return;
  }
  sendJson(res, 200, { ok: true, ong });
}

module.exports = { listar, buscar, cadastrar, atualizar };
