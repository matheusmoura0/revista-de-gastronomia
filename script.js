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

document.addEventListener("DOMContentLoaded", () => {
  loadPublishedArticles();
  const form = document.querySelector(".newsletter form");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = form.querySelector("button");
    button.textContent = "INSCRIÇÃO REALIZADA ✓";
    form.reset();
  });
});
