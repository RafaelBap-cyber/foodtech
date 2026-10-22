const session = FoodTechDoacoesPagina.iniciar();

if (session) {
  const filtro = document.querySelector("#filtro-status");
  const tabela = document.querySelector("#tabela-doacoes");
  const corpo = document.querySelector("#lista-doacoes");
  const status = document.querySelector("#lista-status");

  let doacoes = [];

  function showStatus(message) {
    status.textContent = message;
    status.hidden = !message;
  }

  function cell(text, className) {
    const td = document.createElement("td");
    if (className) td.className = className;
    if (text) td.textContent = text;
    return td;
  }

  function buildRow(donation) {
    const row = document.createElement("tr");

    const resumo = cell(FoodTechDonations.summarizeItems(donation.items), "doacao-resumo");
    if (donation.description) {
      const obs = document.createElement("small");
      obs.textContent = donation.description;
      resumo.append(obs);
    }

    const situacao = cell();
    const chip = document.createElement("span");
    chip.className = `status status-${donation.status}`;
    chip.textContent = FoodTechDonations.statusLabel[donation.status] || donation.status;
    situacao.append(chip);

    const acoes = cell();
    const link = document.createElement("a");
    link.className = "text-link";
    link.href = `detalhe.html?id=${encodeURIComponent(donation.id)}`;
    link.textContent = "Ver detalhes";
    acoes.append(link);

    row.append(
      cell(FoodTechDonations.formatDate(donation.created_at)),
      resumo,
      cell(donation.ong_name),
      situacao,
      acoes
    );
    return row;
  }

  function render() {
    const lista = filtro.value
      ? doacoes.filter((donation) => donation.status === filtro.value)
      : doacoes;

    corpo.replaceChildren(...lista.map(buildRow));
    tabela.hidden = lista.length === 0;

    if (!doacoes.length) showStatus("Você ainda não registrou nenhuma doação.");
    else if (!lista.length) showStatus("Nenhuma doação com esse status.");
    else showStatus("");
  }

  Object.entries(FoodTechDonations.statusLabel).forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    filtro.append(option);
  });

  filtro.addEventListener("change", render);

  async function carregar() {
    showStatus("Carregando...");
    try {
      doacoes = await FoodTechDonations.list();
      render();
    } catch (error) {
      showStatus("Não foi possível carregar suas doações. Recarregue a página.");
    }
  }

  carregar();
}
