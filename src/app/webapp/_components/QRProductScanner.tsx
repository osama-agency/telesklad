'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QRProductScanner() {
  const [scanning, setScanning] = useState(false);
  const router = useRouter();

  const scanQR = () => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.showScanQrPopup) return;

    setScanning(true);
    tg.showScanQrPopup({
      text: 'Отсканируйте QR-код товара'
    }, (result) => {
      setScanning(false);
      if (result) {
        // Обработка результата сканирования
        try {
          const productData = JSON.parse(result);
          if (productData.product_id) {
            router.push(`/webapp/products/${productData.product_id}`);
          }
        } catch {
          // Возможно, это URL товара
          if (result.includes('/products/')) {
            router.push(result);
          }
        }
      }
    });
  };

  return (
    <button 
      onClick={scanQR} 
      className="qr-scanner-btn"
      disabled={scanning}
    >
      📱 {scanning ? 'Сканирование...' : 'Сканировать QR'}
    </button>
  );
} 