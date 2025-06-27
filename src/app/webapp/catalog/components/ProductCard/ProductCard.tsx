import Image from 'next/image';
import { catalogStyles, cn } from '../../utils/catalogStyles';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  // Форматирование цены с пробелами
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Вычисление скидки
  const discount = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div 
      className={cn(
        catalogStyles.card.base,
        'animate-catalog-appear'
      )}
      style={{ animationDelay: `${index * 20}ms` }}
    >
      {/* Изображение товара */}
      <div className={catalogStyles.card.image}>
        {/* Бейдж скидки */}
        {discount > 0 && (
          <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded z-10">
            -{discount}%
          </div>
        )}
        
        {/* Кнопка избранного */}
        <button className="absolute top-1.5 right-1.5 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center z-10 hover:bg-white transition-colors">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        
        {product.image === '/placeholder.jpg' ? (
          <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ) : (
          <Image 
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          />
        )}
      </div>
      
      {/* Информация о товаре */}
      <div className={catalogStyles.card.content}>
        <h3 className={catalogStyles.card.title}>{product.name}</h3>
        
        <div className="flex flex-col gap-1">
          {/* Цены */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className={catalogStyles.card.price}>{formatPrice(product.price)}₽</span>
            </div>
            {product.oldPrice && (
              <div className="flex items-center gap-1.5">
                <span className={catalogStyles.card.oldPrice}>
                  {formatPrice(product.oldPrice)}₽
                </span>
                <span className="text-red-500 text-[10px] font-medium">
                  -{discount}%
                </span>
              </div>
            )}
          </div>
          
          <button className={catalogStyles.card.button}>
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
}