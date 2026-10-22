document.addEventListener("DOMContentLoaded", async () => {
  const statusEl = document.getElementById("status-msg");
  const cardEl = document.getElementById("ong-profile");

  function mostrarStatus(mensagem) {
    statusEl.textContent = mensagem;
    statusEl.hidden = false;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    mostrarStatus("Nenhuma ONG foi informada.");
    return;
  }

  mostrarStatus("Carregando...");

  try {
    const ong = await FoodTechOngs.get(id);

    document.getElementById("ong-nome").textContent = ong.nome;
    document.getElementById("ong-descricao").textContent = ong.descricao || "";
    document.getElementById("ong-telefone").textContent = ong.telefone || "Telefone não informado";
    document.getElementById("ong-email").textContent = ong.email || "E-mail não informado";
    document.getElementById("ong-endereco").textContent = ong.endereco || "Endereço não informado";

    const alimentosEl = document.getElementById("ong-alimentos");
    alimentosEl.innerHTML = (ong.alimentosAceitos || [])
      .map((item) => `<span class="tag">${item}</span>`)
      .join("");

    document.getElementById("ong-doar").href =
      `../doacoes/nova.html?ong=${encodeURIComponent(ong.id)}`;

    // A conversa é com o perfil da ONG; o painel abre direto nela.
    if (ong.profileId) {
      document.getElementById("ong-mensagem").href =
        `../painel/index.html?conversa=${encodeURIComponent(ong.profileId)}#mensagens`;
    }

    statusEl.hidden = true;
    cardEl.hidden = false;
  } catch (erro) {
    mostrarStatus("Não foi possível carregar os dados da ONG.");
  }
});