const session = FoodTechDoacoesPagina.iniciar();

if (session) {
  const form = document.querySelector("#form-doacao");
  const ongSelect = form.elements.ong_id;
  const description = form.elements.description;
  const itemsRoot = document.querySelector("#lista-itens");
  const itemsError = document.querySelector("#itens-error");
  const template = document.querySelector("#modelo-item");
  const formStatus = document.querySelector("#form-status");
  const submitButton = document.querySelector("#enviar");
  const counter = document.querySelector("#contador");

  let foodTypes = [];
  let itemSeq = 0;

  // ---------- Utilidades ----------

  function setError(control, errorEl, message) {
    control.setAttribute("aria-invalid", message ? "true" : "false");
    if (message) control.setAttribute("aria-describedby", errorEl.id);
    else control.removeAttribute("aria-describedby");
    errorEl.hidden = !message;
    errorEl.textContent = message || "";
  }

  function showStatus(message) {
    formStatus.textContent = message;
    formStatus.hidden = false;
  }

  function hideStatus() {
    formStatus.hidden = true;
    formStatus.textContent = "";
  }

  function fillSelect(select, options, placeholder) {
    select.replaceChildren();

    const first = document.createElement("option");
    first.value = "";
    first.textContent = placeholder;
    select.append(first);

    options.forEach(({ value, label }) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.append(option);
    });
  }

  function updateCounter() {
    counter.textContent = `${description.value.length}/${FoodTechDonations.maxDescription}`;
  }

  // ---------- Itens da doação ----------

  function readItems() {
    return [...itemsRoot.querySelectorAll("[data-item]")].map((row) => ({
      row,
      food: row.querySelector('[name="food_type_id"]'),
      quantity: row.querySelector('[name="quantity"]'),
      unit: row.querySelector('[name="unit"]'),
    }));
  }

  // Sempre fica pelo menos um item, então o primeiro não pode ser removido.
  function refreshItems() {
    const rows = itemsRoot.querySelectorAll("[data-item]");
    rows.forEach((row, index) => {
      const remove = row.querySelector("[data-remover]");
      remove.hidden = rows.length === 1;
      remove.setAttribute("aria-label", `Remover item ${index + 1}`);
    });
  }

  function addItem(focusNew) {
    itemSeq += 1;
    const row = template.content.firstElementChild.cloneNode(true);

    row.querySelectorAll("[data-rotulo]").forEach((label) => {
      const control = row.querySelector(`[name="${label.dataset.rotulo}"]`);
      control.id = `item-${itemSeq}-${label.dataset.rotulo}`;
      label.htmlFor = control.id;
    });
    row.querySelector("[data-erro]").id = `item-${itemSeq}-erro`;

    fillSelect(
      row.querySelector('[name="food_type_id"]'),
      foodTypes.map((type) => ({ value: type.id, label: type.name })),
      "Selecione"
    );
    fillSelect(row.querySelector('[name="unit"]'), FoodTechDonations.units, "Selecione");

    row.querySelector("[data-remover]").addEventListener("click", () => {
      row.remove();
      refreshItems();
    });

    itemsRoot.append(row);
    refreshItems();
    if (focusNew) row.querySelector('[name="food_type_id"]').focus();
  }

  // ---------- Validação ----------

  function showItemError(item, message) {
    const errorEl = item.row.querySelector("[data-erro]");
    [item.food, item.quantity, item.unit].forEach((control) => {
      control.setAttribute("aria-invalid", "false");
      control.removeAttribute("aria-describedby");
    });

    errorEl.hidden = !message;
    errorEl.textContent = message || "";
    if (!message) return;

    // A mensagem vem do service; aqui só se descobre qual campo marcar.
    let invalid = item.unit;
    if (!item.food.value) invalid = item.food;
    else if (!item.quantity.validity.valid) invalid = item.quantity;

    invalid.setAttribute("aria-invalid", "true");
    invalid.setAttribute("aria-describedby", errorEl.id);
  }

  function showErrors(errors, items) {
    setError(ongSelect, document.querySelector("#ong_id-error"), errors.ong_id);
    setError(description, document.querySelector("#description-error"), errors.description);

    itemsError.hidden = !errors.items;
    itemsError.textContent = errors.items || "";

    items.forEach((item, index) => {
      showItemError(item, errors.itemErrors ? errors.itemErrors[index] : "");
    });
  }

  // ---------- Envio ----------

  function showSuccess(donation) {
    document.querySelector("#sucesso-texto").textContent =
      `Sua doação para ${donation.ong_name} foi registrada e aguarda a resposta da ONG.`;
    document.querySelector("#ver-detalhes").href =
      `detalhe.html?id=${encodeURIComponent(donation.id)}`;
    document.querySelector("#tela-nova").hidden = true;
    document.querySelector("#tela-sucesso").hidden = false;
    document.querySelector("#sucesso-titulo").focus();
  }

  function resetForm() {
    form.reset();
    itemsRoot.replaceChildren();
    addItem(false);
    showErrors({}, readItems());
    hideStatus();
    updateCounter();
    document.querySelector("#tela-sucesso").hidden = true;
    document.querySelector("#tela-nova").hidden = false;
    ongSelect.focus();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideStatus();

    const items = readItems();
    const values = {
      ong_id: ongSelect.value,
      description: description.value.trim(),
      items: items.map((item) => ({
        food_type_id: item.food.value,
        quantity: item.quantity.value,
        unit: item.unit.value,
      })),
    };

    const errors = FoodTechDonations.validate(values);
    showErrors(errors, items);

    if (Object.keys(errors).length) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Registrando...";

    try {
      const donation = await FoodTechDonations.create(values);
      showSuccess(donation);
    } catch (error) {
      if (error.errors) showErrors(error.errors, readItems());
      showStatus(error.message || "Não foi possível registrar a doação. Tente novamente.");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Registrar doação";
    }
  });

  document.querySelector("#add-item").addEventListener("click", () => {
    itemsError.hidden = true;
    addItem(true);
  });

  document.querySelector("#outra-doacao").addEventListener("click", resetForm);
  description.addEventListener("input", updateCounter);
  ongSelect.addEventListener("change", () => {
    setError(ongSelect, document.querySelector("#ong_id-error"), "");
  });

  // ---------- Início ----------

  async function carregar() {
    description.maxLength = FoodTechDonations.maxDescription;
    updateCounter();

    try {
      const [types, ongs] = await Promise.all([
        FoodTechDonations.listFoodTypes(),
        FoodTechDonations.listOngs(),
      ]);

      foodTypes = types;
      fillSelect(
        ongSelect,
        ongs.map((ong) => ({
          value: ong.id,
          label: ong.city ? `${ong.name} · ${ong.city}` : ong.name,
        })),
        "Selecione uma ONG"
      );
      addItem(false);
    } catch (error) {
      fillSelect(ongSelect, [], "Não foi possível carregar");
      submitButton.disabled = true;
      showStatus("Não foi possível carregar as ONGs e os tipos de alimento. Recarregue a página.");
    }
  }

  carregar();
}
