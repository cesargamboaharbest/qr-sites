import { Navigate, useOutletContext } from 'react-router-dom'
import OrdersBoard from '../../components/OrdersBoard.jsx'

export default function OrdersTab() {
  const { business } = useOutletContext()
  if (!business.published || !business.ordering) return <Navigate to=".." relative="path" replace />
  return <OrdersBoard path={`/businesses/${business.id}/orders`} currency={business.currency} />
}
