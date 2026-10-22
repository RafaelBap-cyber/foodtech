async function loginDonor() {
  const error = new Error("Autenticação de usuário ainda não implementada.");
  error.status = 501;
  throw error;
}

module.exports = { loginDonor };
