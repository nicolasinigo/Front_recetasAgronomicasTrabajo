import React from 'react'
import { useNavigate } from 'react-router-dom'
import "./App.css"

const PaginaPrincipal = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f4f6f8',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: '#ffffff',
                padding: '40px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                maxWidth: '600px',
                width: '100%',
                textAlign: 'center'
            }}>
                <div>
                    <img src="/direccion-de-agricultura.png" alt="Logo Gobierno de Tucumán" style={{ width: "500px", height: "100px" }} />
                </div>

                {/* Encabezado con la misma identidad visual de la imagen */}
                <div style={{ marginBottom: '30px' }}>
                    
                    <hr style={{ border: '0', borderTop: '2px solid #E2E8F0', width: '80%', margin: '0 auto 20px auto' }} />

                    <h1 style={{ color: '#2e7d32', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                        Sistema de Recetario Agronómico
                    </h1>
                    <p style={{ color: '#666', fontSize: '15px', marginTop: '10px' }}>
                        Seleccione el tipo de receta que desea gestionar:
                    </p>
                </div>

                {/* Botones de selección */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
                    <button
                        onClick={() => navigate('/receta-aplicacion')}
                        style={{
                            backgroundColor: '#2e7d32',
                            color: 'white',
                            padding: '16px 20px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            boxShadow: '0 2px 5px rgba(46, 125, 50, 0.3)'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#27692b'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#2e7d32'}
                    >
                        Receta Agroquímica de Aplicación
                    </button>

                    <button
                        onClick={() => navigate('/receta-comercializacion')}
                        style={{
                            backgroundColor: '#2e7d32',
                            color: 'white',
                            padding: '16px 20px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            boxShadow: '0 2px 5px rgba(46, 125, 50, 0.3)'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#27692b'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#2e7d32'}
                    >
                        Receta Agronómica para Comercializar
                    </button>
                </div>

            </div>
        </div>
    )
}

export default PaginaPrincipal