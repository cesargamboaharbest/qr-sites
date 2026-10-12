import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { RequireAuth } from './auth/AuthContext.jsx'
import { t } from './i18n/index.js'
import AdminLayout from './components/AdminLayout.jsx'
import AuthPage from './pages/AuthPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import BusinessLayout from './pages/business/BusinessLayout.jsx'
import ProductsTab from './pages/business/ProductsTab.jsx'
import PreviewTab from './pages/business/PreviewTab.jsx'
import TablesTab from './pages/business/TablesTab.jsx'
import OrdersTab from './pages/business/OrdersTab.jsx'
import MenuQrTab from './pages/business/MenuQrTab.jsx'
import WaitersPage from './pages/WaitersPage.jsx'
import WaiterPage from './pages/WaiterPage.jsx'
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
        path="/mesero"
        element={
          <RequireAuth role="waiter">
            <WaiterPage />
          </RequireAuth>
        }
      />

      <Route
        element={
          <RequireAuth role="owner">
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/meseros" element={<WaitersPage />} />
        <Route path="/negocios/:id" element={<BusinessLayout />}>
          <Route index element={<ProductsTab />} />
          <Route path="vista-previa" element={<PreviewTab />} />
          <Route path="mesas" element={<TablesTab />} />
          <Route path="pedidos" element={<OrdersTab />} />
          <Route path="qr" element={<MenuQrTab />} />
        </Route>
      </Route>

      {/* Public menus live at the root: /<slug> and /<slug>/mesa/<tableId> */}
      <Route path="/:slug" element={<PublicMenuPage />} />
      <Route path="/:slug/mesa/:tableId" element={<PublicMenuPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
