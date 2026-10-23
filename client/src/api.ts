import type { PriceResult, Product } from "../../src/types";

/** Sends products to the API and returns new prices in the same order. */
export async function reprice(products: Product[]): Promise<PriceResult[]> {
  const response = await fetch("/reprice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(products),
  });
  if (!response.ok) throw new Error(`Сервер вернул ${response.status}`);
  return response.json();
}
