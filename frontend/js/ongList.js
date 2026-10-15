document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("ong-list");
  const statusEl = document.getElementById("status-msg");
  const filtroInput = document.getElementById("filtro-alimento");

  function mostrarStatus(mensagem) {
    statusEl.textContent = mensagem;
    statusEl.hidden = false;
  }

  function renderizarOngs(ongs) {
    listEl.innerHTML = "";

    if (ongs.length === 0) {
      mostrarStatus("Nenhuma ONG encontrada.");
      return;
    }

    statusEl.hidden = true;

    ongs.forEach((ong) => {
      const card = document.createElement("article");
      card.className = "ong-card";
      card.innerHTML = `
        <h2>${ong.nome}</h2>
        <p class="ong-card-desc">${ong.descricao || ""}</p>
        <p class="ong-card-endereco">${ong.endereco || ""}</p>
        <div class="ong-card-tags">
          ${(ong.alimentosAceitos || [])
            .map((item) => `<span class="tag">${item}</span>`)
            .join("")}
        </div>
        <a class="btn btn-secondary" href="details.html?id=${ong.id}">Ver detalhes</a>
      `;
      listEl.appendChild(card);
    });
  }

  async function carregarOngs(alimento) {
    mostrarStatus("Carregando...");
    try {
      const ongs = await FoodTechOngs.list(alimento);
      renderizarOngs(ongs);
    } catch (erro) {
      mostrarStatus("Não foi possível carregar as ONGs.");
    }
  }

  let timeout;
  filtroInput.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      carregarOngs(filtroInput.value.trim() || undefined);
    }, 300);
  });

  carregarOngs();
});