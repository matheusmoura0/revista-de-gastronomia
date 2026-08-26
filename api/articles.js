module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  response.setHeader("CDN-Cache-Control", "no-store");
  response.setHeader("Vercel-CDN-Cache-Control", "no-store");

  try {
    const upstream = await fetch(
      "https://correio-content-hub.onrender.com/api/v1/sites/by-domain/articles?domain=revistadegastronomia.com.br",
      { headers: { Accept: "application/json" }, cache: "no-store" }
    );

    if (!upstream.ok) {
      return response.status(502).json({ error: "Content Hub indisponível", upstream_status: upstream.status });
    }

    const payload = await upstream.json();
    const articles = Array.isArray(payload) ? payload : Array.isArray(payload.articles) ? payload.articles : [];
    return response.status(200).json({ articles, fetched_at: new Date().toISOString() });
  } catch (error) {
    return response.status(502).json({ error: "Não foi possível consultar o Content Hub" });
  }
};
