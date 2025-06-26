import dynamic from 'next/dynamic';
import { LoadingSpinner } from './LoadingSpinner';

// 🚀 LAZY LOADING для тяжелых компонентов

// DeliveryDataSheet - загружается только когда нужно (default export)
export const DeliveryDataSheetLazy = dynamic(
  () => import('./DeliveryDataSheet'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

// SubscriptionsSheet - загружается только при открытии (default export)
export const SubscriptionsSheetLazy = dynamic(
  () => import('./SubscriptionsSheet'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

// AlgoliaModernSearch - named export, нужно обработать по-другому
export const AlgoliaModernSearchLazy = dynamic(
  () => import('./AlgoliaModernSearch').then(mod => ({ default: mod.AlgoliaModernSearch })),
  { 
    loading: () => <div className="search-skeleton">Загрузка поиска...</div>,
    ssr: false
  }
);

// DaDataInput - проверим как экспортируется
export const DaDataInputLazy = dynamic(
  () => import('./DaDataInput'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

// PhotoUploader - проверим как экспортируется
export const PhotoUploaderLazy = dynamic(
  () => import('./PhotoUploader'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

// ReviewsList - проверим как экспортируется
export const ReviewsListLazy = dynamic(
  () => import('./ReviewsList'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);
