import { useState } from "react";
import products from "../../data/products.json";
import type { PriceResult, Product, Reason } from "../../src/types";

const initialProducts: Product[] = products;
const reasons: Record<Reason, string> = {
  UNDERCUT: "Дешевле конкурента",
  AT_MIN: "Минимальная цена",
  AT_MAX: "Максимальная цена",
  NO_COMPETITORS: "Нет доступных конкурентов",
};
const money = (value: number) => new Intl.NumberFormat("ru-RU").format(value) + " ₸";

export default function App() {
  const [results, setResults] = useState<PriceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function calculate() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/reprice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(initialProducts),
      });
      if (!response.ok) throw new Error(`Сервер вернул ${response.status}`);
      const data: PriceResult[] = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка запроса");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <header><span className="eyebrow">SALES AUTOMATION / DEMO</span><h1>SaleScout <span>Price Bot</span></h1><p>Автоматический расчёт конкурентных цен с учётом ваших ограничений.</p></header>
      <section className="panel">
        <div className="toolbar"><div><h2>Каталог товаров</h2><p>{initialProducts.length} товаров · данные из products.json</p></div><button onClick={calculate} disabled={loading}>{loading ? "Рассчитываем…" : "Рассчитать цены →"}</button></div>
        {error && <p className="error" role="alert">{error}. Убедитесь, что API запущен на порту 3001.</p>}
        <div className="table-wrap"><table><thead><tr><th>SKU / Товар</th><th>Старая цена</th><th>Новая цена</th><th>Причина</th></tr></thead><tbody>
          {initialProducts.map((product, index) => {
            const result = results[index];
            return <tr key={product.sku}><td><strong>{product.name}</strong><small>{product.sku}</small></td><td>{money(product.myPrice)}</td><td className={result ? "price" : "muted"}>{result ? money(result.newPrice) : "—"}</td><td>{result ? <span className="pill">{reasons[result.reason]}</span> : <span className="muted">Ожидает расчёта</span>}</td></tr>;
          })}
        </tbody></table></div>
      </section>
      <footer>Демо использует тестовые данные. Реального подключения к Kaspi.kz нет.</footer>
    </main>
  );
}
