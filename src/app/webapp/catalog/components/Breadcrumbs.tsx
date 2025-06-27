export default function Breadcrumbs() {
  return (
    <nav className="flex items-center space-x-2 text-webapp-caption text-catalog-text-gray mb-4">
      <a href="/" className="hover:text-catalog-primary transition-colors">Главная</a>
      <span>/</span>
      <span className="text-catalog-text-light">Каталог</span>
    </nav>
  );
}