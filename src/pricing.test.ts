import { describe, expect, it } from "vitest";
import { calculatePrice } from "./pricing";
import type { Product } from "./types";
import products from "../data/products.json";
import expected from "../data/expected.json";

const base: Product = {
  sku: "TEST", name: "Test", myPrice: 120, minPrice: 100, maxPrice: 200,
  step: 10, competitors: [{ seller: "A", price: 150, inStock: true }],
};
const withChanges = (changes: Partial<Product>): Product => ({ ...base, ...changes });

describe("calculatePrice", () => {
  it("matches all provided examples", () => {
    expect(products.map((product) => calculatePrice(product))).toEqual(expected);
  });
  it("ignores unavailable competitors", () => {
    const result = calculatePrice(withChanges({ competitors: [
      { seller: "A", price: 20, inStock: false },
      { seller: "B", price: 160, inStock: true },
    ] }));
    expect(result.newPrice).toBe(150);
    expect(result.reason).toBe("UNDERCUT");
  });
  it("returns max when all competitors are unavailable", () => {
    expect(calculatePrice(withChanges({ competitors: [{ seller: "A", price: 30, inStock: false }] }))).toMatchObject({ newPrice: 200, reason: "NO_COMPETITORS" });
  });
  it("returns max for empty competitors", () => {
    expect(calculatePrice(withChanges({ competitors: [] }))).toMatchObject({ newPrice: 200, reason: "NO_COMPETITORS" });
  });
  it("clamps values below min", () => {
    expect(calculatePrice(withChanges({ competitors: [{ seller: "A", price: 105, inStock: true }] }))).toMatchObject({ newPrice: 100, reason: "AT_MIN" });
  });
  it("clamps values above max", () => {
    expect(calculatePrice(withChanges({ competitors: [{ seller: "A", price: 300, inStock: true }] }))).toMatchObject({ newPrice: 200, reason: "AT_MAX" });
  });
  it("treats boundaries as UNDERCUT", () => {
    expect(calculatePrice(withChanges({ competitors: [{ seller: "A", price: 110, inStock: true }] })).reason).toBe("UNDERCUT");
    expect(calculatePrice(withChanges({ competitors: [{ seller: "A", price: 210, inStock: true }] })).reason).toBe("UNDERCUT");
  });
  it("floors fractional price differences", () => {
    expect(calculatePrice(withChanges({ step: 0.5, competitors: [{ seller: "A", price: 149.9, inStock: true }] })).newPrice).toBe(149);
  });
  it("does not use myPrice in calculation, but preserves oldPrice", () => {
    const first = calculatePrice(withChanges({ myPrice: 1 }));
    const second = calculatePrice(withChanges({ myPrice: 999 }));
    expect(first.newPrice).toBe(second.newPrice);
    expect(first.oldPrice).toBe(1);
    expect(second.oldPrice).toBe(999);
  });
  it("does not mutate the product", () => {
    const product = withChanges({});
    const snapshot = structuredClone(product);
    calculatePrice(product);
    expect(product).toEqual(snapshot);
  });
  it("chooses the cheapest in-stock competitor", () => {
    expect(calculatePrice(withChanges({ competitors: [
      { seller: "A", price: 180, inStock: true },
      { seller: "B", price: 155, inStock: true },
    ] })).newPrice).toBe(145);
  });
  it("allows a zero step", () => {
    expect(calculatePrice(withChanges({ step: 0 })).newPrice).toBe(150);
  });
});
