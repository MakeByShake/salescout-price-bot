import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "./app";
import products from "../data/products.json";
import expected from "../data/expected.json";

describe("POST /reprice", () => {
  it("returns results in input order", async () => {
    const response = await request(app).post("/reprice").send(products);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expected);
  });
  it("also answers on the Vercel path /api/reprice", async () => {
    const response = await request(app).post("/api/reprice").send(products);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expected);
  });
  it("accepts an empty array", async () => {
    const response = await request(app).post("/reprice").send([]);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
  it("rejects a non-array body", async () => {
    const response = await request(app).post("/reprice").send({ sku: "A" });
    expect(response.status).toBe(400);
  });
  it("rejects malformed products", async () => {
    const response = await request(app).post("/reprice").send([{ sku: "A" }]);
    expect(response.status).toBe(400);
  });
});
