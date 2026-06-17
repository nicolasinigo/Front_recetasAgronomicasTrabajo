import { useState, useRef } from 'react'
import axios from 'axios'
import './App.css'
import MapView from './mapview/MapView.jsx'


function App() {

  const mapViewRef = useRef(null); // Referencia para el mapa

  const [form, setForm] = useState({
    fechaAplicacion: "",
    asesor: "",
    cuit1: "",
    empresaProductora: "",
    cuit2: "",
    aplicadora: "",
    categoriaAplicadora: "",
    cuit3: "",
    piloto: "",
    cuit4: "",
    tipoMaquina: "",
    Matricula: "",
    domicilio: "",
    predio: "",
    gps: "",
    superficie: "",
    poligono: [],
    cultivo: "",
    diagnostico: "",
    recomendacion: "",
    emailEmpresa: "",
    emailAsesor: "",
    emailPiloto: "",
    agroquimicos: [
      {
        principioActivo: "",
        nomencComercial: "",
        dosis: "",
        cantidadTotal: ""
      }
    ]
  });


  // Manejar cambios en el polígono
  const handlePolygonComplete = (coords) => {
    setForm(prevForm => ({
      ...prevForm,
      poligono: coords
    }));
  };

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Validación de fecha: mínimo 24 horas desde ahora, máximo 7 días desde ahora
  const hoy = new Date();

  const minDate = new Date(hoy);
  minDate.setDate(minDate.getDate() + 1); // mañana

  const maxDate = new Date(hoy);
  maxDate.setDate(maxDate.getDate() + 7); // dentro de 7 días

  const minDateStr = minDate.toISOString().split("T")[0];
  const maxDateStr = maxDate.toISOString().split("T")[0];


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que se haya dibujado un polígono y que la fecha sea correcta
    if (!form.fechaAplicacion || form.poligono.length === 0) {
      alert("Por favor, dibuje el polígono del predio tratado en el mapa.");
      return;
    }

    // Validar que la fecha esté dentro del rango permitido
    const fechaAplicacion = new Date(form.fechaAplicacion);

    if (fechaAplicacion < minDate || fechaAplicacion > maxDate) {
      alert("La fecha debe estar entre mañana y los próximos 7 días.");
      return;
    }

    try {

      // 1. 👈 Pedimos la imagen al mapa (esto es asíncrono)
      const mapImageBase64 = await mapViewRef.current.getMapImage();

      // 2. 👈 Creamos el objeto final de datos, incluyendo la imagen
      const dataToSend = {
        ...form,
        mapaImagen: mapImageBase64 // Este es un string larguísimo (Base64)
      };

      console.log("Enviando formulario:", dataToSend);

      const res = await axios.post(
        import.meta.env.VITE_URL_BACKEND,
        dataToSend
      );

      if (res.data.ok) {
        abrirModalExito(res.data.mensaje || "Datos enviados correctamente.");
      } else {
        alert("Hubo un problema al procesar la solicitud.");
      }


      // reiniciar el formulario
      setForm({
        fechaAplicacion: "",
        asesor: "",
        cuit1: "",
        empresaProductora: "",
        cuit2: "",
        aplicadora: "",
        categoriaAplicadora: "",
        cuit3: "",
        piloto: "",
        cuit4: "",
        tipoMaquina: "",
        Matricula: "",
        domicilio: "",
        predio: "",
        gps: "",
        superficie: "",
        poligono: [],
        cultivo: "",
        diagnostico: "",
        recomendacion: "",
        emailEmpresa: "",
        emailAsesor: "",
        emailPiloto: "",
        agroquimicos: [
          {
            principioActivo: "",
            nomencComercial: "",
            dosis: "",
            cantidadTotal: ""
          }
        ]
      });

      //funcion para refrescar el mapa
      refreshMap();

    } catch (error) {
      console.error(error);
      alert("Error al generar el PDF");
    }
  };

  // Manejar cambios en los campos de agroquímicos
  const handleAgroChange = (index, e) => {
    const nuevos = [...form.agroquimicos];
    nuevos[index][e.target.name] = e.target.value;

    setForm({
      ...form,
      agroquimicos: nuevos
    });
  };

  // Agregar un nuevo agroquímico vacío al formulario
  const agregarAgroquimico = () => {
    setForm({
      ...form,
      agroquimicos: [
        ...form.agroquimicos,
        {
          principioActivo: "",
          nomencComercial: "",
          dosis: "",
          cantidadTotal: ""
        }
      ]
    });
  };

  // Eliminar un agroquímico por su índice
  const eliminarAgroquimico = (index) => {
    const nuevos = form.agroquimicos.filter((_, i) => i !== index);

    setForm({
      ...form,
      agroquimicos: nuevos
    });
  };

  // Función para refrescar el mapa
  const refreshMap = () => {
    if (mapViewRef.current) {
      mapViewRef.current.getMapImage(); // Esto forzará a MapView a refrescar su estado interno y, por ende, el mapa
    }
  };

  //modal
  const abrirModalExito = (mensaje) => {
    const modal = document.getElementById("modalExito");
    const mensajeModal = document.getElementById("mensajeModal");
    mensajeModal.textContent = mensaje;
    modal.style.display = "flex";
  };
  
  const cerrarModalExito = () => {
    const modal = document.getElementById("modalExito");
    modal.style.display = "none";
  };


  return (
    <>
      <div className="form-container">
        <h2>Receta Agroquímica de Aplicación</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Fecha de Aplicación:</label>
              <input type="date" name="fechaAplicacion" value={form.fechaAplicacion} min={minDateStr} max={maxDateStr} onChange={handleChange} required />
            </div>
            <br />

            <div className="form-group full" style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "8px" }}>

              <h4>Responsables:</h4>

              <div className="form-grid">


                <div className="form-group">
                  <label>Asesor:</label>
                  <input name="asesor" value={form.asesor} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>CUIT asesor:</label>
                  <input name="cuit1" value={form.cuit1} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Empresa Productora:</label>
                  <input name="empresaProductora" value={form.empresaProductora} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>CUIT Empresa Productora:</label>
                  <input name="cuit2" value={form.cuit2} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Nombre de Empresa Aplicadora:</label>
                  <input name="aplicadora" value={form.aplicadora} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Categoria de Empresa Aplicadora:</label>
                  <select name="categoriaAplicadora" value={form.categoriaAplicadora} onChange={handleChange} required>
                    <option value="">Seleccione una categoría</option>
                    <option value="AplicadoraAerea">Aplicadora Aerea</option>
                    <option value="AplicadoraTerrestre">Aplicadora Terrestre</option>
                    <option value="AplicadoraDron">Aplicacion con Dron</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>CUIT Aplicadora:</label>
                  <input name="cuit3" value={form.cuit3} onChange={handleChange} required />
                </div>
                <br />
                <div className="form-group">
                  <label>Nombre del Piloto:</label>
                  <input name="piloto" value={form.piloto} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>CUIT Piloto:</label>
                  <input name="cuit4" value={form.cuit4} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Tipo de Máquina:</label>
                  <input name="tipoMaquina" value={form.tipoMaquina} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Matricula de la Máquina:</label>
                  <input name="Matricula" value={form.Matricula} onChange={handleChange} required />
                </div>

              </div>
            </div>

            <div className="form-group full">
              <label>Domicilio:</label>
              <input name="domicilio" value={form.domicilio} onChange={handleChange} required />
            </div>

            <div className="form-group full">
              <label>Localización del Predio Tratado:</label>
              <input name="predio" value={form.predio} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Punto GPS:</label>
              <input name="gps" value={form.gps} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Superficie:</label>
              <input name="superficie" value={form.superficie} onChange={handleChange} required />
            </div>

            <div
              className='form-group full'
              style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "8px" }}
              onClick={(e) => e.stopPropagation()} // 👈 Esto evita que clics en el mapa lleguen al <form>
            >
              <h4>Polígono del Predio Tratado</h4>
              <div className="form-group full">
                <MapView ref={mapViewRef} onPolygonComplete={handlePolygonComplete} />
              </div>
            </div>

            <div className="form-group">
              <label>Cultivo a Tratar:</label>
              <input name="cultivo" value={form.cultivo} onChange={handleChange} required />
            </div>

            <div className="form-group full">
              <label>Diagnóstico:</label>
              <input name="diagnostico" value={form.diagnostico} onChange={handleChange} required />
            </div>

            {/* Campo dinámico para agroquímicos */}
            {form.agroquimicos.map((agro, index) => (
              <div key={index} className="form-group full" style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "8px" }}>

                <h4>Tratamiento {index + 1}</h4>

                <div className="form-grid">

                  <div className="form-group">
                    <label>Principio Activo</label>
                    <input
                      name="principioActivo"
                      value={agro.principioActivo}
                      onChange={(e) => handleAgroChange(index, e)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Nomenc. Comercial</label>
                    <input
                      name="nomencComercial"
                      value={agro.nomencComercial}
                      onChange={(e) => handleAgroChange(index, e)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Dosis</label>
                    <input
                      name="dosis"
                      value={agro.dosis}
                      onChange={(e) => handleAgroChange(index, e)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Cantidad Total</label>
                    <input
                      name="cantidadTotal"
                      value={agro.cantidadTotal}
                      onChange={(e) => handleAgroChange(index, e)}
                      required
                    />
                  </div>

                </div>

                {form.agroquimicos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarAgroquimico(index)}
                    style={{ background: "#e74c3c", marginTop: "10px" }}
                  >
                    Eliminar
                  </button>
                )}

              </div>
            ))}

            <button type="button" onClick={agregarAgroquimico}>
              + Agregar Agroquímico
            </button>



            {/* Fin campo de agroquímicos */}
            <div className="form-group full">
              <label>Recomendación Técnicas:</label>
              <textarea name="recomendacion" value={form.recomendacion} onChange={handleChange} />
            </div>

            <div className="form-group full" style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "8px" }}>
              {/* mail por el cual se enviara la receta */}
              <div className="form-group full">
                <legend>En este mail usted recibira la receta</legend>
                <label>Correo Electrónico Empresa:</label>
                <input type="email" name="emailEmpresa" value={form.emailEmpresa} onChange={handleChange} required />
              </div>
              <br />
              <div className="form-group full">
                <legend>En este mail el asesor recibira una copia de la receta</legend>
                <label>Correo Electrónico del Asesor:</label>
                <input type="email" name="emailAsesor" value={form.emailAsesor} onChange={handleChange} required />
              </div>
              <br />
              <div className="form-group full">
                <legend>En este mail el piloto recibira una copia de la receta</legend>
                <label>Correo Electrónico del Piloto:</label>
                <input type="email" name="emailPiloto" value={form.emailPiloto} onChange={handleChange} required />
              </div>

            </div>

          </div>

          <button type="submit">Generar Receta</button>
        </form>

        {/*Modal de respuesta */}

        <div id="modalExito" className="modal">
          <div className="modal-contenido">
            <h2>La operación realizada con exito</h2>
            <p id="mensajeModal">La operación se realizó correctamente.</p>
            <button id="cerrarModal" onClick={cerrarModalExito}>Aceptar</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
