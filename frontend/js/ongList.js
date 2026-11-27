document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("ong-list");
  const statusEl = document.getElementById("status-msg");
  const countEl = document.getElementById("ong-count");
  const filtroInput = document.getElementById("filtro-alimento");

  function mostrarErro(mensagem) {
    statusEl.textContent = mensagem;
    statusEl.hidden = false;
  }

  function mostrarCarregando() {
    listEl.setAttribute("aria-busy", "true");
    listEl.replaceChildren(
      ...Array.from({ length: 3 }, () => {
        const skeleton = document.createElement("div");
        skeleton.className = "skeleton";
        skeleton.setAttribute("aria-hidden", "true");
        return skeleton;
      })
    );
  }

  function atualizarContador(total, alimento) {
    const rotulo = total === 1 ? "organização encontrada" : "organizações encontradas";
    countEl.replaceChildren();
    const numero = document.createElement("strong");
    numero.textContent = total;
    countEl.append(numero, ` ${rotulo}`);
    if (alimento) countEl.append(` para “${alimento}”`);
  }

  function renderizarOngs(ongs, alimento) {
    listEl.removeAttribute("aria-busy");
    statusEl.hidden = true;
    atualizarContador(ongs.length, alimento);

    if (ongs.length === 0) {
      listEl.replaceChildren(
        FoodTechUI.emptyState(
          "Nenhuma ONG encontrada",
          alimento
            ? "Nenhuma organização aceita esse alimento ainda. Tente outro termo."
            : "Ainda não há organizações cadastradas."
        )
      );
      return;
    }

    listEl.replaceChildren(
      ...ongs.map((ong) =>
        FoodTechUI.ongCard(ong, { href: `profile.html?id=${encodeURIComponent(ong.id)}` })
      )
    );
  }

  async function carregarOngs(alimento) {
    mostrarCarregando();
    try {
      const ongs = await FoodTechOngs.list(alimento);
      renderizarOngs(ongs, alimento);
    } catch (erro) {
      listEl.removeAttribute("aria-busy");
      listEl.replaceChildren();
      countEl.textContent = "";
      mostrarErro("Não foi possível carregar as ONGs.");
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
