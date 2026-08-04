import { useState, useRef } from 'react'
import axios from 'axios'
import './App.css'
import MapView from './mapview/MapView.jsx'
import { Turnstile } from "@marsidev/react-turnstile";
import Select from "react-select";


function App() {

  const mapViewRef = useRef(null); // Referencia para el mapa

  const [loading, setLoading] = useState(false);

  // Estado para el modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [mensajeModal, setMensajeModal] = useState("");
  const [onConfirm, setOnConfirm] = useState(null);

  // Estado para el captcha
  const [captchaValidado, setCaptchaValidado] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");

  const [form, setForm] = useState({
    fechaAplicacion: "",
    asesorApellido: "",
    asesorNombres: "",
    cuit1: "",
    empresaProductora: "",
    cuit2: "",
    aplicadora: "",
    categoriaAplicadora: "",
    cuit3: "",
    pilotoApellido: "",
    pilotoNombres: "",
    cuit4: "",
    tipoMaquina: "",
    modelo: "",
    Matricula: "",
    domicilio: "",
    predio: "",
    latitud: "",
    longitud: "",
    superficie: "",
    poligono: [],
    cultivo: "",
    cultivoOtro: "",
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

  // Opciones de cultivo para el select
  const cultivoOptions = [
    { value: "Ajo", label: "Ajo" },
    { value: "Arándano", label: "Arándano" },
    { value: "Arveja", label: "Arveja" },
    { value: "Batata", label: "Batata" },
    { value: "Caña de azúcar", label: "Caña de azúcar" },
    { value: "Cebolla", label: "Cebolla" },
    { value: "Chilto (Tomate de árbol)", label: "Chilto (Tomate de árbol)" },
    { value: "Frutilla", label: "Frutilla" },
    { value: "Garbanzo", label: "Garbanzo" },
    { value: "Lechuga", label: "Lechuga" },
    { value: "Lenteja", label: "Lenteja" },
    { value: "Limón", label: "Limón" },
    { value: "Mandarina", label: "Mandarina" },
    { value: "Maíz", label: "Maíz" },
    { value: "Maracuyá", label: "Maracuyá" },
    { value: "Melón", label: "Melón" },
    { value: "Naranja", label: "Naranja" },
    { value: "Palta", label: "Palta" },
    { value: "Papa", label: "Papa" },
    { value: "Pimiento morrón", label: "Pimiento morrón" },
    { value: "Pimiento para pimentón", label: "Pimiento para pimentón" },
    { value: "Pomelo", label: "Pomelo" },
    { value: "Poroto alubia", label: "Poroto alubia" },
    { value: "Poroto blanco", label: "Poroto blanco" },
    { value: "Poroto negro", label: "Poroto negro" },
    { value: "Sandía", label: "Sandía" },
    { value: "Soja", label: "Soja" },
    { value: "Sorgo", label: "Sorgo" },
    { value: "Tabaco", label: "Tabaco" },
    { value: "Tomate", label: "Tomate" },
    { value: "Trigo", label: "Trigo" },
    { value: "Vid (Uva)", label: "Vid (Uva)" },
    { value: "Zanahoria", label: "Zanahoria" },
    { value: "Zapallo", label: "Zapallo" },
    { value: "Otros", label: "Otros" },
  ];


  // Manejar cambios en el polígono
  const handlePolygonComplete = (coords) => {
    setForm(prevForm => ({
      ...prevForm,
      poligono: coords
    }));
  };

  // Manejar cambios en los campos del formulario y borrar piloto y cuit4 si la categoria es terrestre
  const handleChange = (e) => {

    if (e.target.name === "categoriaAplicadora" && e.target.value === "AplicadoraTerrestre") {
      setForm({
        ...form,
        [e.target.name]: e.target.value,
        piloto: "",
        cuit4: "",
        emailPiloto: "" // Limpiamos el email del piloto también
      });
      return;
    }

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Manejar cambios en el campo de latitud, permitiendo solo números y un punto decimal
  const handleLatitud = (e) => {
    let valor = e.target.value;

    // Cambia coma por punto
    valor = valor.replace(",", ".");

    // Solo permite números, un - y un .
    valor = valor.replace(/[^0-9.-]/g, "");

    // Solo un -
    const menos = (valor.match(/-/g) || []).length;
    if (menos > 1) return;

    // El - solo al principio
    if (valor.includes("-") && valor.indexOf("-") !== 0) return;

    // Solo un .
    const puntos = (valor.match(/\./g) || []).length;
    if (puntos > 1) return;

    setForm({
      ...form,
      latitud: valor,
    });
  };

  // Manejar cambios en el campo de longitud, permitiendo solo números y un punto decimal
  const handleLongitud = (e) => {
    let valor = e.target.value;

    // Cambia coma por punto
    valor = valor.replace(",", ".");

    // Solo permite números, un - y un .
    valor = valor.replace(/[^0-9.-]/g, "");

    // Solo un -
    const menos = (valor.match(/-/g) || []).length;
    if (menos > 1) return;

    // El - solo al principio
    if (valor.includes("-") && valor.indexOf("-") !== 0) return;

    // Solo un .
    const puntos = (valor.match(/\./g) || []).length;
    if (puntos > 1) return;

    setForm({
      ...form,
      longitud: valor,
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

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validar que se haya dibujado un polígono y que la fecha sea correcta
    if (!form.fechaAplicacion || form.poligono.length === 0) {
      abrirModalExito("Por favor, dibuje el polígono del predio tratado en el mapa.");
      return;
    }

    // 2. Validar que la fecha esté dentro del rango permitido
    const fechaAplicacion = form.fechaAplicacion;

    if (fechaAplicacion < minDateStr || fechaAplicacion > maxDateStr) {
      abrirModalExito(
        `La fecha de aplicación debe estar entre ${minDateStr} y ${maxDateStr}.`
      );
      return;
    }

    // 3. Validar que los correos electrónicos sean válidos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 4. Validar correos electrónicos según la categoría de aplicadora
    if (!emailRegex.test(form.emailEmpresa)) {
      abrirModalExito("Por favor, ingrese un correo electrónico válido para la empresa.");
      return;
    }

    if (!emailRegex.test(form.emailAsesor)) {
      abrirModalExito("Por favor, ingrese un correo electrónico válido para el asesor.");
      return;
    }

    if (form.categoriaAplicadora !== "AplicadoraTerrestre" && !emailRegex.test(form.emailPiloto)) {
      abrirModalExito("Por favor, ingrese un correo electrónico válido para el piloto.");
      return;
    }

    // 5. Abrimos el modal de confirmación antes de enviar los datos
    abrirModalExito(
      "¿Está seguro de enviar la información?",
      enviarFormulario
    );

  };

  // Función para enviar el formulario al backend
  const enviarFormulario = async () => {

    try {
      setLoading(true); // INICIA CARGA

      // 1. 👈 Pedimos la imagen al mapa (esto es asíncrono)
      const mapImageBase64 = await mapViewRef.current.getMapImage();

      // 2. 👈 Creamos el objeto final de datos, incluyendo la imagen, y los datos del piloto
      const dataToSend = {
        ...form,
        mapaImagen: mapImageBase64, // Este es un string larguísimo (Base64)
        pilotoApellido: form.categoriaAplicadora === "AplicadoraTerrestre" ? "--------" : form.pilotoApellido,
        pilotoNombres: form.categoriaAplicadora === "AplicadoraTerrestre" ? "--------" : form.pilotoNombres,
        cuit4: form.categoriaAplicadora === "AplicadoraTerrestre" ? "-----------" : form.cuit4,
        emailPiloto: form.categoriaAplicadora === "AplicadoraTerrestre" ? "" : form.emailPiloto,
        captchaToken: captchaToken // Enviamos el token del captcha al backend
      };

      // Validar que los CUIT tengan exactamente 11 dígitos, en caso contrario, no enviar el formulario y mostrar un mensaje de error con mensajeModal
      if (String(form.cuit1).length !== 11) {
        abrirModalExito("El CUIT del Asesor debe tener exactamente 11 dígitos.");
        return;
      }
      if (String(form.cuit2).length !== 11) {
        abrirModalExito("El CUIT de la Empresa Productora debe tener exactamente 11 dígitos.");
        return;
      }
      if (String(form.cuit3).length !== 11) {
        abrirModalExito("El CUIT de la Empresa Aplicadora debe tener exactamente 11 dígitos.");
        return;
      }

      //si la categoria es aerea o dron, validar que el cuit4 tenga 11 digitos
      if (form.categoriaAplicadora !== "AplicadoraTerrestre" && String(form.cuit4).length !== 11) {
        abrirModalExito("El CUIT del Piloto debe tener exactamente 11 dígitos.");
        return;
      }

      // Validar el campo de cultivo y enviar el valor correcto
      const cultivoEnviar = form.cultivo === "Otros" ? form.cultivoOtro : form.cultivo;
      dataToSend.cultivo = cultivoEnviar;

      // 3. Enviar los datos al backend
      //`${import.meta.env.VITE_URL_BACKEND}generar-pdf`,
      const res = await axios.post(
        `/generar-pdf`,
        dataToSend
      );


      if (res.data.ok) {
        abrirModalExito(res.data.mensaje || "Datos enviados correctamente.");
      } else {
        abrirModalExito("Hubo un problema al procesar la solicitud.");
        return;
      }

      // reiniciar el formulario
      setForm({
        fechaAplicacion: "",
        asesorApellido: "",
        asesorNombres: "",
        cuit1: "",
        empresaProductora: "",
        cuit2: "",
        aplicadora: "",
        categoriaAplicadora: "",
        cuit3: "",
        pilotoApellido: "",
        pilotoNombres: "",
        cuit4: "",
        tipoMaquina: "",
        modelo: "",
        Matricula: "",
        domicilio: "",
        predio: "",
        latitud: "",
        longitud: "",
        superficie: "",
        poligono: [],
        cultivo: "",
        cultivoOtro: "",
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

      //reinicar el mapa
      if (mapViewRef.current) {
        mapViewRef.current.getMapImage(); // Esto forzará a MapView a refrescar su estado interno y, por ende, el mapa
      }

    } catch (error) {
      console.error(error);
      abrirModalExito("Error al enviar el formulario. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false); // TERMINA CARGA
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
  const abrirModalExito = (mensaje, callback = null) => {
    setMensajeModal(mensaje);
    setOnConfirm(() => callback);
    setModalAbierto(true);
  };

  const aceptarModal = () => {
    setModalAbierto(false);

    if (onConfirm) {
      onConfirm();
    }
  };

  const cancelarModal = () => {
    setModalAbierto(false);
  };


  if (!captchaValidado) {
    return (
      <div className="captcha-page">
        <div className="captcha-box">
          <h1>Receta Agroquímica</h1>
          <p>
            Para acceder al formulario debe verificar que no es un robot.
          </p>

          <Turnstile
            siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
            onSuccess={(token) => {
              setCaptchaToken(token);
              setCaptchaValidado(true);
            }}
          />
        </div>
      </div>
    );
  }


  return (
    <>
      <div className="form-container">

        <div>
          <img src="/direccion-de-agricultura.png" alt="Logo Gobierno de Tucumán" style={{ width: "500px", height: "100px" }} />
        </div>

        <h2>Receta Agroquímica de Aplicación</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Fecha de la Aplicación:</label>
              <input type="date" name="fechaAplicacion" value={form.fechaAplicacion} min={minDateStr} max={maxDateStr} onChange={handleChange} required />
            </div>
            <br />

            <div className="form-group full" style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "8px" }}>

              <h4>Responsables:</h4>

              <div className="form-grid">


                <div className="form-group">
                  <label>Asesor Apellido:</label>
                  <input name="asesorApellido" value={form.asesorApellido} onChange={handleChange} required maxLength="30" />
                </div>

                <div className="form-group">
                  <label>Asesor Nombre/s:</label>
                  <input name="asesorNombres" value={form.asesorNombres} onChange={handleChange} required maxLength="30" />
                </div>

                <div className="form-group">
                  <label>CUIT del Asesor:</label>
                  <input type="number" name="cuit1" value={form.cuit1} onChange={handleChange} onKeyDown={(e) => {
                    if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
                      e.preventDefault();
                    }
                  }} required />
                  {form.cuit1 && String(form.cuit1).length !== 11 && (
                    <small style={{ color: "red", fontSize: "12px" }}>
                      El CUIT debe tener exactamente 11 dígitos.
                    </small>
                  )}
                </div>

              </div>

              <div className="form-grid">


                <div className="form-group">
                  <label>Empresa Productora:</label>
                  <input name="empresaProductora" value={form.empresaProductora} onChange={handleChange} required maxLength="30" />
                </div>

                <div className="form-group">
                  <label>CUIT de la Empresa Productora:</label>
                  <input type="number" name="cuit2" value={form.cuit2} onChange={handleChange} onKeyDown={(e) => {
                    if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
                      e.preventDefault();
                    }
                  }} required />
                  {form.cuit2 && String(form.cuit2).length !== 11 && (
                    <small style={{ color: "red", fontSize: "12px" }}>
                      El CUIT debe tener exactamente 11 dígitos.
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label>Nombre de la Empresa Aplicadora:</label>
                  <input name="aplicadora" value={form.aplicadora} onChange={handleChange} required maxLength="30" />
                </div>

                <div className="form-group">
                  <label>Categoría de Empresa Aplicadora:</label>
                  <select name="categoriaAplicadora" value={form.categoriaAplicadora} onChange={handleChange} required>
                    <option value="">Seleccione una categoría</option>
                    <option value="AplicadoraAerea">Aplicadora Aérea</option>
                    <option value="AplicadoraTerrestre">Aplicadora Terrestre</option>
                    <option value="AplicadoraDron">Aplicación con Dron</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>CUIT Aplicadora:</label>
                  <input type="number" name="cuit3" value={form.cuit3} onChange={handleChange} onKeyDown={(e) => {
                    if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
                      e.preventDefault();
                    }
                  }} required />
                  {form.cuit3 && String(form.cuit3).length !== 11 && (
                    <small style={{ color: "red", fontSize: "12px" }}>
                      El CUIT debe tener exactamente 11 dígitos.
                    </small>
                  )}
                </div>
                <br />
                {(form.categoriaAplicadora === "AplicadoraAerea" ||
                  form.categoriaAplicadora === "AplicadoraDron") && (
                    <>
                      <div className="form-group">
                        <label>Piloto Apellido:</label>
                        <input
                          name="pilotoApellido"
                          value={form.pilotoApellido}
                          onChange={handleChange}
                          required
                          maxLength="30"
                        />
                      </div>

                      <div className="form-group">
                        <label>Piloto Nombre/s:</label>
                        <input
                          name="pilotoNombres"
                          value={form.pilotoNombres}
                          onChange={handleChange}
                          required
                          maxLength="30"
                        />
                      </div>

                      <div className="form-group">
                        <label>CUIT del Piloto:</label>
                        <input
                          type="number"
                          name="cuit4"
                          value={form.cuit4}
                          onChange={handleChange}
                          onKeyDown={(e) => {
                            if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          required
                        />
                        {form.cuit4 && String(form.cuit4).length !== 11 && (
                          <small style={{ color: "red", fontSize: "12px" }}>
                            El CUIT debe tener exactamente 11 dígitos.
                          </small>
                        )}
                      </div>
                    </>
                  )}
              </div>
            </div>

            <div className="form-group full" style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "8px" }}>

              <h4>Tipo de Máquina:</h4>

              <div className="form-group">
                <label>Marca:</label>
                <input name="tipoMaquina" value={form.tipoMaquina} onChange={handleChange} required maxLength="30" />
              </div>

              <div className="form-group">
                <label>Modelo:</label>
                <input name="modelo" value={form.modelo} onChange={handleChange} required maxLength="50" />
              </div>

              <div className="form-group">
                <label>Matrícula de la Máquina:</label>
                <input name="Matricula" value={form.Matricula} onChange={handleChange} required maxLength="20" />
              </div>

            </div>

            <div className="form-group full" style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "8px" }}>

              <h4>Ubicación del Predio:</h4>
              <div className="form-grid">


                <div className="form-group full">
                  <label>Domicilio:</label>
                  <input name="domicilio" value={form.domicilio} onChange={handleChange} required maxLength="50" />
                </div>

                <div className="form-group full">
                  <label>Localización del Predio Tratado:</label>
                  <input name="predio" value={form.predio} onChange={handleChange} required maxLength="100" />
                </div>

                <div className="form-group">
                  <label>Latitud:</label>
                  <input type="text" name="latitud" value={form.latitud} onChange={handleLatitud} placeholder="-26.830947" required />
                </div>
                <div className="form-group">
                  <label>Longitud:</label>
                  <input type="text" name="longitud" value={form.longitud} onChange={handleLongitud} placeholder="-58.517253" required />
                </div>

                <div className="form-group">
                  <label>Superficie (Km²):</label>
                  <input type="number" min={0} name="superficie" value={form.superficie} onChange={handleChange} onKeyDown={(e) => {
                    if (["e", "E", "+", "-", "."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }} required />
                </div>
              </div>
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


            {/* mostrar opciones de cultivo en orden alfabético */}
            <div className="form-group">

              <label>Cultivo a Tratar:</label>



              <select name="cultivo" value={form.cultivo} onChange={handleChange} required maxlength="20" style={{ height: "40px", fontSize: "16px" }}>
                <option value="">Seleccione un cultivo</option>
                <option value="Ajo">Ajo</option>
                <option value="Arándano">Arándano</option>
                <option value="Arveja">Arveja</option>
                <option value="Batata">Batata</option>
                <option value="Caña de azúcar">Caña de azúcar</option>
                <option value="Cebolla">Cebolla</option>
                <option value="Chilto (Tomate de árbol)">Chilto (Tomate de árbol)</option>
                <option value="Frutilla">Frutilla</option>
                <option value="Garbanzo">Garbanzo</option>
                <option value="Lechuga">Lechuga</option>
                <option value="Lenteja">Lenteja</option>
                <option value="Limón">Limón</option>
                <option value="Mandarina">Mandarina</option>
                <option value="Maíz">Maíz</option>
                <option value="Maracuyá">Maracuyá</option>
                <option value="Melón">Melón</option>
                <option value="Naranja">Naranja</option>
                <option value="Palta">Palta</option>
                <option value="Papa">Papa</option>
                <option value="Pimiento morrón">Pimiento morrón</option>
                <option value="Pimiento para pimentón">Pimiento para pimentón</option>
                <option value="Pomelo">Pomelo</option>
                <option value="Poroto alubia">Poroto alubia</option>
                <option value="Poroto blanco">Poroto blanco</option>
                <option value="Poroto negro">Poroto negro</option>
                <option value="Sandía">Sandía</option>
                <option value="Soja">Soja</option>
                <option value="Sorgo">Sorgo</option>
                <option value="Tabaco">Tabaco</option>
                <option value="Tomate">Tomate</option>
                <option value="Trigo">Trigo</option>
                <option value="Vid (Uva)">Vid (Uva)</option>
                <option value="Zanahoria">Zanahoria</option>
                <option value="Zapallo">Zapallo</option>
                <option value="Otros">Otros</option>
              </select>

            </div>
            {form.cultivo === "Otros" && (
              <input
                type="text"
                name="cultivoOtro"
                value={form.cultivoOtro}
                onChange={handleChange}
                placeholder="Nombre del cultivo"
                required
                maxLength={20}
                style={{
                  width: "92%",
                  height: "20px",
                  fontSize: "14px",
                  marginTop: "30px",
                }}
              />
            )}



            <div className="form-group full">
              <label>Diagnóstico:</label>
              <input name="diagnostico" value={form.diagnostico} onChange={handleChange} required maxLength="100" />
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
                      maxLength="20"
                    />
                  </div>

                  <div className="form-group">
                    <label>Nomenc. Comercial</label>
                    <input
                      name="nomencComercial"
                      value={agro.nomencComercial}
                      onChange={(e) => handleAgroChange(index, e)}
                      required
                      maxLength="30"
                    />
                  </div>

                  <div className="form-group">
                    <label>Dosis (ml)</label>
                    <input
                      type="number"
                      min={0}
                      name="dosis"
                      value={agro.dosis}
                      onChange={(e) => handleAgroChange(index, e)}
                      onKeyDown={(e) => {
                        if (["e", "E", "+", "-"].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Cantidad Total (lt)</label>
                    <input
                      type="number"
                      min={0}
                      name="cantidadTotal"
                      value={agro.cantidadTotal}
                      onChange={(e) => handleAgroChange(index, e)}
                      onKeyDown={(e) => {
                        if (["e", "E", "+", "-"].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
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
              <label>Recomendaciones Técnicas:</label>
              <textarea name="recomendacion" value={form.recomendacion} onChange={handleChange} maxLength="200" />
            </div>

            <div className="form-group full" style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "8px" }}>
              {/* mail por el cual se enviara la receta */}
              <div className="form-group full">
                <legend>En este correo electrónico usted recibirá la receta</legend>
                <label>Correo Electrónico Empresa:</label>
                <input type="email" name="emailEmpresa" value={form.emailEmpresa} onChange={handleChange} required maxLength="40" />
              </div>
              <br />
              <div className="form-group full">
                <legend>En este correo electrónico el asesor recibirá una copia de la receta</legend>
                <label>Correo Electrónico del Asesor:</label>
                <input type="email" name="emailAsesor" value={form.emailAsesor} onChange={handleChange} required maxLength="40" />
              </div>
              <br />

              {(form.categoriaAplicadora === "AplicadoraAerea" ||
                form.categoriaAplicadora === "AplicadoraDron") && (
                  <>
                    <div className="form-group full">
                      <legend>En este correo electrónico el piloto recibirá una copia de la receta.</legend>
                      <label>Correo Electrónico del Piloto:</label>
                      <input type="email" name="emailPiloto" value={form.emailPiloto} onChange={handleChange} required maxLength="40" />
                    </div>
                  </>
                )}

            </div>

          </div>

          <button type="submit">
            Generar Receta
          </button>
        </form>

        {/*Modal de respuesta */}

        {modalAbierto && (
          <div className="modal">
            <div className="modal-contenido">
              <h2>Confirmación</h2>

              <p>{mensajeModal}</p>

              <button onClick={aceptarModal}>
                Aceptar
              </button>

              <button onClick={cancelarModal}>
                Cancelar
              </button>
            </div>
          </div>
        )}


        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Generando receta...</p>
          </div>
        )}

      </div>
    </>
  )
}

export default App
