import React, { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'

// Este componente activa las herramientas de dibujo
const GeomanControl = ({ onPolygonComplete }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // 1. Configuramos los controles
    map.pm.addControls({
      position: 'topright',
      drawMarker: false,
      drawCircle: false,
      drawPolyline: false,
      drawRectangle: false,
      drawPolygon: true, // Solo dejamos el polígono para el campo
      editMode: true,
      dragMode: true,
      removalMode: true,
      drawCircleMarker: false,
      drawText: false,
      customControls: false,
      cutPolygon: false,
    });

    // 2. Escuchamos cuando se crea un polígono
    map.on('pm:create', (e) => {
      const { layer } = e;
      const coords = layer.getLatLngs()[0].map(p => [p.lat, p.lng]);
      onPolygonComplete(coords);

      layer.on('pm:edit', () => {
        const newCoords = layer.getLatLngs()[0].map(p => [p.lat, p.lng]);
        onPolygonComplete(newCoords);
      });

      // Si el usuario borra el polígono dibujado
      layer.on('pm:remove', () => {
        onPolygonComplete([]);
      });
    });

    // Limpieza al desmontar
    return () => {
      map.pm.removeControls();
      map.off('pm:create');
    };
  }, [map]);

  return null;
};

const MapView = ({ onPolygonComplete }) => {
  return (
    <MapContainer
      center={[-26.8083, -65.2176]}
      zoom={13}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* El componente mágico */}
      <GeomanControl onPolygonComplete={onPolygonComplete} />
    </MapContainer>
  )
}

export default MapView