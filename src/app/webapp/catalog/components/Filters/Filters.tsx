export default function Filters() {
  const categories = [
    'Все товары',
    'Электроника',
    'Одежда',
    'Продукты',
    'Книги',
    'Дом и сад',
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Фильтры</h2>
      
      {/* Категории */}
      <div>
        <h3 className="text-base font-medium mb-2">Категории</h3>
        <div className="space-y-2">
          {categories.map((category, index) => (
            <label key={index} className="flex items-center">
              <input 
                type="checkbox" 
                className="mr-2 text-catalog-primary focus:ring-catalog-primary"
              />
              <span className="text-sm">{category}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Цена */}
      <div>
        <h3 className="text-base font-medium mb-2">Цена</h3>
        <div className="space-y-2">
          <input 
            type="number" 
            placeholder="От" 
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <input 
            type="number" 
            placeholder="До" 
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
      </div>
      
      <button className="w-full bg-catalog-primary hover:bg-catalog-primary-hover text-white py-2 rounded-xl transition-colors font-medium">
        Применить
      </button>
    </div>
  );
}