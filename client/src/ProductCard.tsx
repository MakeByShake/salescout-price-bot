import type { PriceResult, Product } from "../../src/types";
import { cheapestInStock, explain } from "./explain";
import { money, reasons } from "./format";

interface Props {
  product: Product;
  result?: PriceResult;
}

export default function ProductCard({ product, result }: Props) {
  const cheapest = cheapestInStock(product);
  const diff = result ? result.newPrice - result.oldPrice : 0;

  return (
    <article className="card">
      <div className="card-head">
        <div>
          <strong>{product.name}</strong>
          <small>{product.sku}</small>
        </div>
        <div className="prices">
          <span className="old">{money(product.myPrice)}</span>
          <span className="arrow">→</span>
          {result ? (
            <>
              <span className="new">{money(result.newPrice)}</span>
              <span className={diff < 0 ? "diff down" : "diff up"}>{diff > 0 ? "+" : ""}{money(diff)}</span>
              <span className="pill">{reasons[result.reason]}</span>
            </>
          ) : (
            <span className="muted">ожидает расчёта</span>
          )}
        </div>
      </div>

      <div className="row">
        <span className="label">Конкуренты</span>
        <div className="chips">
          {product.competitors.length === 0 && <span className="muted">нет</span>}
          {product.competitors.map((competitor) => (
            <span
              key={competitor.seller}
              className={`chip ${competitor.inStock ? "" : "out"} ${competitor === cheapest ? "best" : ""}`}
            >
              {competitor.seller} · {money(competitor.price)}
              {!competitor.inStock && " · нет в наличии"}
              {competitor === cheapest && " · самый дешёвый"}
            </span>
          ))}
        </div>
      </div>

      <div className="row">
        <span className="label">Мои правила</span>
        <span>
          мин {money(product.minPrice)} · макс {money(product.maxPrice)} · шаг {money(product.step)}
        </span>
      </div>

      {result && (
        <div className="row">
          <span className="label">Как посчитали</span>
          <ol className="steps">
            {explain(product, result).map((step) => <li key={step}>{step}</li>)}
          </ol>
        </div>
      )}
    </article>
  );
}
