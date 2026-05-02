import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

// TODO: todos estos imports se reemplazarán por llamadas a la API
// GET /api/usuarios/:id/vehiculos  → initialVehiculos
// GET /api/usuarios/:id/citas      → initialCitas
// GET /api/usuarios/:id/facturas   → initialFacturas
// GET /api/usuarios/:id/historial  → historial
// GET /api/mecanicos/disponibles   → MECANICOS
import {
  initialVehiculos,
  initialCitas,
  initialFacturas,
  historial,
  MECANICOS,
} from "./data/usuarioData.js";

import Sidebar from "./components/Sidebar";
import Header  from "./components/Header";
import SecInicio    from "./sections/SecInicio";
import SecVehiculos from "./sections/SecVehiculos";
import SecCitas     from "./sections/SecCitas";
import SecHistorial from "./sections/SecHistorial";
import SecFacturas  from "./sections/SecFacturas";
import SecPerfil    from "./sections/SecPerfil";
import SlidePanel           from "./modals/SlidePanel";
import ModalAgendarCita     from "./modals/ModalAgendarCita";
import ModalAgregarVehiculo from "./modals/ModalAgregarVehiculo";
import Toast                from "./modals/Toast";
import "./UsuarioDashboard.css";

export default function UsuarioDashboard() {
  // ← usuario viene del AuthContext (lo guardó Login al iniciar sesión)
  // Con API real vendrá de: GET /api/auth/me
  const { user } = useAuth();

  const [seccion,      setSeccion]      = useState("inicio");
  const [vehiculos,    setVehiculos]    = useState(initialVehiculos);
  const [citas,        setCitas]        = useState(initialCitas);
  const [panelCita,    setPanelCita]    = useState(false);
  const [panelVehiculo,setPanelVehiculo]= useState(false);
  const [toast,        setToast]        = useState(null);

  // MECANICOS ya es [{ id, nombre }] — listo para cuando venga de la API
  const mecanicosObj = MECANICOS;

  function showToast(msg) { setToast(msg); }

  function handleGuardarCita(nuevaCita) {
    // TODO API → POST /api/citas
    setCitas(prev => [{ ...nuevaCita, id: Date.now() }, ...prev]);
    setPanelCita(false);
    showToast("¡Cita agendada exitosamente! Te notificaremos cuando sea confirmada.");
  }

  function handleGuardarVehiculo(nuevoVeh) {
    // TODO API → POST /api/usuarios/:id/vehiculos
    setVehiculos(prev => [...prev, { ...nuevoVeh, id: Date.now() }]);
    setPanelVehiculo(false);
    showToast(`¡El vehículo ${nuevoVeh.nombre} fue agregado correctamente!`);
  }


  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f7; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f0f2f7; }
        ::-webkit-scrollbar-thumb { background: #c5ccd9; border-radius: 3px; }
      `}</style>

      <div className="app-wrapper">
        <Sidebar
          seccion={seccion}
          setSeccion={setSeccion}
          usuario={user}
        />

        <div className="main-content">
          <Header seccion={seccion} />
          <div className="page-content">
            {seccion === "inicio"    && <SecInicio    vehiculos={vehiculos} citas={citas} setSeccion={setSeccion} usuario={user} />}
            {seccion === "vehiculos" && <SecVehiculos vehiculos={vehiculos} onAgregar={() => setPanelVehiculo(true)} />}
            {seccion === "citas"     && <SecCitas     citas={citas} onAgendar={() => setPanelCita(true)} />}
            {seccion === "historial" && <SecHistorial historial={historial} />}
            {seccion === "facturas"  && <SecFacturas  facturas={initialFacturas} />}
            {seccion === "perfil"    && <SecPerfil    usuario={user} vehiculos={vehiculos} />}
          </div>
        </div>
      </div>

      <SlidePanel open={panelCita} onClose={() => setPanelCita(false)}
        title="Agendar Cita" subtitle="Completa los datos para reservar tu cita">
        <ModalAgendarCita
          vehiculos={vehiculos}
          mecanicos={mecanicosObj}
          citas={citas}
          onClose={() => setPanelCita(false)}
          onSave={handleGuardarCita}
        />
      </SlidePanel>

      <SlidePanel open={panelVehiculo} onClose={() => setPanelVehiculo(false)}
        title="Agregar Vehículo" subtitle="Registra un nuevo vehículo en tu cuenta">
        <ModalAgregarVehiculo
          onClose={() => setPanelVehiculo(false)}
          onSave={handleGuardarVehiculo}
        />
      </SlidePanel>

      {toast && <Toast mensaje={toast} onClose={() => setToast(null)} />}
    </>
  );
}