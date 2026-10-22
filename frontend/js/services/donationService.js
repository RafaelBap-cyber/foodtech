const FoodTechDonations = {
  useMock: true,
  // v2: as ONGs passaram a vir de /api/ongs (ids numéricos).
  storageKey: "foodtech-mock-donations-v2",
  maxDescription: 300,

  units: [
    { value: "kg", label: "kg" },
    { value: "g", label: "g" },
    { value: "l", label: "litros" },
    { value: "un", label: "unidades" },
    { value: "porcoes", label: "porções" },
  ],

  statusLabel: {
    pending: "Pendente",
    accepted: "Aceita",
    completed: "Concluída",
    cancelled: "Recusada",
  },

  // Mesmos tipos do seed do schema.sql (ids de mentira, só para o mock).
  foodTypes: [
    { id: "ft-1", name: "Arroz" },
    { id: "ft-2", name: "Feijão" },
    { id: "ft-3", name: "Macarrão" },
    { id: "ft-4", name: "Leite" },
    { id: "ft-5", name: "Óleo" },
    { id: "ft-6", name: "Farinha" },
    { id: "ft-7", name: "Açúcar" },
    { id: "ft-8", name: "Frutas" },
    { id: "ft-9", name: "Verduras" },
    { id: "ft-10", name: "Legumes" },
    { id: "ft-11", name: "Carnes" },
    { id: "ft-12", name: "Enlatados" },
    { id: "ft-13", name: "Outros" },
  ],

  // Preenchido por listOngs(); usado pelo mock para guardar o nome da ONG.
  ongCache: [],

  // ---------- Operações públicas ----------

  async list() {
    if (!this.useMock) {
      const data = await FoodTechApi.request("/api/donations");
      return data.donations;
    }

    const donor = this.currentDonorId();
    const store = this.readStore(donor);
    return store.donations
      .filter((donation) => donation.donor_id === donor)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async get(id) {
    if (!this.useMock) {
      const data = await FoodTechApi.request(`/api/donations/${encodeURIComponent(id)}`);
      return data.donation;
    }

    const donor = this.currentDonorId();
    const store = this.readStore(donor);
    const donation = store.donations.find((item) => item.id === id && item.donor_id === donor);
    if (!donation) throw this.makeError(404, "Doação não encontrada.");
    return donation;
  },

  async create({ ong_id, description, items }) {
    const dados = {
      ong_id,
      description: (description || "").trim(),
      items: (items || []).map((item) => ({
        food_type_id: item.food_type_id,
        quantity: Number(item.quantity),
        unit: item.unit,
      })),
    };

    const errors = this.validate(dados);
    if (Object.keys(errors).length) {
      const error = this.makeError(400, "Confira os dados da doação.");
      error.errors = errors;
      throw error;
    }

    if (!this.useMock) {
      // O donor_id não é enviado: o back-end deve obtê-lo da autenticação.
      const data = await FoodTechApi.request("/api/donations", {
        method: "POST",
        body: JSON.stringify(dados),
      });
      return data.donation;
    }

    const donor = this.currentDonorId();
    const store = this.readStore(donor);
    const now = new Date().toISOString();
    const id = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const ong = this.ongCache.find((item) => item.id === dados.ong_id);

    const donation = {
      id,
      donor_id: donor,
      ong_id: dados.ong_id,
      ong_name: ong ? ong.name : "ONG",
      status: "pending",
      description: dados.description,
      created_at: now,
      updated_at: now,
      items: dados.items.map((item, index) => this.buildItem(id, index, item)),
    };

    store.donations.push(donation);
    this.writeStore(store);
    return donation;
  },

  async listFoodTypes() {
    if (!this.useMock) {
      // A rota /api/food-types ainda não existe; o formato abaixo é uma proposta.
      const data = await FoodTechApi.request("/api/food-types");
      return data.foodTypes;
    }

    return this.foodTypes.map((item) => ({ ...item }));
  },

  // As ONGs vêm sempre de /api/ongs (a mesma fonte do mapa e da listagem),
  // adaptadas para o formato usado pelas telas de doação.
  async listOngs() {
    const ongs = await FoodTechOngs.list();

    this.ongCache = ongs.map((ong) => ({
      id: String(ong.id),
      name: ong.nome,
      city: ong.endereco ? ong.endereco.split(",").pop().trim() : "",
    }));

    return this.ongCache.map((item) => ({ ...item }));
  },

  // ---------- Validação e formatação ----------

  // Devolve um objeto vazio quando está tudo certo. Pode ser usado pelas telas.
  validate({ ong_id, description, items }) {
    const errors = {};

    if (!ong_id) errors.ong_id = "Escolha a ONG que vai receber a doação.";

    if (description && description.length > this.maxDescription) {
      errors.description = `Use no máximo ${this.maxDescription} caracteres.`;
    }

    if (!Array.isArray(items) || items.length === 0) {
      errors.items = "Adicione pelo menos um item.";
      return errors;
    }

    const itemErrors = items.map((item) => {
      const quantity = Number(item.quantity);
      if (!item.food_type_id) return "Escolha o tipo de alimento.";
      if (!Number.isFinite(quantity) || quantity <= 0) return "Informe uma quantidade maior que zero.";
      if (quantity > 99999999.99) return "A quantidade informada é grande demais.";
      if (!this.units.some((unit) => unit.value === item.unit)) return "Escolha a unidade.";
      return "";
    });

    if (itemErrors.some(Boolean)) errors.itemErrors = itemErrors;
    return errors;
  },

  formatQuantity(quantity, unit) {
    const found = this.units.find((item) => item.value === unit);
    const number = Number(quantity).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
    return `${number} ${found ? found.label : unit}`;
  },

  formatDate(iso) {
    return new Date(iso).toLocaleDateString("pt-BR");
  },

  // Ex.: "Arroz (5 kg), Óleo (2 litros)"
  summarizeItems(items) {
    return (items || [])
      .map((item) => `${item.food_type_name} (${this.formatQuantity(item.quantity, item.unit)})`)
      .join(", ");
  },

  // ---------- Internos do mock ----------

  currentDonorId() {
    const session = typeof FoodTechSession !== "undefined" ? FoodTechSession.read() : null;
    return session && session.email ? session.email : "mock-donor";
  },

  makeError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
  },

  buildItem(donationId, index, item) {
    const food = this.foodTypes.find((type) => type.id === item.food_type_id);
    return {
      id: `${donationId}-i${index + 1}`,
      food_type_id: item.food_type_id,
      food_type_name: food ? food.name : "Outros",
      quantity: Math.round(item.quantity * 100) / 100,
      unit: item.unit,
    };
  },

  // O armazenamento guarda todas as doações do mock e quais doadores já
  // receberam as doações de exemplo (cada doador recebe uma vez).
  readStore(donor) {
    let store = null;

    try {
      store = JSON.parse(localStorage.getItem(this.storageKey));
    } catch {
      store = null;
    }

    if (!store || !Array.isArray(store.donations) || !Array.isArray(store.seeded)) {
      store = { donations: [], seeded: [] };
    }

    if (donor && !store.seeded.includes(donor)) {
      store.donations.push(...this.sampleDonations(donor));
      store.seeded.push(donor);
      this.writeStore(store);
    }

    return store;
  },

  writeStore(store) {
    localStorage.setItem(this.storageKey, JSON.stringify(store));
  },

  // Apaga o mock (útil para testar o estado inicial).
  resetMock() {
    localStorage.removeItem(this.storageKey);
  },

  sampleDonations(donor) {
    const day = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const tag = Math.random().toString(36).slice(2, 7);

    // Mesmas ONGs do mock do back-end (backend/src/services/ongService.js).
    const ongNames = { 1: "ONG Mão Amiga", 2: "Banco de Alimentos Esperança" };

    const build = (suffix, ongId, status, description, daysAgo, items) => {
      const id = `mock-exemplo-${suffix}-${tag}`;
      const date = new Date(now - daysAgo * day).toISOString();
      return {
        id,
        donor_id: donor,
        ong_id: ongId,
        ong_name: ongNames[ongId],
        status,
        description,
        created_at: date,
        updated_at: date,
        items: items.map((item, index) => this.buildItem(id, index, item)),
      };
    };

    return [
      build("1", "1", "pending", "Arroz e óleo separados para retirada.", 1, [
        { food_type_id: "ft-1", quantity: 5, unit: "kg" },
        { food_type_id: "ft-5", quantity: 2, unit: "l" },
      ]),
      build("2", "2", "accepted", "", 4, [
        { food_type_id: "ft-2", quantity: 3, unit: "kg" },
      ]),
    ];
  },
};
