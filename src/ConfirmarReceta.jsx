import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function ConfirmarRecetas() {
    const { id } = useParams();
    const [mensaje, setMensaje] = useState("");
    const [tipoAlerta, setTipoAlerta] = useState("success");
    const [confirmado, setConfirmado] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleConfirmar = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                //`${import.meta.env.VITE_URL_BACKEND}confirmarReceta/${id}`
                `/confirmarReceta/${id}`
            );
            setMensaje(res.data.mensaje);
            setConfirmado(true);
            setTipoAlerta(res.data.vencida ? "error" : "success");
        } catch (error) {
            setMensaje(error.response?.data?.mensaje || "Hubo un error al procesar la confirmación.");
            setTipoAlerta("error");
            setConfirmado(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: 'auto', textAlign: 'center', fontFamily: 'Arial' }}>
            <h2>Confirmación de Aplicación Agronómica</h2>
            <p>Receta N°: <strong>{id}</strong></p>

            {!confirmado ? (
                <div style={{ marginTop: '30px' }}>
                    <p>Haga clic en el botón para confirmar que la aplicación se ha realizado:</p>
                    <button
                        onClick={handleConfirmar}
                        disabled={loading}
                        style={{ background: '#28a745', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
                    >
                        {loading ? "Procesando..." : "Confirmar Aplicación"}
                    </button>
                </div>
            ) : (
                <div style={{ marginTop: '30px', padding: '20px', borderRadius: '5px', background: tipoAlerta === 'success' ? '#d4edda' : '#f8d7da', color: tipoAlerta === 'success' ? '#155724' : '#721c24' }}>
                    <h1 style={{ fontSize: '22px', margin: '0 0 10px 0' }}>
                        {tipoAlerta === 'success' ? "¡Éxito!" : "Atención"}
                    </h1>
                    <p style={{ fontSize: '16px', margin: 0 }}>{mensaje}</p>
                </div>
            )}
        </div>
    );
}