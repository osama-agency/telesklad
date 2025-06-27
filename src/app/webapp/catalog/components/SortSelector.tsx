export default function SortSelector() {
  return (
    <select className="px-3 py-2 text-webapp-caption border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-catalog-primary">
      <option value="popular">По популярности</option>
      <option value="price-asc">Сначала дешевые</option>
      <option value="price-desc">Сначала дорогие</option>
      <option value="new">Новинки</option>
    </select>
  );
}