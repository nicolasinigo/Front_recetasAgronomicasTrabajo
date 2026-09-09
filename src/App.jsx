import { Routes, Route } from 'react-router-dom'
import FormularioRecetas from './FormularioRecetas.jsx'
import ConfirmarRecetas from './ConfirmarReceta.jsx'

function App() {

  return (
    <Routes>
      <Route path="/" element={<FormularioRecetas />} />
      <Route path="/ConfirmarReceta/:id" element={<ConfirmarRecetas />} />
    </Routes>
  )
}

export default App
