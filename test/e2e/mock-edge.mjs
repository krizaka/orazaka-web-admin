// A stand-in for the Orazaka edge, for the console's end-to-end walk: the same paths and shapes the services answer
// (StatusController, ModelController, FeatureController, JobController, billing), with a small fixed dataset.
import http from "node:http";

const now = Date.now();
const iso = (minutesAgo) => new Date(now - minutesAgo * 60_000).toISOString();
const job = (id, status, minutesAgo, extra = {}) => ({ id, userId: "1c10ee07-1b3a-4c1d-9a3e-000000000001", featureKey: "orazaka.core.media.image", status, payload: { prompt: "a quiet harbour" }, result: {}, createdAt: iso(minutesAgo + 1), updatedAt: iso(minutesAgo), ...extra });
const jobs = [job("j1", "COMPLETED", 5), job("j2", "FAILED", 9, { errorMessage: "worker heartbeat lost" }), job("j3", "PENDING", 1), job("j4", "PROCESSING", 2), job("j5", "COMPLETED", 30, { featureKey: "orazaka.core.chat" })];
const models = [
  { id: 1, modelName: "llama3.2", modelLabel: "Llama 3.2", category: "CHAT", providerName: "ollama", isDefault: true, compatible: true },
  { id: 2, modelName: "flux-schnell", modelLabel: "Flux Schnell", category: "IMAGE", providerName: "comfyui", isDefault: false, compatible: false, incompatibleReason: "needs 16 GB" },
];
const capabilities = [
  { featureKey: "orazaka.core.chat", handlerKey: "chat", routingKey: "job.core.chat", billableCapability: "CHAT", latencyClass: "INTERACTIVE", enabled: true },
  { featureKey: "orazaka.core.media.image", handlerKey: "image", routingKey: "job.media.image", billableCapability: "IMAGE", latencyClass: "BATCH", enabled: true },
];

const accounts = [
  { id: "u-ada", username: "ada", email: "ada@example.test", enabled: true, admin: true, provider: "local", authorities: ["ROLE_USER", "ROLE_ADMIN"], createdAt: iso(9000) },
  { id: "u-bob", username: "bob", email: "bob@example.test", enabled: true, admin: false, provider: "local", authorities: ["ROLE_USER"], createdAt: iso(5000) },
];
const trail = [{ id: 1, at: iso(30), actor: "ada@example.test", action: "admin.user_suspended", targetId: "u-bob", detail: null }];
const record = (action, targetId) => trail.unshift({ id: trail.length + 1, at: iso(0), actor: "admin@example.test", action, targetId, detail: null });

const routes = {
  "GET /api/v1/status/health": () => ({ status: "Sovereign-Ready", pgVectorConnected: true, pgVectorExtensionInstalled: true, ollamaConnected: true, ollamaModels: ["llama3.2"], defaultProvider: "ollama", ollamaBaseUrl: "http://ollama:11434", message: "ok" }),
  "GET /api/v1/status/infrastructure": () => ({ video: false, image: true }),
  "GET /api/v1/jobs": () => ({ content: jobs, totalPages: 1, totalElements: jobs.length }),
  "GET /api/v1/jobs/active-connections": () => 2,
  "GET /api/v1/models/catalog": () => models,
  "GET /api/v1/models/providers": () => ["ollama", "comfyui"],
  "GET /api/v1/features/all": () => capabilities,
  "GET /api/v1/admin/users": () => ({ content: accounts, total: accounts.length, page: 0, size: 25 }),
  "GET /api/v1/admin/users/audit": () => trail,
  "GET /api/v1/billing/usage": () => [],
  "GET /api/v1/billing/usage/consumers": () => [],
};

/** Starts the mock on `port`; the returned server's `.close()` stops it. Logs every request path in `seen`. */
export function startMockEdge(port, seen = []) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? "/", "http://x");
      seen.push(`${req.method} ${url.pathname}`);
      const send = (status, body) => { if (status === 204) { res.writeHead(204); return res.end(); } res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(body)); };
      let raw = "";
      req.on("data", (c) => (raw += c));
      req.on("end", () => {
        if (req.method === "POST" && url.pathname === "/api/v1/auth/login") {
          const { email, password } = JSON.parse(raw || "{}");
          return email === "admin@example.test" && password === "correct-horse" ? send(200, { token: "t.o.k", username: "admin", email, authorities: ["ROLE_ADMIN"] }) : send(401, {});
        }
        if (!req.headers.authorization?.startsWith("Bearer ")) return send(401, {});
        const put = req.method === "PUT" && url.pathname.startsWith("/api/v1/features/");
        if (put) {
          const key = decodeURIComponent(url.pathname.split("/").pop());
          const found = capabilities.find((c) => c.featureKey === key);
          if (!found) return send(404, {});
          found.enabled = Boolean(JSON.parse(raw).isEnabled);
          return send(200, found);
        }
        const acct = /^\/api\/v1\/admin\/users\/([\w-]+)(?:\/(suspend|restore|admin|export))?$/.exec(url.pathname);
        if (acct && acct[1] !== "audit") {
          const found = accounts.find((a) => a.id === acct[1]);
          if (!found) return send(404, {});
          const op = acct[2];
          if (req.method === "POST" && op === "suspend") { found.enabled = false; record("admin.user_suspended", found.id); return send(200, found); }
          if (req.method === "POST" && op === "restore") { found.enabled = true; record("admin.user_restored", found.id); return send(200, found); }
          if (req.method === "PUT" && op === "admin") { found.admin = Boolean(JSON.parse(raw).admin); record("admin.user_role_changed", found.id); return send(200, found); }
          if (req.method === "GET" && op === "export") return send(200, { format: "krizaka-identity-export/1", account: { id: found.id, email: found.email } });
          if (req.method === "DELETE" && !op) {
            if (JSON.parse(raw || "{}").confirmEmail !== found.email) return send(409, { code: "CONFIRM_MISMATCH" });
            accounts.splice(accounts.indexOf(found), 1); record("admin.account_deleted", found.id); return send(204, null);
          }
        }
        const route = routes[`${req.method} ${url.pathname}`];
        return route ? send(200, route()) : send(404, {});
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}
