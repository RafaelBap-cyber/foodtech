const form = document.querySelector("#login-form");
const status = document.querySelector("#form-status");

function showFieldError(name, message) {
  const input = form.elements[name];
  const error = document.querySelector(`#${name}-error`);
  input.setAttribute("aria-invalid", message ? "true" : "false");
  if (message) input.setAttribute("aria-describedby", `${name}-error`);
  else input.removeAttribute("aria-describedby");
  error.hidden = !message;
  error.textContent = message || "";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  status.hidden = true;
  status.textContent = "";

  const email = form.email.value.trim();
  const password = form.password.value;
  const profile = form.dataset.profile;
  const errors = FoodTechAuth.validate({ email, password });

  showFieldError("email", errors.email);
  showFieldError("password", errors.password);

  if (errors.email || errors.password) return;

  const result = FoodTechAuth.login({ email, password, profile });
  FoodTechSession.start(result);
  window.location.href = "../painel/index.html";
});
