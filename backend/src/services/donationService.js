async function listDonations() {
  const error = new Error("Consulta de doações ainda não implementada.");
  error.status = 501;
  throw error;
}

module.exports = { listDonations };
