"use client";

import React, { useEffect, useState } from 'react';

export function CatalogDebugInfo() {
  const [debugInfo, setDebugInfo] = useState({
    containerHeight: 0,
    catalogHeight: 0,
    gridHeight: 0,
    productCount: 0,
    apiStatus: 'checking...'
  });

  useEffect(() => {
    // Проверяем высоты элементов
    const updateHeights = () => {
      const container = document.querySelector('.webapp-container');
      const catalog = document.querySelector('.product-catalog');
      const grid = document.querySelector('.product-grid');
      const products = document.querySelectorAll('.product-wrapper');

      setDebugInfo(prev => ({
        ...prev,
        containerHeight: container?.clientHeight || 0,
        catalogHeight: catalog?.clientHeight || 0,
        gridHeight: grid?.clientHeight || 0,
        productCount: products.length
      }));
    };

    // Проверяем API
    const checkAPI = async () => {
      try {
        const response = await fetch('/api/webapp/products');
        const data = await response.json();
        setDebugInfo(prev => ({
          ...prev,
          apiStatus: `OK: ${data.products?.length || 0} products`
        }));
      } catch (error) {
        setDebugInfo(prev => ({
          ...prev,
          apiStatus: `Error: ${error}`
        }));
      }
    };

    updateHeights();
    checkAPI();

    // Обновляем при изменении размера
    window.addEventListener('resize', updateHeights);
    const observer = new MutationObserver(updateHeights);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', updateHeights);
      observer.disconnect();
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '70px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '200px'
    }}>
      <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>🐛 Debug Info</div>
      <div>Container: {debugInfo.containerHeight}px</div>
      <div>Catalog: {debugInfo.catalogHeight}px</div>
      <div>Grid: {debugInfo.gridHeight}px</div>
      <div>Products: {debugInfo.productCount}</div>
      <div>API: {debugInfo.apiStatus}</div>
    </div>
  );
}
