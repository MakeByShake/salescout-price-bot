import { useState } from "react";
import type { Competitor, PriceResult, Product } from "../../src/types";
import { reprice } from "./api";
import { explain } from "./explain";
import { money, reasons } from "./format";

const example: Product = {
  sku: "MY-ITEM",
  name: "Мой товар",
  myPrice: 150,
  minPrice: 120,
  maxPrice: 200,
  step: 10,
  competitors: [
    { seller: "Магазин А", price: 140, inStock: true },
    { seller: "Магазин Б", price: 135, inStock: false },
  ],
};

type NumberField = "myPrice" | "minPrice" | "maxPrice" | "step";
const fields: { key: NumberField; label: string }[] = [
  { key: "myPrice", label: "Моя цена" },
  { key: "minPrice", label: "Минимум" },
  { key: "maxPrice", label: "Максимум" },
  { key: "step", label: "Шаг" },
];

/** A form where you type your own numbers and see how the bot prices them. */
export default function Sandbox() {
  const [product, setProduct] = useState<Product>(example);
  const [result, setResult] = useState<PriceResult | null>(null);
  const [error, setError] = useState("");

  // Any edit makes the old result outdated.
  function update(next: Product) {
    setProduct(next);
    setResult(null);
    setError("");
  }

  function updateCompetitor(index: number, changes: Partial<Competitor>) {
    const competitors = product.competitors.map((c, i) => (i === index ? { ...c, ...changes } : c));
    update({ ...product, competitors });
  }

  function addCompetitor() {
    const seller = `Магазин ${product.competitors.length + 1}`;
    update({ ...product, competitors: [...product.competitors, { seller, price: 0, inStock: true }] });
  }

  function removeCompetitor(index: number) {
    update({ ...product, competitors: product.competitors.filter((_, i) => i !== index) });
  }

  async function calculate() {
    try {
      const [priced] = await reprice([product]);
      setResult(priced);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка запроса";
      setError(`${message}. Проверь поля: минимум ≤ максимум, минимум и максимум — целые числа, цены не отрицательные.`);
    }
  }

  return (
    <section className="panel sandbox">
      <div className="toolbar">
        <div>
          <h2>Свой пример</h2>
          <p>Введи свои цифры и посмотри, какую цену поставит бот</p>
        </div>
        <button onClick={calculate}>Рассчитать →</button>
      </div>

      <div className="sandbox-body">
        <div className="fields">
          {fields.map(({ key, label }) => (
            <label key={key}>
              {label}
              <input
                type="number"
                value={product[key]}
                onChange={(e) => update({ ...product, [key]: Number(e.target.value) })}
              />
            </label>
          ))}
        </div>

        <span className="label">Конкуренты</span>
        {product.competitors.map((competitor, index) => (
          <div className="competitor" key={index}>
            <input
              value={competitor.seller}
              onChange={(e) => updateCompetitor(index, { seller: e.target.value })}
            />
            <input
              type="number"
              value={competitor.price}
              onChange={(e) => updateCompetitor(index, { price: Number(e.target.value) })}
            />
            <label className="check">
              <input
                type="checkbox"
                checked={competitor.inStock}
                onChange={(e) => updateCompetitor(index, { inStock: e.target.checked })}
              />
              в наличии
            </label>
            <button className="ghost" onClick={() => removeCompetitor(index)} aria-label="Удалить">✕</button>
          </div>
        ))}
        <button className="ghost" onClick={addCompetitor}>+ добавить конкурента</button>

        {error && <p className="error" role="alert">{error}</p>}

        {result && (
          <div className="answer">
            <div className="prices">
              <span className="old">{money(result.oldPrice)}</span>
              <span className="arrow">→</span>
              <span className="new">{money(result.newPrice)}</span>
              <span className="pill">{reasons[result.reason]}</span>
            </div>
            <ol className="steps">
              {explain(product, result).map((step) => <li key={step}>{step}</li>)}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
