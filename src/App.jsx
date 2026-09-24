import { Routes, Route } from 'react-router-dom'
import FormularioRecetas from './FormularioRecetas.jsx'
import ConfirmarRecetas from './ConfirmarReceta.jsx'
import PaginaPrincipal from './PaginaPrincipal.jsx'
import FormularioRecetasComercializadoras from './FormularioRecetasComercializadoras.jsx'

function App() {

  return (
    <Routes>
      <Route path="/" element={<PaginaPrincipal />} />
      <Route path="/receta-aplicacion" element={<FormularioRecetas />} />
      <Route path="/receta-comercializacion" element={<FormularioRecetasComercializadoras />} />
      <Route path="/receta/:id" element={<ConfirmarRecetas />} />
    </Routes>
  )
}

export default App
