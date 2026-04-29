import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {

  const [form, setForm] = useState({
    comercioFitosanitario: "",
    cuit1: "",
    adquiriente: "",
    cuit2: "",
    domicilio: "",
    predio: "",
    superficie: "",
    cultivo: "",
    diagnostico: "",
    tratamiento: "",
    recomendacion: "",
    agroquimicos: [
      {
        principioActivo: "",
        nomencComercial: "",
        dosis: "",
        cantidadTotal: ""
      }
    ]
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:3000/generar-pdf", form);

      alert("PDF generado correctamente");


      // reiniciar el formulario
      setForm({
        comercioFitosanitario: "",
        cuit1: "",
        adquiriente: "",
        cuit2: "",
        domicilio: "",
        predio: "",
        superficie: "",
        cultivo: "",
        diagnostico: "",
        tratamiento: "",
        recomendacion: "",
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
              <label>Comercio Fitosanitario:</label>
              <input name="comercioFitosanitario" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>CUIT Comercio:</label>
              <input name="cuit1" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Adquiriente:</label>
              <input name="adquiriente" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>CUIT Adquiriente:</label>
              <input name="cuit2" onChange={handleChange} required />
            </div>

            <div className="form-group full">
              <label>Domicilio:</label>
              <input name="domicilio" onChange={handleChange} required />
            </div>

            <div className="form-group full">
              <label>Localización del Predio Tratado:</label>
              <input name="predio" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Superficie:</label>
              <input name="superficie" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Cultivo a Tratar:</label>
              <input name="cultivo" onChange={handleChange} required />
            </div>

            <div className="form-group full">
              <label>Diagnóstico:</label>
              <input name="diagnostico" onChange={handleChange} required />
            </div>

            <div className="form-group full">
              <label>Tratamiento:</label>
              <input name="tratamiento" onChange={handleChange} required />
            </div>

            {/* Campo dinámico para agroquímicos */}
            {form.agroquimicos.map((agro, index) => (
              <div key={index} className="form-group full" style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "8px" }}>

                <h4>Agroquímico {index + 1}</h4>

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
              <textarea name="recomendacion" onChange={handleChange} required />
            </div>

          </div>

          <button type="submit">Generar Receta</button>
        </form>
      </div>
    </>
  )
}

export default App
