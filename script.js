document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".newsletter form");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = form.querySelector("button");
    button.textContent = "INSCRIÇÃO REALIZADA ✓";
    form.reset();
  });
});

