import { Routes, Route, Link } from 'react-router-dom'
import KuraMenu from './pages/KuraMenu.jsx'
import heroUrl from './assets/kura-hero.png'

function Home() {
  return (
    <main className="home">
      <h1>
        <img src={heroUrl} alt="Kura Coffee Garden" className="home-logo" />
      </h1>
      <Link to="/Kura" className="home-link">Ver el menú</Link>
    </main>
  )
}

function NotFound() {
  return (
    <main className="home">
      <h1>Esta página no existe</h1>
      <Link to="/Kura" className="home-link">Ir al menú</Link>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Kura" element={<KuraMenu />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
