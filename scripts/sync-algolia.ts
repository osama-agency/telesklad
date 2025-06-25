#!/usr/bin/env ts-node

/**
 * Скрипт для синхронизации товаров с Algolia
 * 
 * Использование:
 * npm run algolia:sync
 */

import { AlgoliaService } from '../src/lib/services/algolia.service';

async function syncAlgolia() {
  console.log('🚀 Starting Algolia sync script...');
  
  try {
    // Проверяем наличие необходимых переменных окружения
    if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID) {
      throw new Error('NEXT_PUBLIC_ALGOLIA_APP_ID environment variable is required');
    }
    
    if (!process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY) {
      throw new Error('NEXT_PUBLIC_ALGOLIA_SEARCH_KEY environment variable is required');
    }
    
    console.log('✅ Environment variables check passed');
    console.log(`📍 App ID: ${process.env.NEXT_PUBLIC_ALGOLIA_APP_ID}`);
    console.log(`📍 Index: ${process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PRODUCTS || 'nextadmin_products'}`);
    
    // Выполняем синхронизацию
    const result = await AlgoliaService.syncProducts();
    
    console.log('✅ Algolia sync completed successfully!');
    console.log('📊 Sync result:', result);
    
  } catch (error) {
    console.error('❌ Algolia sync failed:', error);
    process.exit(1);
  }
}

// Запускаем скрипт если он вызван напрямую
if (require.main === module) {
  syncAlgolia();
}

export { syncAlgolia }; 