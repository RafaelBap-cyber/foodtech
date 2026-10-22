const session = FoodTechSession.read();

if (!session) {
  window.location.replace("../auth/login.html");
}

// ONGs da rede (/api/ongs) e doações do usuário logado (/api/donations).
let ongs = [];
let donations = [];

// Conversas de exemplo até a feature/contact ligar as mensagens à API.
const threads = {
  esperanca: {
    title: "ONG Esperança",
    messages: [
      { from: "ong", text: "Podemos retirar a doação amanhã de manhã." },
      { from: "me", text: "Pode ser às 9h. O arroz está separado." },
    ],
  },
  "vida-nova": {
    title: "Instituto Vida Nova",
    messages: [{ from: "ong", text: "Recebemos hortaliças até sexta." }],
  },
};

let activeThread = "esperanca";

// Respostas que a ONG pode dar em cada status da doação.
const statusActions = {
  pending: [["accepted", "Aceitar"], ["cancelled", "Recusar"]],
  accepted: [["completed", "Concluir"], ["cancelled", "Cancelar"]],
};

function applyProfile() {
  const isOng = session.profile === "ong";
  document.body.dataset.profile = session.profile;
  document.querySelector("#user-name").textContent = session.name;
  document.querySelector("#user-role").textContent = isOng ? "ONG" : "Doador";
  document.querySelector("#visao-titulo").textContent = isOng ? "Painel da organização" : "Painel do doador";
  document.querySelector("#visao-texto").textContent = isOng
    ? "Aqui a organização recebe doações, responde doadores e organiza a retirada."
    : "Aqui o doador registra alimentos, escolhe uma ONG e acompanha a entrega.";

  document.querySelectorAll("[data-for]").forEach((element) => {
    element.hidden = element.dataset.for !== session.profile;
  });

  renderMetrics();
  renderThreads();
  loadData();
}

async function loadData() {
  document.querySelector("#lista-ongs").innerHTML = `<p class="empty">Carregando ONGs...</p>`;

  const [ongsResult, donationsResult] = await Promise.allSettled([
    FoodTechOngs.list(),
    FoodTechDonations.list(),
  ]);

  if (ongsResult.status === "fulfilled") {
    ongs = ongsResult.value;
    renderOngs(document.querySelector("#filtro-ong").value);
  } else {
    document.querySelector("#lista-ongs").innerHTML = `<p class="empty">Não foi possível carregar as ONGs.</p>`;
  }

  if (donationsResult.status === "fulfilled") {
    donations = donationsResult.value;
    renderDonations();
  } else {
    showDonationsMessage("Não foi possível carregar as doações.");
  }

  renderMetrics();
}

function renderMetrics() {
  const isOng = session.profile === "ong";
  const pending = donations.filter((item) => item.status === "pending").length;
  const items = isOng
    ? [
        [String(donations.length), "Doações recebidas"],
        [String(pending), "Aguardando resposta"],
        [String(ongs.length), "ONGs na rede"],
      ]
    : [
        [String(donations.length), "Doações registradas"],
        [String(pending), "Ainda pendentes"],
        [String(ongs.length), "ONGs disponíveis"],
      ];

  document.querySelector("#metricas").innerHTML = items
    .map(([value, label]) => `<article><strong>${value}</strong><span>${label}</span></article>`)
    .join("");
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function renderOngs(query) {
  const term = query.trim().toLowerCase();
  const list = ongs.filter((ong) =>
    `${ong.nome} ${ong.cidade} ${ong.alimentosAceitos.join(" ")}`.toLowerCase().includes(term)
  );
  const root = document.querySelector("#lista-ongs");

  if (!list.length) {
    root.innerHTML = `<p class="empty">Nenhuma ONG encontrada para essa busca.</p>`;
    return;
  }

  root.replaceChildren(...list.map((ong) => {
    const mine = ong.id === session.ongId;
    const card = element("article", "work-card");
    const link = element("a", "text-link", mine ? "Ver perfil público" : "Ver detalhes");
    link.href = `../ong/profile.html?id=${encodeURIComponent(ong.id)}`;

    card.append(
      element("p", "choice-kicker", mine ? "Sua ONG" : ong.cidade),
      element("h2", "", ong.nome),
      element("p", "", ong.alimentosAceitos.join(", ") || "Alimentos aceitos não informados"),
      link
    );

    if (session.profile === "donor") {
      const doar = element("a", "text-link", "Doar para esta ONG");
      doar.href = `../doacoes/nova.html?ong=${encodeURIComponent(ong.id)}`;
      card.append(" · ", doar);
    }
    return card;
  }));
}

function showDonationsMessage(message) {
  const row = element("tr");
  const cell = element("td", "empty", message);
  cell.colSpan = 5;
  row.append(cell);
  document.querySelector("#lista-doacoes").replaceChildren(row);
}

// Tabela de doações recebidas (só a ONG vê esta tela).
function renderDonations() {
  if (session.profile !== "ong") return;
  if (!donations.length) {
    showDonationsMessage("Nenhuma doação recebida ainda.");
    return;
  }

  document.querySelector("#lista-doacoes").replaceChildren(...donations.map((item) => {
    const row = element("tr");

    const itens = element("td", "", FoodTechDonations.summarizeItems(item.items));
    if (item.description) itens.append(element("small", "doacao-obs", item.description));

    const status = element("td");
    status.append(element("span", `status status-${item.status}`, FoodTechDonations.statusLabel[item.status]));

    const actions = element("td", "row-actions");
    (statusActions[item.status] || []).forEach(([value, label]) => {
      const button = element("button", "", label);
      button.type = "button";
      button.dataset.status = value;
      button.dataset.id = item.id;
      actions.append(button);
    });

    row.append(
      itens,
      element("td", "", item.donor_name),
      element("td", "", FoodTechDonations.formatDate(item.created_at)),
      status,
      actions
    );
    return row;
  }));
}

function renderThreads() {
  document.querySelector("#conversas").innerHTML = Object.entries(threads).map(([id, thread]) => `
    <li><button type="button" data-thread="${id}" ${id === activeThread ? "aria-current=\"true\"" : ""}>${thread.title}</button></li>
  `).join("");

  const thread = threads[activeThread];
  document.querySelector("#conversa-titulo").textContent = thread.title;
  document.querySelector("#bolhas").innerHTML = thread.messages
    .map((message) => `<p class="bubble ${message.from === "me" ? "mine" : ""}">${message.text}</p>`)
    .join("");
}

let mapaPainel = null;
let mapaCarregando = false;

function renderMapList(lista) {
  const root = document.querySelector("#lista-mapa");
  root.innerHTML = "";

  lista.forEach((ong) => {
    const card = document.createElement("article");
    card.className = "work-card";

    const titulo = document.createElement("h2");
    titulo.textContent = ong.nome;
    const endereco = document.createElement("p");
    endereco.textContent = ong.endereco || "Endereço não informado";
    const link = document.createElement("a");
    link.className = "text-link";
    link.href = `../ong/profile.html?id=${encodeURIComponent(ong.id)}`;
    link.textContent = "Ver detalhes";

    card.append(titulo, endereco, link);
    root.appendChild(card);
  });
}

// O Leaflet precisa do elemento visível para medir o tamanho,
// então o mapa só é criado quando a aba é aberta pela primeira vez.
async function openMap() {
  if (mapaPainel) {
    mapaPainel.invalidateSize();
    return;
  }
  if (mapaCarregando) return;
  mapaCarregando = true;

  const root = document.querySelector("#lista-mapa");
  root.innerHTML = `<p class="empty">Carregando ONGs...</p>`;

  try {
    const lista = await FoodTechOngs.list();
    mapaPainel = FoodTechOngMap.criar("mapa-painel", lista);
    renderMapList(lista);
  } catch (error) {
    root.innerHTML = `<p class="empty">Não foi possível carregar as ONGs.</p>`;
  } finally {
    mapaCarregando = false;
  }
}

function showView(name) {
  if (name === "doacoes" && session.profile !== "ong") {
    window.location.href = "../doacoes/index.html";
    return;
  }

  const view = document.querySelector(`[data-screen="${name}"]`) ? name : "visao";
  document.querySelectorAll("[data-screen]").forEach((screen) => {
    screen.hidden = screen.dataset.screen !== view;
  });
  document.querySelectorAll(".app-nav a").forEach((link) => {
    link.setAttribute("aria-current", link.dataset.view === view ? "page" : "false");
  });
  const toggle = document.querySelector(".menu-toggle");
  if (toggle) toggle.checked = false;
  if (view === "mapa") openMap();
}

document.querySelectorAll("[data-view]").forEach((link) => {
  link.addEventListener("click", () => {
    showView(link.dataset.view);
  });
});

window.addEventListener("hashchange", () => {
  showView(location.hash.replace("#", ""));
});

document.querySelector("#sair").addEventListener("click", () => {
  FoodTechSession.end();
  window.location.href = "../../index.html";
});

document.querySelector("#busca-ongs").addEventListener("submit", (event) => {
  event.preventDefault();
  renderOngs(event.currentTarget.q.value);
});

document.querySelector("#filtro-ong").addEventListener("input", (event) => {
  renderOngs(event.target.value);
});

document.querySelector("#lista-doacoes").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-status]");
  if (!button) return;

  const buttons = button.parentElement.querySelectorAll("button");
  buttons.forEach((item) => { item.disabled = true; });

  try {
    const updated = await FoodTechDonations.updateStatus(button.dataset.id, button.dataset.status);
    donations = donations.map((item) => (item.id === updated.id ? updated : item));
    renderDonations();
    renderMetrics();
  } catch (error) {
    buttons.forEach((item) => { item.disabled = false; });
    alert(error.message || "Não foi possível atualizar a doação.");
  }
});

document.querySelector("#conversas").addEventListener("click", (event) => {
  const button = event.target.closest("[data-thread]");
  if (!button) return;
  activeThread = button.dataset.thread;
  renderThreads();
});

document.querySelector("#form-mensagem").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = event.currentTarget.texto;
  const text = input.value.trim();
  if (!text) return;
  threads[activeThread].messages.push({ from: "me", text });
  input.value = "";
  renderThreads();
});

document.querySelector("#localizar").addEventListener("click", () => {
  const status = document.querySelector("#localizacao");
  status.hidden = false;

  if (!navigator.geolocation) {
    status.textContent = "Este navegador não informa a localização. A lista por cidade continua disponível.";
    return;
  }

  status.textContent = "Buscando a localização...";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      status.textContent = "Localização recebida. Use a cidade e o bairro de cada ONG para combinar a entrega.";
    },
    () => {
      status.textContent = "Não foi possível usar a localização. A lista por cidade continua disponível.";
    }
  );
});

if (session) {
  applyProfile();
  showView(location.hash.replace("#", "") || "visao");
}
