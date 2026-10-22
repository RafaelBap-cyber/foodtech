// Cadastro de ONG (pages/ong/register.html).
const form = document.querySelector("#register-form");
const status = document.querySelector("#form-status");
const submitButton = form.querySelector('button[type="submit"]');
const foodOptions = document.querySelector("#food-options");

function showFieldError(name, message) {
  const input = form.elements[name];
  const error = document.querySelector(`#${name}-error`);
  input.setAttribute("aria-invalid", message ? "true" : "false");
  if (message) input.setAttribute("aria-describedby", `${name}-error`);
  else input.removeAttribute("aria-describedby");
  error.hidden = !message;
  error.textContent = message || "";
}

function validateAddress({ street, number, city, state }) {
  const errors = {};
  if (!street) errors.street = "Informe a rua.";
  if (!number) errors.number = "Informe o número.";
  if (!city) errors.city = "Informe a cidade.";
  if (!/^[A-Za-z]{2}$/.test(state)) errors.state = "Use 2 letras, como SP.";
  return errors;
}

async function loadFoodTypes() {
  try {
    const { foodTypes } = await FoodTechApi.request("/api/food-types");
    foodOptions.replaceChildren(...foodTypes.map((type) => {
      const label = document.createElement("label");
      label.className = "check";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "foodTypeIds";
      input.value = type.id;
      label.append(input, ` ${type.name}`);
      return label;
    }));
  } catch (error) {
    foodOptions.innerHTML = `<p class="field-hint">Não foi possível carregar os alimentos. Você pode cadastrar a ONG mesmo assim.</p>`;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  status.hidden = true;
  status.textContent = "";

  const value = (name) => form.elements[name].value.trim();
  const name = value("name");
  const email = value("email");
  const phone = value("phone");
  const password = form.password.value;
  const ong = {
    street: value("street"),
    number: value("number"),
    neighborhood: value("neighborhood"),
    city: value("city"),
    state: value("state").toUpperCase(),
    zipCode: value("zipCode"),
    description: value("description"),
    foodTypeIds: [...form.querySelectorAll('[name="foodTypeIds"]:checked')].map((input) => input.value),
  };

  const errors = {
    ...FoodTechAuth.validateRegister({ name, email, phone, password }),
    ...validateAddress(ong),
  };

  ["name", "email", "phone", "password", "street", "number", "city", "state"].forEach((field) => {
    showFieldError(field, errors[field]);
  });

  if (Object.keys(errors).length) {
    form.querySelector('[aria-invalid="true"]').focus();
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Cadastrando...";

  try {
    await FoodTechAuth.register({ userType: "ong", name, email, phone, password, ong });
    window.location.href = "../painel/index.html";
  } catch (error) {
    status.hidden = false;
    status.classList.add("is-error");
    status.textContent = error.message || "Não foi possível criar a conta. Tente novamente.";
    submitButton.disabled = false;
    submitButton.textContent = "Cadastrar";
  }
});

loadFoodTypes();
