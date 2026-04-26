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
export default App