import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

interface FriendProps {
  name: string;
  coords: [number, number];
  photoUrl?: string;
  isDriving: boolean;
}

const FriendMarker = ({ name, coords, photoUrl, isDriving }: FriendProps) => {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  // Criar o ícone personalizado com HTML
  const customIcon = L.divIcon({
    className: 'custom-avatar-wrapper',
    html: `
      <div class="avatar-container ${isDriving ? 'pulse' : ''}">
        ${photoUrl
          ? `<img src="${photoUrl}" class="avatar-img" />`
          : `<div class="avatar-initials">${name.charAt(0)}</div>`
        }
        <div class="avatar-label">${name}</div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  useEffect(() => {
    if (!markerRef.current) {
      // Inicializar o marcador
      markerRef.current = L.marker(coords, { icon: customIcon }).addTo(map);
    } else {
      // Animar para a nova posição (suaviza o movimento do GPS)
      markerRef.current.setLatLng(coords);
    }
  }, [coords, map]);

  return null; // O Leaflet gere o DOM, o React apenas controla a lógica
};

export default FriendMarker;