import { useState, useRef } from 'react'
import axios from 'axios'
import './App.css'
import MapView from './mapview/MapView.jsx'
import { Turnstile } from "@marsidev/react-turnstile";

const FormularioRecetasComercializadoras = () => {

    const [loading, setLoading] = useState(false);

    // Estado para el modal
    const [modalAbierto, setModalAbierto] = useState(false);
    const [mensajeModal, setMensajeModal] = useState("");
    const [onConfirm, setOnConfirm] = useState(null);

    // Estado para el captcha
    const [captchaValidado, setCaptchaValidado] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");

    const [form, setForm] = useState({
        comercioFitosanitario: "",
        cuit1: "",
        adquiriente: "",
        cuit2: "",
        domicilio: "",
        predio: "",
        superficie: "",
        cultivo: "",
        cultivoOtro: "",
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

    // Manejar cambios del formulario
    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // Manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validar que los correos electrónicos sean válidos
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // 2. Validar el correo electrónico del asesor

        if (!emailRegex.test(form.email)) {
            abrirModalExito("Por favor, ingrese un correo electrónico válido.");
            return;
        }

        // 3. Abrimos el modal de confirmación antes de enviar los datos
        abrirModalExito(
            "¿Está seguro de enviar la información?",
            enviarFormulario
        );

    };

    // Función para enviar el formulario al backend
    const enviarFormulario = async () => {

        try {
            setLoading(true); // INICIA CARGA

            // Validar que los CUIT tengan exactamente 11 dígitos, en caso contrario, no enviar el formulario y mostrar un mensaje de error con mensajeModal
            if (String(form.cuit1).length !== 11) {
                abrirModalExito("El CUIT del Asesor debe tener exactamente 11 dígitos.");
                return;
            }
            if (String(form.cuit2).length !== 11) {
                abrirModalExito("El CUIT de la Empresa Productora debe tener exactamente 11 dígitos.");
                return;
            }

            // Validar el campo de cultivo y enviar el valor correcto
            const cultivoEnviar = form.cultivo === "Otros" ? form.cultivoOtro : form.cultivo;

            // Preparar los datos a enviar al backend
            const dataToSend = {
                ...form,
                cultivo: cultivoEnviar,
                captchaToken: captchaToken
            };

            // 3. Enviar los datos al backend
            const res = await axios.post(
                `${import.meta.env.VITE_URL_BACKEND}generar-pdf-comercializadora`,
                //`/generar-pdf-comercializadora`,
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
                comercioFitosanitario: "",
                adquiriente: "",
                cuit1: "",
                cuit2: "",
                domicilio: "",
                predio: "",
                superficie: "",
                cultivo: "",
                cultivoOtro: "",
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


    return (
        <>
            <div className="form-container">

                <div>
                    <img src="/direccion-de-agricultura.png" alt="Logo Gobierno de Tucumán" style={{ width: "500px", height: "100px" }} />
                </div>

                <h2>Receta Agroquímica de Aplicación</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">

                        <div className="form-group full" style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "8px" }}>

                            <h4>Responsables:</h4>

                            <div className="form-grid">


                                <div className="form-group">
                                    <label>Comercio Fitosanitario:</label>
                                    <input name="comercioFitosanitario" value={form.comercioFitosanitario} onChange={handleChange} required maxLength="30" />
                                </div>

                                <div className="form-group">
                                    <label>CUIT del Comercio Fitosanitario:</label>
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
                                    <label>Adquiriente:</label>
                                    <input name="adquiriente" value={form.adquiriente} onChange={handleChange} required maxLength="30" />
                                </div>

                                <div className="form-group">
                                    <label>CUIT del Adquiriente:</label>
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
                                    <label>Superficie (Km²):</label>
                                    <input type="number" min={0} name="superficie" value={form.superficie} onChange={handleChange} onKeyDown={(e) => {
                                        if (["e", "E", "+", "-", "."].includes(e.key)) {
                                            e.preventDefault();
                                        }
                                    }} required />
                                </div>
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
                            <br />
                            <div className="form-group full">
                                <legend>En este correo electrónico el asesor recibirá la receta</legend>
                                <label>Correo Electrónico del Asesor:</label>
                                <input type="email" name="email" value={form.email} onChange={handleChange} required maxLength="40" />
                            </div>

                        </div>

                    </div>

                    <div style={{ margin: "20px 0" }}>
                        <Turnstile
                            siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                            appearance="interaction-only"
                            onSuccess={(token) => {
                                setCaptchaToken(token);
                                setCaptchaValidado(true);
                            }}
                        />
                    </div>

                    <button type="submit" disabled={!captchaValidado}>
                        {captchaValidado ? "Generar Receta" : "Complete el captcha para habilitar el envío"}
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

export default FormularioRecetasComercializadoras