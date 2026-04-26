import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Inicio from './modules/autoTech/Inicio.jsx'
import Register from './modules/autoTech/Register.jsx'
import Login from './modules/autoTech/Log.jsx'  

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/page/register" element={<Register />} />
        <Route path="/page/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App