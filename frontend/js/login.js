const form = document.querySelector("#login-form");
const status = document.querySelector("#form-status");
const submitButton = form.querySelector('button[type="submit"]');

function showFieldError(name, message) {
  const input = form.elements[name];
  const error = document.querySelector(`#${name}-error`);
  input.setAttribute("aria-invalid", message ? "true" : "false");
  if (message) input.setAttribute("aria-describedby", `${name}-error`);
  else input.removeAttribute("aria-describedby");
  error.hidden = !message;
  error.textContent = message || "";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  status.hidden = true;
  status.textContent = "";

  const email = form.email.value.trim();
  const password = form.password.value;
  const errors = FoodTechAuth.validate({ email, password });

  showFieldError("email", errors.email);
  showFieldError("password", errors.password);

  if (errors.email || errors.password) return;

  submitButton.disabled = true;
  submitButton.textContent = "Entrando...";

  try {
    await FoodTechAuth.login({ email, password });
    window.location.href = "../painel/index.html";
  } catch (error) {
    status.hidden = false;
    status.classList.add("is-error");
    status.textContent = error.message || "Não foi possível entrar. Tente novamente.";
    submitButton.disabled = false;
    submitButton.textContent = "Entrar";
  }
});
