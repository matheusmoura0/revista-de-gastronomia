const CONTENT_HUB_API = "https://correio-content-hub.onrender.com/api/v1/sites/by-domain/articles?domain=revistadegastronomia.com.br";

function fillCard(card, article, type = "story") {
  if (!card || !article) return;
  card.href = `materia.html?id=${article.id}`;
  card.target = "_blank";
  card.rel = "noopener";
  const image = card.querySelector("img");
  if (image && article.image_url) image.src = article.image_url;
  const title = card.querySelector(type === "hero" ? "h1" : type === "editor" ? "h2" : "h3");
  if (title) title.textContent = article.title;
  const description = card.querySelector("p");
  if (description && article.description) description.textContent = article.description;
  const category = card.querySelector(".eyebrow, .story-image span");
  if (category && article.category) category.textContent = article.category.replaceAll("-", " ");
}

async function loadPublishedArticles() {
  try {
    const response = await fetch(`${CONTENT_HUB_API}&_=${Date.now()}`, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Content Hub respondeu com HTTP ${response.status}`);
    const articles = await response.json();
    fillCard(document.querySelector(".hero"), articles.find((item) => item.placement === "hero"), "hero");
    fillCard(document.querySelector(".side-lead > a"), articles.find((item) => item.placement === "editor_pick"), "editor");
    const latest = articles.filter((item) => item.placement === "latest").slice(0, 6);
    document.querySelectorAll(".story").forEach((card, index) => fillCard(card, latest[index]));
  } catch (error) {
    console.warn("A capa continuará exibindo o conteúdo editorial de reserva.", error);
  }
}

function enhanceNavigation() {
  const search = document.querySelector(".search");
  if (search) {
    search.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg>';
    search.addEventListener("click", () => location.href = "busca.html");
  }
  const menu = document.querySelector(".mobile-menu");
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && menu) menu.open = false; });
  document.querySelectorAll("img").forEach((image) => { image.loading = "lazy"; image.decoding = "async"; });
  const top = document.createElement("button");
  top.className = "back-to-top";
  top.setAttribute("aria-label", "Voltar ao topo");
  top.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>';
  top.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  document.body.append(top);
  addEventListener("scroll", () => top.classList.toggle("visible", scrollY > 500), { passive: true });
}

document.addEventListener("DOMContentLoaded", () => {
  enhanceNavigation();
  loadPublishedArticles();
  const form = document.querySelector(".newsletter form");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = form.querySelector("button");
    button.textContent = "INSCRIÇÃO REALIZADA ✓";
    form.reset();
  });
});
