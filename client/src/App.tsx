import { useState } from "react";
import products from "../../data/products.json";
import type { PriceResult, Product } from "../../src/types";
import { reprice } from "./api";
import ProductCard from "./ProductCard";
import Sandbox from "./Sandbox";

const initialProducts: Product[] = products;

export default function App() {
  const [results, setResults] = useState<PriceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function calculate() {
    setLoading(true);
    setError("");
    try {
      setResults(await reprice(initialProducts));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка запроса");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <header>
        <span className="eyebrow">SALES AUTOMATION / DEMO</span>
        <h1>SaleScout <span>Price Bot</span></h1>
        <p>Бот ставит цену на шаг дешевле самого дешёвого конкурента в наличии, но не ниже минимума и не выше максимума.</p>
      </header>

      <section className="panel">
        <div className="toolbar">
          <div>
            <h2>Каталог товаров</h2>
            <p>{initialProducts.length} товаров · данные из products.json</p>
          </div>
          <button onClick={calculate} disabled={loading}>{loading ? "Рассчитываем…" : "Рассчитать цены →"}</button>
        </div>
        {error && <p className="error" role="alert">{error}. Убедитесь, что API запущен на порту 3001.</p>}
        {initialProducts.map((product, index) => (
          <ProductCard key={product.sku} product={product} result={results[index]} />
        ))}
      </section>

      <Sandbox />

      <footer>Демо использует тестовые данные. Реального подключения к Kaspi.kz нет.</footer>
    </main>
  );
}
