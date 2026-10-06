const tabs = document.querySelectorAll('.register-tab');
const roleInput = document.getElementById('role');
const form = document.getElementById('register-form');

tabs.forEach((tab) => {
  tab.addEventListener('click', function () {
    // Remove o estado "ativo" de todas as abas
    tabs.forEach((t) => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });

    // Ativa só a aba clicada
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    // Guarda qual papel (doador ou ong) foi escolhido,
    // pra usar depois quando enviarmos o formulário
    roleInput.value = tab.dataset.role;
  });
});

form.addEventListener('submit', function (event) {
  event.preventDefault();

  // A lógica de validação e o envio para o back-end/Supabase
  // serão adicionados em uma próxima etapa.
  console.log('Formulário enviado (ainda sem lógica):', {
    role: roleInput.value,
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    password: document.getElementById('password').value,
  });
});
