export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "https://ecosteamplus.com",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Health check
    if (url.pathname === "/") {
      return new Response("VERDO backend OK");
    }

    // Chat endpoint
    if (url.pathname !== "/api/chat") {
      return new Response("Not found", { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const messages = body.messages || [];

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You are VERDO, the EcoSTEAM+ assistant. Be friendly, concise, practical. Use bullet points.",
          },
          ...messages,
        ],
        temperature: 0.6,
        max_tokens: 600,
      }),
    });

    const data = await resp.json().catch(() => ({}));
    const reply =
      data?.choices?.[0]?.message?.content ||
      data?.error?.message ||
      "Bir hata oluştu. Lütfen tekrar dene.";

    return new Response(JSON.stringify({ reply }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://ecosteamplus.com",
      },
    });
  },
};
