// Cloudflare Worker: proxy para os JSONs de resultados do TSE, com CORS liberado.
// Uso: https://SEU-WORKER.workers.dev/oficial/ele2026/6257/dados-simplificados/br/br-c0001-e006257-r.json
export default {
  async fetch(req) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });

    const url = new URL(req.url);
    if (!url.pathname.startsWith("/oficial/")) {
      return new Response("Use /oficial/...", { status: 400, headers: cors });
    }

    const alvo = "https://resultados.tse.jus.br" + url.pathname;
    const r = await fetch(alvo, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" },
      cf: { cacheTtl: 20, cacheEverything: true },
    });

    const h = new Headers(r.headers);
    for (const [k, v] of Object.entries(cors)) h.set(k, v);
    h.set("Cache-Control", "public, max-age=20");
    return new Response(r.body, { status: r.status, headers: h });
  },
};
