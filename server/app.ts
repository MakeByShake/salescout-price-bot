import express from "express";
import type { Product } from "../src/types";
import { calculatePrice } from "../src/pricing";

export const app = express();
app.use(express.json());

function isProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  const finiteNonnegative = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n >= 0;
  return (
    typeof item.sku === "string" && typeof item.name === "string" &&
    finiteNonnegative(item.myPrice) && finiteNonnegative(item.minPrice) &&
    finiteNonnegative(item.maxPrice) && finiteNonnegative(item.step) &&
    (item.minPrice as number) <= (item.maxPrice as number) &&
    Number.isInteger(item.minPrice as number) && Number.isInteger(item.maxPrice as number) &&
    Array.isArray(item.competitors) && item.competitors.every((competitor: unknown) => {
      if (typeof competitor !== "object" || competitor === null) return false;
      const c = competitor as Record<string, unknown>;
      return typeof c.seller === "string" && finiteNonnegative(c.price) && typeof c.inStock === "boolean";
    })
  );
}

app.post("/reprice", (req, res) => {
  if (!Array.isArray(req.body) || !req.body.every(isProduct)) {
    res.status(400).json({ error: "Expected an array of valid products" });
    return;
  }
  res.status(200).json(req.body.map(calculatePrice));
});

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }
  res.status(500).json({ error: "Internal server error" });
});
