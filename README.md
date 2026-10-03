# qr-sites

Digital menus with QR codes. Owners sign up, create a business (negocio), add
products and publish it with **Crear**. Two kinds of menu:

- **Con carrito de compras** (Pro plan): products with photos, tables with a QR
  code each, and an orders dashboard. Customers scan, fill a cart and send the
  order.
- **Sin carrito de compras**: a read-only menu with sections, prices and
  descriptions, with one QR code.

Owners also get:

- **Tema** (top bar): the style of all their sites and of their dashboard —
  Kura, Tienda de té or Boutique.
- **Meseros** (Pro plan): waiter accounts that see the orders of all the
  owner's businesses at `/mesero`.

## Run locally

```bash
npm install
cp server/config.example.js server/config.js   # then fill in credentials
```

In two terminals:

```bash
npm run server   # API on http://localhost:4000 (MongoDB Atlas)
npm run dev      # app on http://localhost:5173, proxies /api to the API
```

Open http://localhost:5173. It redirects to `/login`.

## Pro plan

There's no billing yet. Pro is a flag on the owner account, switched with:

```bash
npm run set-pro -- <username>        # on
npm run set-pro -- <username> off    # off
```

It uses the same database as the server. The owner sees the change the next
time the app loads.

## Setting up a business for an owner

Create the owner account and the business, then send them the business link
(`https://qr-sites.vercel.app/negocios/<id>`). If they're not logged in it
asks them to log in and then brings them back to that business.

## Layout

| Path | What |
| --- | --- |
| `server/` | Express + Mongoose API (`src/routes`, `src/models`) |
| `server/scripts/` | Admin commands (`set-pro`) |
| `api/index.js` | Runs the same Express app as a Vercel Function (all `/api/*` requests, see `vercel.json`) |
| `server/config.js` | Local credentials, gitignored. Env vars override it (`MONGODB_URI`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN`) |
| `src/i18n/es.json` | Every button, label and message in the UI. Add `en.json` with the same keys to translate |
| `src/themes/` | Site themes: read-only menus per theme; registry and how to add one in `src/themes/index.js` |
| `src/pages/PublicMenu.css` | Cart page, styled per theme with `.pm--<theme>` |
| `src/adminThemes.css` | Dashboard look per theme |
| `src/firebase.js`, `storage.rules` | Product photo uploads to Firebase Storage and the rules that allow them |
| `src/pages/KuraMenu.jsx` | The original static Kura menu, still served at `/kura` until a `kura` business is published |

## Deploy (Vercel)

Site and API deploy together as one Vercel project. Required environment
variables: `MONGODB_URI` and `JWT_SECRET`. MongoDB Atlas must allow
connections from Vercel (Network Access → `0.0.0.0/0`).

Firebase Storage rules live in `storage.rules`; publish them in the Firebase
console or with `npx firebase-tools deploy --only storage`.

## URLs

- `/login`, `/register`
- `/dashboard`: your businesses; `/meseros`: your waiters
- `/negocios/:id`: products, then (after **Crear**) `mesas` and `pedidos`, or `qr` for menus without a cart
- `/mesero`: what a waiter sees after logging in
- `/:slug`: public menu (read-only)
- `/:slug/mesa/:tableId`: public menu with ordering, the URL in each table's QR code

## API

All responses are JSON; errors are `{ "error": "CODE" }` and translated in the UI.

- `POST /api/auth/register`, `POST /api/auth/login`, `GET|PATCH /api/auth/me` (theme)
- `GET|POST /api/businesses`, `GET|PATCH|DELETE /api/businesses/:id`
- `POST /api/businesses/:id/products`, `PATCH|DELETE /api/businesses/:id/products/:productId`
- `POST /api/businesses/:id/tables`, `DELETE /api/businesses/:id/tables/:tableId`
- `GET /api/businesses/:id/orders?status=active|all`, `PATCH /api/businesses/:id/orders/:orderId`
- `GET|POST /api/waiters`, `DELETE /api/waiters/:id` (owner, Pro)
- `GET /api/waiter/orders`, `PATCH /api/waiter/orders/:orderId` (waiter)
- `GET /api/public/:slug?table=:tableId`, `POST /api/public/:slug/orders`
