const FoodTechDonations = {
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

  // ---------- Operações públicas ----------

  // Doador: doações que fez. ONG: doações que recebeu.
  async list() {
    const data = await FoodTechApi.request("/api/donations");
    return data.donations;
  },

  async get(id) {
    const data = await FoodTechApi.request(`/api/donations/${encodeURIComponent(id)}`);
    return data.donation;
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
      const error = new Error("Confira os dados da doação.");
      error.status = 400;
      error.errors = errors;
      throw error;
    }

    // O donor_id não é enviado: o back-end usa o usuário logado.
    const data = await FoodTechApi.request("/api/donations", {
      method: "POST",
      body: JSON.stringify(dados),
    });
    return data.donation;
  },

  // Só a ONG: accepted, completed ou cancelled.
  async updateStatus(id, status) {
    const data = await FoodTechApi.request(`/api/donations/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return data.donation;
  },

  async listFoodTypes() {
    const data = await FoodTechApi.request("/api/food-types");
    return data.foodTypes;
  },

  // As ONGs vêm de /api/ongs (a mesma fonte do mapa e da listagem),
  // adaptadas para o formato usado pelas telas de doação.
  async listOngs() {
    const ongs = await FoodTechOngs.list();
    return ongs.map((ong) => ({ id: String(ong.id), name: ong.nome, city: ong.cidade || "" }));
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
};
