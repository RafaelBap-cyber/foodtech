const authService = require("../services/authService");
const { sendJson, handle } = require("../middleware");

const login = handle(async (req, res) => {
  const sessao = await authService.login(req.body || {});
  sendJson(res, 200, { ok: true, ...sessao });
});

const register = handle(async (req, res) => {
  const sessao = await authService.cadastrar(req.body || {});
  sendJson(res, 201, { ok: true, ...sessao });
});

const me = handle(async (req, res) => {
  const user = await authService.usuarioAtual(req);
  sendJson(res, 200, { ok: true, user });
});

const updateMe = handle(async (req, res) => {
  const usuario = await authService.usuarioAtual(req);
  const user = await authService.atualizarDados(usuario, req.body || {});
  sendJson(res, 200, { ok: true, user });
});

const changePassword = handle(async (req, res) => {
  const usuario = await authService.usuarioAtual(req);
  await authService.trocarSenha(usuario, req.body || {});
  sendJson(res, 200, { ok: true, message: "Senha alterada com sucesso." });
});

module.exports = { login, register, me, updateMe, changePassword };
