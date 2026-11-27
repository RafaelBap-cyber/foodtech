// Comportamentos de interface compartilhados por todas as páginas:
// menu mobile, cabeçalho ao rolar, revelação de seções, contadores
// animados e helpers (ícones, iniciais) usados pelos scripts das telas.

const FoodTechUI = {
  icons: {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    phone: '<path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 5 6a2 2 0 0 1 2-2"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    heart: '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"/>',
    home: '<path d="M4 20V10l8-6 8 6v10"/><path d="M10 20v-6h4v6"/>',
    bowl: '<path d="M4 11h16a8 8 0 0 1-16 0Z"/><path d="M7 11c0-4 10-4 10 0"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    chat: '<path d="M5 18.5 4 21l3.5-1.5A8.5 8.5 0 1 0 5 18.5Z"/>',
    map: '<path d="m9 4-5 2v14l5-2 6 2 5-2V4l-5 2-6-2Z"/><path d="M9 4v14M15 6v14"/>',
    box: '<path d="M4 8 12 4l8 4v8l-8 4-8-4V8Z"/><path d="m4 8 8 4 8-4M12 12v8"/>',
    message: '<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V6Z"/>',
    empty: '<circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M9 15.5c1.8-1.3 4.2-1.3 6 0"/>',
  },

  // Devolve um <svg> de traço, no padrão dos ícones do site.
  icon(name, className = "") {
    const span = document.createElement("span");
    span.innerHTML =
      `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
      `stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
      `${this.icons[name] || ""}</svg>`;
    return span.firstElementChild;
  },

  initials(name) {
    const words = String(name || "").trim().split(/\s+/).filter((word) => word.length > 2 || /^[A-ZÀ-Ú]/.test(word));
    const letters = (words.length ? words : [String(name || "?")])
      .slice(0, 2)
      .map((word) => word[0])
      .join("");
    return letters.toUpperCase() || "?";
  },

  // Cor estável por nome, para os avatares não mudarem a cada carga.
  tone(name) {
    let total = 0;
    for (const char of String(name || "")) total += char.charCodeAt(0);
    return String(total % 4);
  },

  avatar(name, className = "avatar") {
    const node = document.createElement("span");
    node.className = className;
    node.dataset.tone = this.tone(name);
    node.setAttribute("aria-hidden", "true");
    node.textContent = this.initials(name);
    return node;
  },

  // Card de ONG usado na lista pública e no mapa.
  // options: { href, distance (texto opcional), headingLevel }
  ongCard(ong, options = {}) {
    const card = document.createElement("article");
    card.className = "ong-card";

    const head = document.createElement("div");
    head.className = "ong-card-head";
    const title = document.createElement(options.headingLevel || "h2");
    title.textContent = ong.nome;
    const titleWrap = document.createElement("div");
    titleWrap.append(title);
    if (ong.cidade) {
      const city = document.createElement("span");
      city.className = "ong-card-city";
      city.textContent = ong.cidade;
      titleWrap.append(city);
    }
    head.append(this.avatar(ong.nome), titleWrap);
    card.append(head);

    if (ong.descricao) {
      const desc = document.createElement("p");
      desc.className = "ong-card-desc";
      desc.textContent = ong.descricao;
      card.append(desc);
    }

    const foods = ong.alimentosAceitos || [];
    if (foods.length) {
      const tags = document.createElement("div");
      tags.className = "ong-card-tags";
      tags.setAttribute("aria-label", "Alimentos aceitos");
      const visible = 4;
      foods.slice(0, visible).forEach((food) => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = food;
        tags.append(tag);
      });
      if (foods.length > visible) {
        const more = document.createElement("span");
        more.className = "tag tag-more";
        more.textContent = `+${foods.length - visible}`;
        more.title = foods.slice(visible).join(", ");
        tags.append(more);
      }
      card.append(tags);
    }

    if (options.distance) {
      const distance = document.createElement("span");
      distance.className = "pill ong-card-distance";
      distance.append(this.icon("pin"), options.distance);
      card.append(distance);
    }

    const foot = document.createElement("div");
    foot.className = "ong-card-foot";

    const address = document.createElement("p");
    address.className = "ong-card-address";
    const addressText = document.createElement("span");
    addressText.textContent = ong.endereco || "Endereço não informado";
    address.append(this.icon("pin"), addressText);

    const link = document.createElement("a");
    link.className = "btn btn-outline btn-small";
    link.href = options.href;
    link.append("Ver detalhes", this.icon("arrow", "icon-arrow"));
    link.setAttribute("aria-label", `Ver detalhes de ${ong.nome}`);

    foot.append(address, link);
    card.append(foot);
    return card;
  },

  emptyState(title, text) {
    const box = document.createElement("div");
    box.className = "empty-state";
    const strong = document.createElement("strong");
    strong.textContent = title;
    const p = document.createElement("p");
    p.textContent = text;
    box.append(this.icon("empty"), strong, p);
    return box;
  },

  // Anima números de 0 até o valor de data-count.
  countUp(element) {
    const target = Number(element.dataset.count);
    if (!Number.isFinite(target)) return;

    const prefix = element.dataset.prefix || "";
    const format = (value) => prefix + Math.round(value).toLocaleString("pt-BR");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      element.textContent = format(target);
      return;
    }

    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = format(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },
};

(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Menu mobile: fecha ao escolher um link.
  const menuToggle = document.querySelector(".menu-toggle");
  document.querySelectorAll(".header-panel a, .app-tools a").forEach((link) => {
    link.addEventListener("click", () => {
      if (menuToggle) menuToggle.checked = false;
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle && menuToggle.checked) {
      menuToggle.checked = false;
    }
  });

  // Cabeçalho ganha sombra depois de rolar.
  const header = document.querySelector(".site-header");
  if (header) {
    const update = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  // Inicial do usuário no chip do cabeçalho do app.
  const userName = document.querySelector("#user-name");
  const chip = userName && userName.closest(".user-chip");
  if (chip) {
    const sync = () => {
      chip.dataset.initial = FoodTechUI.initials(userName.textContent).slice(0, 1);
    };
    sync();
    new MutationObserver(sync).observe(userName, { childList: true, characterData: true, subtree: true });
  }

  // Revelação ao rolar e contadores.
  const revealItems = document.querySelectorAll("[data-reveal]");
  const counters = document.querySelectorAll("[data-count]");

  if (!("IntersectionObserver" in window) || reduce) {
    counters.forEach((counter) => FoodTechUI.countUp(counter));
    return;
  }

  root.classList.add("motion");

  revealItems.forEach((item) => {
    if (item.dataset.reveal) item.style.setProperty("--delay", `${item.dataset.reveal}s`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        if (target.hasAttribute("data-reveal")) target.classList.add("is-visible");
        if (target.hasAttribute("data-count")) FoodTechUI.countUp(target);
        observer.unobserve(target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
  counters.forEach((counter) => observer.observe(counter));
})();
