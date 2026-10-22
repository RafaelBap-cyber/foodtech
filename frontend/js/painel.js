const session = FoodTechSession.read();

if (!session) {
  window.location.replace("../auth/login.html");
}

const ongs = [
  { id: "esperanca", name: "ONG Esperança", city: "Campinas", area: "Centro", foods: "Arroz, feijão, leite", mine: false },
  { id: "vida-nova", name: "Instituto Vida Nova", city: "Campinas", area: "Cambuí", foods: "Hortaliças e frutas", mine: false },
  { id: "recomeço", name: "Projeto Recomeço", city: "Campinas", area: "Taquaral", foods: "Cestas básicas", mine: false },
  { id: "solidariedade", name: "Casa da Solidariedade", city: "Valinhos", area: "Centro", foods: "Alimentos não perecíveis", mine: false },
];

if (session && session.profile === "ong") {
  ongs[0].mine = true;
  ongs[0].name = "Minha organização";
}

const donations = [
  { id: 1, food: "Arroz", amount: "5 kg", ong: "ONG Esperança", status: "pending" },
  { id: 2, food: "Feijão", amount: "3 kg", ong: "Instituto Vida Nova", status: "accepted" },
];

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
const statusLabel = { pending: "Pendente", accepted: "Aceita", cancelled: "Recusada" };

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

  const destino = document.querySelector("#destino");
  ongs.forEach((ong) => {
    const option = document.createElement("option");
    option.value = ong.name;
    option.textContent = `${ong.name} · ${ong.city}`;
    destino.appendChild(option);
  });

  renderMetrics();
  renderOngs("");
  renderDonations();
  renderThreads();
}

function renderMetrics() {
  const pending = donations.filter((item) => item.status === "pending").length;
  const items = session.profile === "ong"
    ? [
        [String(donations.length), "Doações na fila"],
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

function renderOngs(query) {
  const term = query.trim().toLowerCase();
  const list = ongs.filter((ong) => `${ong.name} ${ong.city} ${ong.area} ${ong.foods}`.toLowerCase().includes(term));
  const root = document.querySelector("#lista-ongs");
  root.innerHTML = list.length
    ? list.map((ong) => `
        <article class="work-card">
          <p class="choice-kicker">${ong.mine ? "Sua ONG" : ong.city}</p>
          <h2>${ong.name}</h2>
          <p>${ong.area} · ${ong.foods}</p>
          <a class="text-link" href="#doacoes" data-view="doacoes">Levar para doações</a>
        </article>
      `).join("")
    : `<p class="empty">Nenhuma ONG encontrada para essa busca.</p>`;
}

function renderDonations() {
  const body = document.querySelector("#lista-doacoes");
  body.innerHTML = donations.map((item) => `
    <tr>
      <td>${item.food}</td>
      <td>${item.amount}</td>
      <td>${item.ong}</td>
      <td><span class="status status-${item.status}">${statusLabel[item.status]}</span></td>
      ${session.profile === "ong" ? `<td class="row-actions">
        <button type="button" data-status="accepted" data-id="${item.id}">Aceitar</button>
        <button type="button" data-status="cancelled" data-id="${item.id}">Recusar</button>
      </td>` : ""}
    </tr>
  `).join("");
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

document.querySelector("#form-doacao").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  let valid = true;

  ["alimento", "quantidade", "destino"].forEach((name) => {
    const input = form.elements[name];
    const error = document.querySelector(`#${name}-error`);
    const empty = !input.value.trim();
    input.setAttribute("aria-invalid", empty ? "true" : "false");
    error.hidden = !empty;
    error.textContent = empty ? "Preencha este campo." : "";
    if (empty) valid = false;
  });

  if (!valid) return;

  donations.unshift({
    id: Date.now(),
    food: form.alimento.value.trim(),
    amount: form.quantidade.value.trim(),
    ong: form.destino.value,
    status: "pending",
  });
  form.reset();
  renderDonations();
  renderMetrics();
});

document.querySelector("#lista-doacoes").addEventListener("click", (event) => {
  const button = event.target.closest("[data-status]");
  if (!button) return;
  const donation = donations.find((item) => item.id === Number(button.dataset.id));
  if (!donation) return;
  donation.status = button.dataset.status;
  renderDonations();
  renderMetrics();
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
