import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { RequireAuth } from './auth/AuthContext.jsx'
import { t } from './i18n/index.js'
import AdminLayout from './components/AdminLayout.jsx'
import AuthPage from './pages/AuthPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import BusinessLayout from './pages/business/BusinessLayout.jsx'
import ProductsTab from './pages/business/ProductsTab.jsx'
import TablesTab from './pages/business/TablesTab.jsx'
import OrdersTab from './pages/business/OrdersTab.jsx'
import PublicMenuPage from './pages/PublicMenuPage.jsx'

function NotFound() {
  return (
    <main className="home">
      <h1>{t('app.notFoundTitle')}</h1>
      <Link to="/" className="home-link">
        {t('app.notFoundAction')}
      </Link>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />

      <Route
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/negocios/:id" element={<BusinessLayout />}>
          <Route index element={<ProductsTab />} />
          <Route path="mesas" element={<TablesTab />} />
          <Route path="pedidos" element={<OrdersTab />} />
        </Route>
      </Route>

      {/* Public menus live at the root: /<slug> and /<slug>/mesa/<tableId> */}
      <Route path="/:slug" element={<PublicMenuPage />} />
      <Route path="/:slug/mesa/:tableId" element={<PublicMenuPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
