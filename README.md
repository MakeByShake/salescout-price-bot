# SaleScout — мини-бот для пересчёта цен

Тестовое задание на позицию стажёра web-разработчика. Приложение рассчитывает цену относительно самого дешёвого **доступного** конкурента и учитывает допустимые минимальную и максимальную цены. Используются тестовые данные, **реальной интеграции с Kaspi.kz нет**.

## Стек

- Node.js 20+, npm, TypeScript
- Express (API `POST /reprice`)
- React + Vite (интерфейс)
- Vitest + Supertest (тесты)

## Запуск

```bash
npm install
npm run dev
```

- Интерфейс: http://localhost:5173
- API: http://localhost:3001/reprice

Запуск по отдельности в двух терминалах: `npm run dev:server` и `npm run dev:client`.

## Тесты и сборка

```bash
npm test
npm run typecheck
npm run build
```

## API

`POST /reprice`, заголовок `Content-Type: application/json`, тело — массив объектов `Product`. Ответ `200` — массив `PriceResult` в исходном порядке. Если тело не массив или содержит невалидные товары, ответ `400`.

Пример запроса (из корня проекта при запущенном API):

```bash
curl -X POST http://localhost:3001/reprice \
  -H 'Content-Type: application/json' \
  -d '[{"sku":"DEMO","name":"Demo","myPrice":150,"minPrice":100,"maxPrice":200,"step":10,"competitors":[{"seller":"Shop","price":140,"inStock":true}]}]'
```

Ожидаемый ответ:

```json
[{"sku":"DEMO","oldPrice":150,"newPrice":130,"reason":"UNDERCUT"}]
```

## Логика `calculatePrice`

1. Учитываем только конкурентов с `inStock: true`.
2. Если доступных конкурентов нет — ставим `maxPrice` и `NO_COMPETITORS`.
3. Иначе находим минимальную цену `best` и считаем `candidate = Math.floor(best - step)`.
4. Если кандидат ниже `minPrice`, возвращаем `minPrice` и `AT_MIN`; если выше `maxPrice` — `maxPrice` и `AT_MAX`; иначе возвращаем кандидата и `UNDERCUT` (включая точное совпадение с границами).
5. `myPrice` не участвует в вычислении новой цены и возвращается без изменений как `oldPrice`.

Функция находится строго в `src/pricing.ts` и экспортируется как `calculatePrice`.

## Структура

```text
src/pricing.ts          Алгоритм (проверяется автотестами)
src/types.ts            Типы данных
src/pricing.test.ts     Юнит-тесты
server/app.ts           Express API и проверка входа
server/index.ts         Запуск сервера
server/app.test.ts      API-тесты
client/src/App.tsx      React-таблица
client/src/style.css    Оформление
client/vite.config.ts   Vite и proxy для API
data/products.json      Тестовые товары
data/expected.json      Эталонные результаты
```

## Замечания

- В интерфейсе используются предоставленные примеры товаров. Кнопка отправляет их на настоящий локальный API, а не рассчитывает цены в браузере.
- Валидация API добавлена сверх минимального требования.
- Для публикации на GitHub создайте свой репозиторий и отправьте изменения отдельными осмысленными коммитами.
