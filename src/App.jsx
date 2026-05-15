import { useState, useRef } from 'react'
import axios from 'axios'
import './App.css'
import MapView from './mapview/MapView.jsx'

function App() {

  const mapViewRef = useRef(null); // Referencia para el mapa

  const [form, setForm] = useState({
    fechaAplicacion: "",
    asesor: "",
    empresaProductora: "",
    cuit1: "",
    aplicadora: "",
    cuit2: "",
    domicilio: "",
    predio: "",
    gps: "",
    superficie: "",
    poligono: [],
    cultivo: "",
    diagnostico: "",
    recomendacion: "",
    email: "",
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


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fechaAplicacion || form.poligono.length === 0) {
      alert("Por favor, dibuje el polígono del predio tratado en el mapa.");
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

      const res = await axios.post("http://localhost:3000/generar-pdf", dataToSend);

      if (res.data.ok) {
            alert(res.data.mensaje); // "Receta N° X procesada y enviada..."
            // Aquí podés limpiar el formulario o redirigir al usuario si querés
        } else {
            alert("Hubo un problema al procesar la solicitud.");
        }

      alert("PDF generado correctamente");


      // reiniciar el formulario
      setForm({
        fechaAplicacion: "",
        asesor: "",
        empresaProductora: "",
        cuit1: "",
        aplicadora: "",
        cuit2: "",
        domicilio: "",
        predio: "",
        gps: "",
        superficie: "",
        poligono: [],
        cultivo: "",
        diagnostico: "",
        recomendacion: "",
        email: "",
        agroquimicos: [
          {
            principioActivo: "",
            nomencComercial: "",
            dosis: "",
            cantidadTotal: ""
          }
        ]
      });

      // 👉 abrir PDF
      window.open(res.data.url, "_blank");

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

  return (
    <>
      <div className="form-container">
        <h2>Receta Agroquímica</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Fecha de Aplicación:</label>
              <input name="fechaAplicacion" value={form.fechaAplicacion} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Asesor:</label>
              <input name="asesor" value={form.asesor} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Empresa Productora:</label>
              <input name="empresaProductora" value={form.empresaProductora} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>CUIT Empresa Productora:</label>
              <input name="cuit1" value={form.cuit1} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Aplicadora:</label>
              <input name="aplicadora" value={form.aplicadora} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>CUIT Aplicadora:</label>
              <input name="cuit2" value={form.cuit2} onChange={handleChange} required />
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
                <label>Correo Electrónico:</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
            </div>

          </div>

          <button type="submit">Generar Receta</button>
        </form>
      </div>
    </>
  )
}

export default App
