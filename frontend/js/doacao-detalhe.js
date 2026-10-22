const session = FoodTechDoacoesPagina.iniciar();

if (session) {
  const status = document.querySelector("#detalhe-status");

  function showStatus(message) {
    status.textContent = message;
    status.hidden = false;
  }

  function render(donation) {
    const titulo = `Doação para ${donation.ong_name}`;
    document.title = `${titulo} — FoodTech`;
    document.querySelector("#detalhe-titulo").textContent = titulo;

    const situacao = document.querySelector("#detalhe-situacao");
    situacao.className = `status status-${donation.status}`;
    situacao.textContent = FoodTechDonations.statusLabel[donation.status] || donation.status;

    const ong = document.querySelector("#detalhe-ong");
    ong.textContent = donation.ong_name;
    ong.href = `../ong/profile.html?id=${encodeURIComponent(donation.ong_id)}`;

    document.querySelector("#detalhe-data").textContent = FoodTechDonations.formatDate(donation.created_at);
    document.querySelector("#detalhe-atualizacao").textContent = FoodTechDonations.formatDate(donation.updated_at);
    document.querySelector("#detalhe-descricao").textContent = donation.description || "Nenhuma observação.";

    const itens = donation.items.map((item) => {
      const row = document.createElement("tr");
      const alimento = document.createElement("td");
      alimento.textContent = item.food_type_name;
      const quantidade = document.createElement("td");
      quantidade.textContent = FoodTechDonations.formatQuantity(item.quantity, item.unit);
      row.append(alimento, quantidade);
      return row;
    });
    document.querySelector("#detalhe-itens").replaceChildren(...itens);

    status.hidden = true;
    document.querySelector("#detalhe").hidden = false;
  }

  async function carregar() {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
      showStatus("Nenhuma doação foi informada.");
      return;
    }

    showStatus("Carregando...");
    try {
      render(await FoodTechDonations.get(id));
    } catch (error) {
      showStatus(error.status === 404
        ? "Doação não encontrada."
        : "Não foi possível carregar a doação. Recarregue a página.");
    }
  }

  carregar();
}
