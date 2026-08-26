module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  response.setHeader("CDN-Cache-Control", "public, s-maxage=30, stale-while-revalidate=86400, stale-if-error=86400");
  response.setHeader("Vercel-CDN-Cache-Control", "public, s-maxage=30, stale-while-revalidate=86400, stale-if-error=86400");

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
