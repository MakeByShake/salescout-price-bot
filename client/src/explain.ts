import type { Competitor, PriceResult, Product } from "../../src/types";
import { money } from "./format";

/** Cheapest competitor that has the item in stock, or undefined if there is none. */
export function cheapestInStock(product: Product): Competitor | undefined {
  const available = product.competitors.filter((competitor) => competitor.inStock);
  if (available.length === 0) return undefined;
  return available.reduce((best, competitor) => (competitor.price < best.price ? competitor : best));
}

/**
 * Human-readable steps explaining why the server chose this price.
 * The price itself comes from the API; this only describes the result.
 */
export function explain(product: Product, result: PriceResult): string[] {
  const cheapest = cheapestInStock(product);

  if (!cheapest) {
    const first = product.competitors.length === 0
      ? "Конкурентов нет вообще."
      : `Ни у одного конкурента (${product.competitors.length}) нет товара в наличии — их не считаем.`;
    return [first, `Давить на цену некому → ставим максимум ${money(product.maxPrice)}.`];
  }

  const steps = [`Самый дешёвый конкурент в наличии — ${cheapest.seller}: ${money(cheapest.price)}.`];

  const ignored = product.competitors.filter((c) => !c.inStock && c.price < cheapest.price);
  for (const competitor of ignored) {
    steps.push(`${competitor.seller} дешевле (${money(competitor.price)}), но товара нет в наличии — не считаем.`);
  }

  const raw = cheapest.price - product.step;
  const candidate = Math.floor(raw);
  steps.push(
    `${money(cheapest.price)} − шаг ${money(product.step)} = ${money(raw)}` +
      (raw !== candidate ? ` → округляем вниз до ${money(candidate)}.` : "."),
  );

  const limits = `${money(product.minPrice)} – ${money(product.maxPrice)}`;
  if (result.reason === "AT_MIN") {
    steps.push(`${money(candidate)} ниже минимума ${money(product.minPrice)} → ниже нельзя, ставим ${money(result.newPrice)}.`);
  } else if (result.reason === "AT_MAX") {
    steps.push(`${money(candidate)} выше максимума ${money(product.maxPrice)} → выше нельзя, ставим ${money(result.newPrice)}.`);
  } else {
    steps.push(`${money(candidate)} в пределах ${limits} → ставим ${money(result.newPrice)}.`);
  }
  return steps;
}
