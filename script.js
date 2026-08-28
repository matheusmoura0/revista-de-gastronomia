const CONTENT_HUB_API = "/api/articles";

function fillCard(card, article, type = "story") {
  if (!card || !article) return;
  card.href = `materia.html?id=${article.id}`;
  card.target = "_blank";
  card.rel = "noopener";
  const image = card.querySelector("img");
  if (image) { if (article.image_url) image.src = article.image_url; else image.remove(); }
  const title = card.querySelector(type === "hero" ? "h1" : type === "editor" ? "h2" : "h3");
  if (title) title.textContent = article.title;
  const description = card.querySelector("p");
  if (description && article.description) description.textContent = article.description;
  const category = card.querySelector(".eyebrow, .story-image span");
  if (category && article.category) category.textContent = article.category.replaceAll("-", " ");
}

function fillTextLink(element, article) {
  if (!element || !article) return;
  element.textContent = article.title;
  const openArticle = () => { location.href = `materia.html?id=${article.id}`; };
  if (element.tagName === "A") {
    element.href = `materia.html?id=${article.id}`;
  } else {
    element.tabIndex = 0;
    element.setAttribute("role", "link");
    element.addEventListener("click", openArticle);
    element.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openArticle();
      }
    });
  }
}

async function loadPublishedArticles() {
  try {
    const response = await fetch(CONTENT_HUB_API, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Content Hub respondeu com HTTP ${response.status}`);
    const payload = await response.json();
    const articles = Array.isArray(payload) ? payload : Array.isArray(payload.articles) ? payload.articles : [];
    if (!articles.length) throw new Error("Nenhuma matéria publicada");

    const bySlot = new Map(articles.filter(item => item.slot).map(item => [item.slot, item]));
    const used = new Set();
    const fallbackPool = articles.filter(item => !item.slot);
    const take = (slot) => {
      const exact = bySlot.get(slot);
      if (exact && !used.has(exact.id)) {
        used.add(exact.id);
        return exact;
      }
      const legacy = fallbackPool.find(item =>
        !used.has(item.id) &&
        ((slot === "hero" && item.placement === "hero") ||
         (slot === "editor_pick" && item.placement === "editor_pick"))
      );
      const next = legacy || fallbackPool.find(item => !used.has(item.id));
      if (next) used.add(next.id);
      return next;
    };

    fillCard(document.querySelector(".hero"), take("hero"), "hero");
    fillCard(document.querySelector(".side-lead > a"), take("editor_pick"), "editor");

    document.querySelectorAll(".story").forEach((card, index) => {
      fillCard(card, take(`fresh_${index + 1}`));
    });
    document.querySelectorAll(".breaking div span").forEach((item, index) => {
      fillTextLink(item, take(`breaking_${index + 1}`));
    });
    document.querySelectorAll(".popular li a").forEach((item, index) => {
      fillTextLink(item, take(`popular_${index + 1}`));
    });
  } catch (error) {
    console.warn("A capa continuará exibindo o conteúdo editorial de reserva.", error);
  }
}

function enhanceNavigation() {
  const header = document.querySelector("header");
  header?.classList.add("portal-header");
  const oldMenu = document.querySelector(".mobile-menu");
  if (oldMenu) {
    oldMenu.outerHTML = `<button class="icon-button menu-toggle" aria-label="Abrir menu" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>`;
    header.insertAdjacentHTML("beforeend", `<div class="mobile-drawer" aria-hidden="true"><div class="drawer-head"><b>Menu</b><button class="icon-button menu-close" aria-label="Fechar menu"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><nav><a href="editoria.html?categoria=receitas">Receitas</a><a href="editoria.html?categoria=restaurantes">Restaurantes</a><a href="editoria.html?categoria=tendencias">Tendências</a><a href="editoria.html?categoria=viagens">Viagens</a><a href="editoria.html?categoria=bebidas">Bebidas</a><a href="editoria.html?categoria=curiosidades">Curiosidades</a><a href="busca.html">Buscar</a><a href="sobre.html">Sobre</a><a href="anuncie.html">Anuncie</a></nav></div><div class="drawer-backdrop"></div>`);
    const drawer = header.querySelector(".mobile-drawer");
    const backdrop = header.querySelector(".drawer-backdrop");
    const toggle = header.querySelector(".menu-toggle");
    const openMenu = () => { drawer.classList.add("open"); backdrop.classList.add("open"); drawer.setAttribute("aria-hidden","false"); toggle.setAttribute("aria-expanded","true"); document.body.classList.add("menu-open"); };
    const closeMenu = () => { drawer.classList.remove("open"); backdrop.classList.remove("open"); drawer.setAttribute("aria-hidden","true"); toggle.setAttribute("aria-expanded","false"); document.body.classList.remove("menu-open"); };
    toggle.addEventListener("click", openMenu);
    header.querySelector(".menu-close").addEventListener("click", closeMenu);
    backdrop.addEventListener("click", closeMenu);
    document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
  }
  const search = document.querySelector(".search");
  if (search) {
    search.classList.add("icon-button");
    search.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg>';
    search.addEventListener("click", () => location.href = "busca.html");
  }
  document.querySelectorAll("img").forEach(image => { image.loading = "lazy"; image.decoding = "async"; });
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
  addEventListener("focus", loadPublishedArticles);
  const form = document.querySelector(".newsletter form");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = form.querySelector("button");
    button.textContent = "INSCRIÇÃO REALIZADA ✓";
    form.reset();
  });
});
