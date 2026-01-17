import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface MapPreviewProps {
  address: string;
  coordinates?: { lat: number; lng: number };
}

export function MapPreview({ address, coordinates }: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!coordinates || !mapRef.current) return;

    const loadLeaflet = async () => {
      try {
        const L = await import('leaflet');


        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        const map = L.map(mapRef.current).setView([coordinates.lat, coordinates.lng], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="color: #030213; font-size: 32px;">📍</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        L.marker([coordinates.lat, coordinates.lng], { icon }).addTo(map);

        mapInstanceRef.current = map;

        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coordinates]);

  if (!coordinates) {
    return (
      <div className="w-full h-64 bg-muted rounded-lg flex flex-col items-center justify-center">
        <MapPin className="size-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-sm">
          {address ? 'Wprowadź poprawny adres' : 'Wprowadź adres, aby zobaczyć mapę'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={mapRef} className="w-full h-64 rounded-lg overflow-hidden border" />
      <p className="text-sm text-muted-foreground">
        📍 {address}
      </p>
    </div>
  );
}
