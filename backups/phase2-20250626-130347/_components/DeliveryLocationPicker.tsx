'use client';
import { useState } from 'react';

export default function DeliveryLocationPicker() {
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = () => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.LocationManager) return;

    setLoading(true);
    tg.LocationManager.getLocation((location) => {
      if (location) {
        setLocation({
          lat: location.latitude,
          lon: location.longitude
        });
        // Сохранить в профиль пользователя
      }
      setLoading(false);
    });
  };

  return (
    <div className="delivery-location">
      <h3>Адрес доставки</h3>
      {location ? (
        <div className="location-info">
          <p>📍 Геолокация определена</p>
          <p>Широта: {location.lat.toFixed(6)}</p>
          <p>Долгота: {location.lon.toFixed(6)}</p>
        </div>
      ) : (
        <button 
          onClick={requestLocation} 
          disabled={loading}
          className="btn-location"
        >
          {loading ? 'Определяем...' : '📍 Определить местоположение'}
        </button>
      )}
    </div>
  );
} 