const menuToggle = document.querySelector(".menu-toggle");

document.querySelectorAll(".header-panel a").forEach((link) => {
  link.addEventListener("click", () => {
    if (menuToggle) menuToggle.checked = false;
  });
});
