const form = document.querySelector("#register-form");
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

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const password = form.password.value;
  const profile = form.dataset.profile;
  const errors = FoodTechAuth.validateRegister({ name, email, phone, password });

  showFieldError("name", errors.name);
  showFieldError("email", errors.email);
  showFieldError("phone", errors.phone);
  showFieldError("password", errors.password);

  if (Object.keys(errors).length) return;

  const result = FoodTechAuth.register({ name, email, phone, profile });
  status.hidden = false;
  status.textContent = result.message;
});
