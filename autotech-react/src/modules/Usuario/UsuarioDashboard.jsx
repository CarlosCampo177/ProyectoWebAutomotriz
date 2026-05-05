import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getVehiculos, getCitas, getHistorial,
  getFacturas, getMecanicos,
  postVehiculo, postCita
} from "../../services/clienteService";

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
  const { user } = useAuth();

  const [seccion,       setSeccion]       = useState("inicio");
  const [vehiculos,     setVehiculos]     = useState([]);
  const [citas,         setCitas]         = useState([]);
  const [historial,     setHistorial]     = useState([]);
  const [facturas,      setFacturas]      = useState([]);
  const [mecanicos,     setMecanicos]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [panelCita,     setPanelCita]     = useState(false);
  const [panelVehiculo, setPanelVehiculo] = useState(false);
  const [toast,         setToast]         = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    const cargarDatos = async () => {
      try {
        const [v, c, h, f, m] = await Promise.all([
          getVehiculos(user.id),
          getCitas(user.id),
          getHistorial(user.id),
          getFacturas(user.id),
          getMecanicos(),
        ]);
        setVehiculos(v);
        setCitas(c);
        setHistorial(h);
        setFacturas(f);
        setMecanicos(m);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [user?.id]);

  function showToast(msg) { setToast(msg); }

  async function handleGuardarVehiculo(nuevoVeh) {
    try {
      const vehiculoCreado = await postVehiculo(user.id, {
        idMarca:     nuevoVeh.idMarca,
        modelo:      nuevoVeh.modelo,
        placa:       nuevoVeh.placa,
        anio:        nuevoVeh.anio,
        km:          nuevoVeh.km,
        color:       nuevoVeh.color,
        combustible: nuevoVeh.combustible,
        icono:       nuevoVeh.icono,
        colorWrap:   nuevoVeh.colorWrap,
      });
      setVehiculos(prev => [...prev, vehiculoCreado]);
      setPanelVehiculo(false);
      showToast(`¡Vehículo ${nuevoVeh.nombre} agregado correctamente!`);
    } catch (err) {
      console.error("Error al agregar vehículo:", err);
      showToast("Error al agregar el vehículo. Intenta de nuevo.");
    }
  }

  async function handleGuardarCita(nuevaCita) {
    try {
      const meses = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"]
      const citaCreada = await postCita(user.id, {
        servicio:      nuevaCita.servicio,
        vehiculoId:    parseInt(nuevaCita.vehiculoId),
        mecanicoId:    parseInt(nuevaCita.mecanicoId),
        dia:           parseInt(nuevaCita.dia),
        mes:           meses.indexOf(nuevaCita.mes) + 1,
        hora:          nuevaCita.hora,
        observaciones: nuevaCita.observaciones ?? "",
      });
      setCitas(prev => [{
        ...citaCreada,
        mecanico: nuevaCita.mecanico,
        vehiculo: nuevaCita.vehiculo,
      }, ...prev]);
      setPanelCita(false);
      showToast("¡Cita agendada exitosamente!");
    } catch (err) {
      console.error("Error al agendar cita:", err);
      showToast("Error al agendar la cita. Intenta de nuevo.");
    }
  }

  if (loading) {
    return (
      <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh" }}>
        <p style={{ color:"#888", fontSize:"0.9rem" }}>Cargando...</p>
      </div>
    );
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
        <Sidebar seccion={seccion} setSeccion={setSeccion} usuario={user} />
        <div className="main-content">
          <Header seccion={seccion} />
          <div className="page-content">
            {seccion === "inicio"    && <SecInicio    vehiculos={vehiculos} citas={citas} setSeccion={setSeccion} usuario={user} />}
            {seccion === "vehiculos" && <SecVehiculos vehiculos={vehiculos} onAgregar={() => setPanelVehiculo(true)} />}
            {seccion === "citas"     && <SecCitas     citas={citas} onAgendar={() => setPanelCita(true)} />}
            {seccion === "historial" && <SecHistorial historial={historial} />}
            {seccion === "facturas"  && <SecFacturas  facturas={facturas} />}
            {seccion === "perfil"    && <SecPerfil    usuario={user} vehiculos={vehiculos} />}
          </div>
        </div>
      </div>

      <SlidePanel open={panelCita} onClose={() => setPanelCita(false)}
        title="Agendar Cita" subtitle="Completa los datos para reservar tu cita">
        <ModalAgendarCita
          vehiculos={vehiculos}
          mecanicos={mecanicos}
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