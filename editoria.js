const API = "/api/articles";
const category = new URLSearchParams(location.search).get("categoria") || "novidades";
const app = document.getElementById("portal-app");

const safeImageUrl = value => {
  try {
    const url = new URL(value, location.origin);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch { return ""; }
};

function shell() {
  app.innerHTML = `
    <div class="topline"><span>EDIÇÃO DIGITAL · ATUALIZAÇÃO CONTÍNUA</span><span>O prazer de comer bem, todos os dias.</span></div>
    <header class="portal-header">
      <div class="header-main">
        <a class="icon-button" href="index.html" aria-label="Voltar à capa">←</a>
        <a class="brand" href="index.html"><span>REVISTA DE</span><strong>GASTRONOMIA</strong><em>desde 2026</em></a>
        <a class="icon-button search-link" href="busca.html" aria-label="Pesquisar">⌕</a>
      </div>
      <nav class="desktop-nav">
        <a href="editoria.html?categoria=receitas">Receitas</a><a href="editoria.html?categoria=restaurantes">Restaurantes</a>
        <a href="editoria.html?categoria=tendencias">Tendências</a><a href="editoria.html?categoria=viagens">Viagens</a>
        <a href="editoria.html?categoria=bebidas">Bebidas</a><a href="editoria.html?categoria=curiosidades">Curiosidades</a>
      </nav>
    </header>
    <aside class="ad-slot leaderboard"><span>PUBLICIDADE</span><div>ESPAÇO PUBLICITÁRIO</div></aside>
    <main class="editorial-page">
      <div class="section-head"><div><span>EDITORIA</span><h1 id="category-title"></h1></div></div>
      <section class="editorial-leads" id="editorial-leads"></section>
      <div class="editorial-content-grid">
        <section><div class="editorial-list-heading">ÚLTIMAS DA EDITORIA</div><div class="editorial-list" id="editorial-list"></div></section>
        <aside class="editorial-rail"><div class="ad-slot rectangle"><span>PUBLICIDADE</span><div>ESPAÇO PUBLICITÁRIO</div></div><h2>Mais lidas</h2><div id="editorial-popular"></div></aside>
      </div>
    </main>
    <footer><a class="brand footer-brand" href="index.html"><span>REVISTA DE</span><strong>GASTRONOMIA</strong></a><p>Comer é cultura. Cozinhar é memória.</p><div><a href="sobre.html">Sobre</a><a href="contato.html">Contato</a><a href="privacidade.html">Privacidade</a><a href="anuncie.html">Anuncie</a></div><small>© 2026 Revista de Gastronomia.</small></footer>
  `;
  document.getElementById("category-title").textContent = category.replaceAll("-", " ");
  document.title = `${category.replaceAll("-", " ")} | Revista de Gastronomia`;
}

function articleLink(article, className, heading = "h2") {
  const link = document.createElement("a");
  link.className = className;
  link.href = `materia.html?id=${Number(article.id)}`;
  if (article.image_url) {
    const frame = document.createElement("span");
    frame.className = "editorial-image-frame";
    const image = document.createElement("img");
    image.src = safeImageUrl(article.image_url);
    image.alt = "";
    image.loading = "lazy";
    image.style.objectPosition = `${article.image_focus_x ?? 50}% ${article.image_focus_y ?? 50}%`;
    image.style.transform = `scale(${article.image_zoom ?? 1})`;
    frame.append(image);
    link.append(frame);
  }
  const copy = document.createElement("div");
  const label = document.createElement("span");
  label.textContent = (article.category || category).replaceAll("-", " ");
  const title = document.createElement(heading);
  title.textContent = article.title;
  copy.append(label, title);
  if (article.description) {
    const description = document.createElement("p");
    description.textContent = article.description;
    copy.append(description);
  }
  link.append(copy);
  return link;
}

function renderArticles(all) {
  const candidates = all.filter(item => item.category === category);
  const bySlot = new Map(candidates.filter(item => item.slot?.startsWith("section_")).map(item => [item.slot, item]));
  const used = new Set();
  const fallback = candidates.filter(item => !item.slot?.startsWith("section_"));
  const take = slot => {
    const exact = bySlot.get(slot);
    if (exact) { used.add(exact.id); return exact; }
    const next = fallback.find(item => !used.has(item.id));
    if (next) used.add(next.id);
    return next;
  };

  const leads = document.getElementById("editorial-leads");
  const hero = take("section_hero");
  if (hero) leads.append(articleLink(hero, "editorial-hero", "h2"));
  const secondary = document.createElement("div");
  secondary.className = "editorial-secondary";
  ["section_feature_1", "section_feature_2"].forEach(slot => {
    const article = take(slot);
    if (article) secondary.append(articleLink(article, "editorial-feature", "h3"));
  });
  leads.append(secondary);

  const list = document.getElementById("editorial-list");
  for (let index = 1; index <= 9; index += 1) {
    const article = take(`section_list_${index}`);
    if (article) list.append(articleLink(article, "editorial-list-item", "h3"));
  }

  const popular = document.getElementById("editorial-popular");
  all.slice(0, 5).forEach((article, index) => {
    const link = document.createElement("a");
    link.className = "rail-item";
    link.href = `materia.html?id=${Number(article.id)}`;
    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    link.append(number, document.createTextNode(article.title));
    popular.append(link);
  });

  if (!candidates.length) {
    list.innerHTML = '<div class="editorial-empty">Nenhuma matéria publicada nesta editoria.</div>';
  }
}

async function load() {
  shell();
  try {
    const response = await fetch(API, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    renderArticles(Array.isArray(payload) ? payload : payload.articles || []);
  } catch {
    document.getElementById("editorial-list").innerHTML = '<div class="editorial-empty">Não foi possível atualizar esta editoria agora.</div>';
  }
}

load();
