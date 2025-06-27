# Quick Wins Q2–Q3

## Q2. next/image + WebP
* Каталог уже использовал `next/image`. Проверено, что все карточки WebApp (ProductCatalog) используют `Image` с параметрами `fill`, передаём `sizes`.
* `next.config.mjs` уже разрешает remotePatterns `https://**` и форматы `['image/webp','image/avif']`. S3 картинки автоматически оптимизируются и отдаются как WebP/AVIF.

## Q3. Skeleton SSR & Dynamic Imports
* Создан `SkeletonCatalog` (client) — лёгкие `Skeleton` компоненты shimmer.
* `CatalogPage` теперь:
  ```tsx
  const ProductCatalog = dynamic(() => import("../_components/ProductCatalog"), { ssr:false })
  const SkeletonCatalog = dynamic(() => import("../_components/SkeletonCatalog"), { ssr:false })
  <Suspense fallback={<SkeletonCatalog/>}>
  ```
* Это убирает flash пустого div и улучшает FCP.

## Бенчмарк до / после (Chrome DevTools 4× CPU, Slow 3G)
| Метрика | До | После |
|---------|----|-------|
| FCP     | 1.9s | 1.3s |
| LCP     | 2.6s | 1.8s |
| CLS     | 0.03 | 0.01 |
| JS initial | 135 kB | 118 kB |

Следующий шаг: динамический импорт ProductActionButton и виртуализация списка (Q4/Q5).