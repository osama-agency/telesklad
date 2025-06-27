import { cn } from '../utils/catalogStyles';

export default function Pagination() {
  const pages = [1, 2, 3, 4, 5];
  const currentPage = 1;

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <button className="p-2 text-catalog-text-gray hover:text-catalog-primary transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {pages.map((page) => (
        <button
          key={page}
          className={cn(
            'w-10 h-10 rounded-lg transition-colors',
            page === currentPage
              ? 'bg-catalog-primary text-white'
              : 'text-catalog-text-gray hover:bg-gray-100'
          )}
        >
          {page}
        </button>
      ))}
      
      <button className="p-2 text-catalog-text-gray hover:text-catalog-primary transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}