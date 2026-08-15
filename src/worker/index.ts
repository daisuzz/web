interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

type RequestWithCf = Request & { cf?: { country?: string } };

const ALLOWED_COUNTRIES = new Set(["JP", "US"]);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const country = (request as RequestWithCf).cf?.country;

    if (country && !ALLOWED_COUNTRIES.has(country)) {
      return new Response("Forbidden", { status: 403 });
    }

    return env.ASSETS.fetch(request);
  },
};
