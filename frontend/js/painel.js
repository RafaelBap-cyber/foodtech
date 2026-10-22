const session = FoodTechSession.read();

if (!session) {
  window.location.replace("../auth/login.html");
}

// ONGs da rede (/api/ongs) e doações do usuário logado (/api/donations).
let ongs = [];
let donations = [];

// Conversas entre doador e ONG (/api/messages).
let conversations = [];
let activeContact = null; // { id, name, profile, ongId }
let lastMessageId = null;
let messagesTimer = null;
let messagesOpen = false;
const MESSAGES_REFRESH_MS = 10000;

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

      if (ong.profileId) {
        const mensagem = element("a", "text-link", "Mensagem");
        mensagem.href = `?conversa=${encodeURIComponent(ong.profileId)}#mensagens`;
        card.append(" · ", mensagem);
      }
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

    const mensagem = element("a", "text-link", "Mensagem");
    mensagem.href = `?conversa=${encodeURIComponent(item.donor_id)}#mensagens`;
    actions.append(mensagem);

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

function formatMessageTime(iso) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

function renderConversations() {
  const root = document.querySelector("#conversas");
  const lista = [...conversations];

  // Conversa nova (aberta por um link) ainda sem mensagens.
  if (activeContact && !lista.some((item) => item.id === activeContact.id)) {
    lista.unshift({ ...activeContact, lastMessage: "Nova conversa", lastFromMe: false });
  }

  if (!lista.length) {
    root.replaceChildren(element("li", "empty", session.profile === "ong"
      ? "Quando um doador escrever, a conversa aparece aqui."
      : "Nenhuma conversa ainda. Na aba ONGs, clique em Mensagem."));
    return;
  }

  root.replaceChildren(...lista.map((item) => {
    const button = element("button", "thread-item");
    button.type = "button";
    button.dataset.contact = item.id;
    if (activeContact && item.id === activeContact.id) button.setAttribute("aria-current", "true");
    button.append(
      element("strong", "", item.name),
      element("small", "", `${item.lastFromMe ? "Você: " : ""}${item.lastMessage}`)
    );

    const li = element("li");
    li.append(button);
    return li;
  }));
}

function renderMessages(messages) {
  const root = document.querySelector("#bolhas");
  lastMessageId = messages.length ? messages[messages.length - 1].id : null;

  if (!messages.length) {
    root.replaceChildren(element("p", "empty", "Nenhuma mensagem ainda. Escreva a primeira!"));
    return;
  }

  root.replaceChildren(...messages.map((message) => {
    const bubble = element("p", message.mine ? "bubble mine" : "bubble", message.content);
    bubble.append(element("small", "bubble-time", formatMessageTime(message.created_at)));
    return bubble;
  }));
  root.scrollTop = root.scrollHeight;
}

function showThreadMessage(title, message) {
  activeContact = null;
  document.querySelector("#conversa-titulo").textContent = title;
  document.querySelector("#bolhas").replaceChildren(element("p", "empty", message));
  document.querySelector("#form-mensagem").hidden = true;
}

async function openConversation(contactId) {
  const data = await FoodTechContact.conversation(contactId);
  activeContact = data.with;

  const titulo = document.querySelector("#conversa-titulo");
  titulo.replaceChildren(activeContact.name);
  if (activeContact.ongId) {
    const perfil = element("a", "text-link", "Ver perfil");
    perfil.href = `../ong/profile.html?id=${encodeURIComponent(activeContact.ongId)}`;
    titulo.append(" ", perfil);
  }

  renderMessages(data.messages);
  renderConversations();
  document.querySelector("#form-mensagem").hidden = false;
}

async function openMessages() {
  // O clique no menu e a mudança de hash chamam showView duas vezes.
  if (messagesOpen) return;
  messagesOpen = true;
  document.querySelector("#conversas").replaceChildren(element("li", "empty", "Carregando conversas..."));

  // ?conversa=<id do perfil> vem dos links "Mensagem"; depois de usado, sai da URL.
  const params = new URLSearchParams(window.location.search);
  const pedido = params.get("conversa");
  if (pedido) history.replaceState(null, "", window.location.pathname + window.location.hash);

  try {
    conversations = await FoodTechContact.conversations();
    const alvo = pedido || (activeContact && activeContact.id) || (conversations[0] && conversations[0].id);

    if (alvo) {
      await openConversation(alvo);
    } else {
      renderConversations();
      showThreadMessage("Mensagens", "Escolha uma conversa para começar.");
    }
  } catch (error) {
    renderConversations();
    showThreadMessage("Mensagens", error.message || "Não foi possível carregar as mensagens.");
  }

  // Só atualiza sozinho se a aba ainda estiver aberta.
  if (messagesOpen) messagesTimer = setInterval(refreshMessages, MESSAGES_REFRESH_MS);
}

// Busca mensagens novas sem atrapalhar quem está digitando.
async function refreshMessages() {
  try {
    conversations = await FoodTechContact.conversations();
    renderConversations();

    if (activeContact) {
      const data = await FoodTechContact.conversation(activeContact.id);
      const ultima = data.messages.length ? data.messages[data.messages.length - 1].id : null;
      if (ultima !== lastMessageId) renderMessages(data.messages);
    }
  } catch {
    // Tenta de novo na próxima rodada.
  }
}

function stopMessages() {
  messagesOpen = false;
  clearInterval(messagesTimer);
  messagesTimer = null;
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
  if (view === "mensagens") openMessages();
  else stopMessages();
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

document.querySelector("#conversas").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-contact]");
  if (!button || (activeContact && button.dataset.contact === activeContact.id)) return;

  try {
    await openConversation(button.dataset.contact);
  } catch (error) {
    showThreadMessage("Mensagens", error.message || "Não foi possível abrir a conversa.");
  }
});

document.querySelector("#form-mensagem").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const input = document.querySelector("#texto-mensagem");
  const button = form.querySelector('button[type="submit"]');
  const text = input.value.trim();
  if (!text || !activeContact) return;

  button.disabled = true;
  try {
    await FoodTechContact.send(activeContact.id, text);
    input.value = "";
    await refreshMessages();
  } catch (error) {
    alert(error.message || "Não foi possível enviar a mensagem.");
  } finally {
    button.disabled = false;
    input.focus();
  }
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
