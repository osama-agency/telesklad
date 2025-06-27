import { catalogStyles } from '../../utils/catalogStyles';

export function ProductCardSkeleton() {
  return (
    <div className={catalogStyles.skeleton.card}>
      <div className={catalogStyles.skeleton.wrapper}>
        <div className={catalogStyles.skeleton.image} />
        
        <div>
          <div className={catalogStyles.skeleton.text} />
          <div className={`${catalogStyles.skeleton.text} w-1/2`} />
          
          <div className="flex justify-between items-center mt-3">
            <div className={catalogStyles.skeleton.price} />
            <div className="h-8 w-16 bg-catalog-skeleton-base rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}