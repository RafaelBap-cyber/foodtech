document.addEventListener("DOMContentLoaded", async () => {
  const statusEl = document.getElementById("status-msg");
  const cardEl = document.getElementById("ong-profile");

  function mostrarStatus(mensagem, erro = false) {
    statusEl.textContent = mensagem;
    statusEl.classList.toggle("is-error", erro);
    statusEl.hidden = false;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    mostrarStatus("Nenhuma ONG foi informada.", true);
    return;
  }

  mostrarStatus("Carregando...");

  try {
    const ong = await FoodTechOngs.get(id);

    document.title = `${ong.nome} — FoodTech`;

    const avatar = document.getElementById("ong-avatar");
    avatar.textContent = FoodTechUI.initials(ong.nome);

    document.getElementById("ong-nome").textContent = ong.nome;
    document.getElementById("ong-cidade").textContent = ong.cidade || "";
    document.getElementById("ong-descricao").textContent =
      ong.descricao || "Esta organização ainda não escreveu uma descrição.";
    document.getElementById("ong-telefone").textContent = ong.telefone || "Não informado";
    document.getElementById("ong-email").textContent = ong.email || "Não informado";
    document.getElementById("ong-endereco").textContent = ong.endereco || "Não informado";

    const alimentosEl = document.getElementById("ong-alimentos");
    const alimentos = ong.alimentosAceitos || [];
    if (alimentos.length) {
      alimentosEl.replaceChildren(
        ...alimentos.map((item) => {
          const tag = document.createElement("span");
          tag.className = "tag";
          tag.textContent = item;
          return tag;
        })
      );
    } else {
      const vazio = document.createElement("p");
      vazio.className = "empty";
      vazio.textContent = "A organização ainda não informou os alimentos aceitos.";
      alimentosEl.replaceChildren(vazio);
    }

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
    mostrarStatus("Não foi possível carregar os dados da ONG.", true);
  }
});
