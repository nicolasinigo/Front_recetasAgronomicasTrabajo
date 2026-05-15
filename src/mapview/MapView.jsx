import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react' // 👈 AQUÍ AGREGAMOS useRef Y useImperativeHandle
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import html2canvas from 'html2canvas'

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
      drawPolygon: true, 
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
  }, [map, onPolygonComplete]);

  return null;
};

const MapView = forwardRef(({ onPolygonComplete }, ref) => {
  const mapContainerRef = useRef(null); // Ahora sí va a funcionar porque está importado arriba

  // Exponemos la función getMapImage al padre
  useImperativeHandle(ref, () => ({
    getMapImage: async () => {
      if (!mapContainerRef.current) return null;

      // Configuraciones para que la captura salga bien
      const canvas = await html2canvas(mapContainerRef.current, {
        useCORS: true, 
        logging: false,
        height: 400,
        width: mapContainerRef.current.offsetWidth,
      });

      // Convertimos el canvas a una imagen Base64 (PNG)
      return canvas.toDataURL('image/png');
    }
  }));

  return (
    <div ref={mapContainerRef} style={{ height: '400px', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={[-26.8083, -65.2176]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        preferCanvas={true} // Esto mejora el rendimiento al dibujar polígonos complejos
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <GeomanControl onPolygonComplete={onPolygonComplete} />
      </MapContainer>
    </div>
  )
});

export default React.memo(MapView);