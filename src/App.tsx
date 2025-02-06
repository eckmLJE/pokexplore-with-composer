import { Routes, Route } from 'react-router'
import IndexPage from './pages/IndexPage.tsx'
import DetailPage from './pages/DetailPage.tsx'

function App() {
  return (
    <div className="container mx-auto p-4">
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/:pokemonName" element={<DetailPage />} />
      </Routes>
    </div>
  )
}

export default App
