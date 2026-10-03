# qr-sites

Digital menus with a QR code per table. Owners sign up, create a business
(negocio), add products, publish it with **Crear**, add tables, print their QR
codes and follow incoming orders on the orders dashboard. Customers scan a
table's QR code, fill a cart and send the order.

## Run locally

```bash
npm install
npm run server:install
cp server/config.example.js server/config.js   # then fill in credentials
```

In two terminals:

```bash
npm run server   # API on http://localhost:4000 (MongoDB Atlas)
npm run dev      # app on http://localhost:5173, proxies /api to the API
```

Open http://localhost:5173. It redirects to `/login`.

## Layout

| Path | What |
| --- | --- |
| `server/` | Express + Mongoose API (`src/routes`, `src/models`) |
| `server/config.js` | Local credentials, gitignored. Env vars override it (`MONGODB_URI`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN`) |
| `src/i18n/es.json` | Every button, label and message in the UI. Add `en.json` with the same keys to translate |
| `src/pages/` | Login/register, dashboard, business tabs, public menu |
| `src/pages/KuraMenu.jsx` | The original static Kura menu, still served at `/kura` until a `kura` business is published |

## URLs

- `/login`, `/register`
- `/dashboard`: your businesses
- `/negocios/:id`: products, then (after **Crear**) `mesas` and `pedidos`
- `/:slug`: public menu (read-only)
- `/:slug/mesa/:tableId`: public menu with ordering, the URL in each table's QR code

## API

All responses are JSON; errors are `{ "error": "CODE" }` and translated in the UI.

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET|POST /api/businesses`, `GET|PATCH|DELETE /api/businesses/:id`
- `POST /api/businesses/:id/products`, `PATCH|DELETE /api/businesses/:id/products/:productId`
- `POST /api/businesses/:id/tables`, `DELETE /api/businesses/:id/tables/:tableId`
- `GET /api/businesses/:id/orders?status=active|all`, `PATCH /api/businesses/:id/orders/:orderId`
- `GET /api/public/:slug?table=:tableId`, `POST /api/public/:slug/orders`
