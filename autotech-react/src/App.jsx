import { Routes, Route } from 'react-router-dom'
import Inicio from './modules/autoTech/Inicio.jsx'
import Register from './modules/autoTech/Register.jsx'
import Login from './modules/autoTech/Log.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/page/register" element={<Register />} />
      <Route path="/page/login" element={<Login />} />
    </Routes>
  )
}

export default App