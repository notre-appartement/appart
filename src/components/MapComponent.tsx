'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { Appartement, Emplacement } from '@/types';
import { useEffect } from 'react';

// Fix pour les icônes par défaut de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Icônes personnalisées
const createCustomIcon = (color: string, emoji: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 18px;
        ">${emoji}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// Icônes pour les appartements selon l'évaluation
const appartementIcons = {
  bon: createCustomIcon('#10b981', '✅'),
  moyen: createCustomIcon('#f59e0b', '⚠️'),
  pas_bon: createCustomIcon('#ef4444', '❌'),
  default: createCustomIcon('#3b82f6', '🏠'),
};

// Icônes pour les emplacements selon le type
const emplacementIcons = {
  travail: createCustomIcon('#3b82f6', '💼'),
  famille: createCustomIcon('#ec4899', '👨‍👩‍👧'),
  loisirs: createCustomIcon('#8b5cf6', '🎾'),
  commerces: createCustomIcon('#10b981', '🛒'),
  autre: createCustomIcon('#6b7280', '📌'),
};

// Composant pour ajuster la vue de la carte
function MapBounds({ appartements, emplacements }: { appartements: Appartement[], emplacements: Emplacement[] }) {
  const map = useMap();

  useEffect(() => {
    const allPoints: [number, number][] = [];

    // Ajouter les appartements avec coordonnées
    appartements.forEach(appart => {
      if (appart.latitude && appart.longitude) {
        allPoints.push([appart.latitude, appart.longitude]);
      }
    });

    // Ajouter les emplacements avec coordonnées
    emplacements.forEach(emp => {
      if (emp.latitude && emp.longitude) {
        allPoints.push([emp.latitude, emp.longitude]);
      }
    });

    // Ajuster la carte pour montrer tous les points
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // Centre par défaut sur la France
      map.setView([46.603354, 1.888334], 6);
    }
  }, [appartements, emplacements, map]);

  return null;
}

interface MapComponentProps {
  appartements: Appartement[];
  emplacements: Emplacement[];
}

export default function MapComponent({ appartements, emplacements }: MapComponentProps) {
  // Centre par défaut (France)
  const center: [number, number] = [46.603354, 1.888334];

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapBounds appartements={appartements} emplacements={emplacements} />

      {/* Marqueurs pour les appartements */}
      {appartements.map((appart) => {
        // Pour le moment, on utilise des coordonnées fictives
        // TODO: Ajouter la géolocalisation réelle
        if (!appart.latitude || !appart.longitude) return null;

        const icon = appart.visite && appart.choix
          ? appartementIcons[appart.choix]
          : appartementIcons.default;

        return (
          <Marker
            key={`appart-${appart.id}`}
            position={[appart.latitude, appart.longitude]}
            icon={icon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg mb-2">{appart.titre}</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">{appart.adresse}</p>
                  <p className="text-gray-600">{appart.ville}</p>
                  <p className="font-semibold text-blue-600 text-base">
                    {appart.prix} € / mois
                  </p>
                  <p className="text-gray-500">
                    {appart.surface} m² • {appart.pieces} pièces
                  </p>
                  {appart.noteGlobale && (
                    <p className="text-yellow-600 font-medium">
                      ⭐ {appart.noteGlobale.toFixed(1)}/5
                    </p>
                  )}
                </div>
                <Link
                  href={`/appartements/${appart.id}`}
                  className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Voir les détails
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Marqueurs pour les emplacements */}
      {emplacements.map((emp) => {
        if (!emp.latitude || !emp.longitude) return null;

        const icon = emplacementIcons[emp.type];

        return (
          <Marker
            key={`emp-${emp.id}`}
            position={[emp.latitude, emp.longitude]}
            icon={icon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-base mb-2">{emp.nom}</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">{emp.adresse}</p>
                  {emp.description && (
                    <p className="text-gray-500 italic mt-2">{emp.description}</p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
