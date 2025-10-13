// tests/security.spec.js
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { tmpdir } from "os";
import path from "path";
import { promises as fs } from "fs";

let app, reset;
const DATA_FILE = path.join(tmpdir(), `tasks.security.${Date.now()}.json`);
const RL_PATH = "/__rl/ping"; // rota fixa registrada no app quando NODE_ENV="test"

beforeAll(async () => {
  process.env.DATA_FILE = DATA_FILE;
  process.env.DISABLE_LIMITER = "true"; // desliga limiter global

  const mod = await import("../app.js");
  app = mod.app;
  reset = mod.__resetInMemoryForTests;

  await fs.writeFile(DATA_FILE, "[]", "utf-8");
});

beforeEach(async () => {
  await reset();
});

describe("Helmet headers", () => {
  it("inclui alguns headers de segurança esperados", async () => {
    const res = await request(app).get("/");
    expect(res.headers).toHaveProperty("x-dns-prefetch-control", "off");
    expect(res.headers).toHaveProperty("x-frame-options", "SAMEORIGIN");
    expect(res.headers).toHaveProperty("x-content-type-options", "nosniff");
    expect(res.headers).toHaveProperty("cross-origin-opener-policy");
    expect(res.headers["cross-origin-opener-policy"]).toMatch(/same-origin/i);
  });
});

describe("Rate limit (rota dedicada com chave fixa)", () => {
  it("retorna 429 quando ultrapassa o limite definido para testes", async () => {
    // 1ª: deve existir e responder 200
    const r1 = await request(app).get(RL_PATH);
    if (r1.status === 404) {
      throw new Error(
        "Rota /__rl/ping não existe. Verifique se o bloco da rota de teste está ANTES do 404 e se NODE_ENV=test está setado."
      );
    }
    expect(r1.status).toBe(200);

    // 2ª na mesma janela e mesma chave: 429
    const r2 = await request(app).get(RL_PATH);
    expect(r2.status).toBe(429);
    expect(r2.body).toEqual({ message: "Too many requests (test limiter)." });
    // estes headers existem quando standardHeaders=true
    expect(r2.headers).toHaveProperty("ratelimit-remaining", "0");
  });
});
