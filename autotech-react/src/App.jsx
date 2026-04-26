<<<<<<< HEAD
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

=======
import { Routes, Route } from "react-router-dom";
import Login from './modules/autoTech/Log.jsx'
import AdminDashboard from './modules/Usuario/AdminDashboard.jsx'


function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}
>>>>>>> e10c3031e32d46627e210971f19cd9d7eee7e46f
export default App