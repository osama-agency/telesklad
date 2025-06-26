"use client";

import { IconComponent } from "@/components/webapp/IconComponent";

export default function TestComponentsPage() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '24px', color: '#333' }}>
        Тестирование компонентов V2
      </h1>
      
      {/* Main Block тестирование */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', color: '#666' }}>
          Main Block - Сравнение версий
        </h2>
        
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '16px', color: '#888' }}>
            Старый .main-block (через алиас)
          </h3>
          <div className="main-block mb-5">
            <h4 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: '600' }}>
              Заголовок блока
            </h4>
            <p style={{ color: '#666', lineHeight: '1.5' }}>
              Это пример контента в старом main-block. Стили применяются через алиас к новому .main-container.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '16px', color: '#888' }}>
            Новый .main-container (базовый)
          </h3>
          <div className="main-container mb-5">
            <h4 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: '600' }}>
              Заголовок блока V2
            </h4>
            <p style={{ color: '#666', lineHeight: '1.5' }}>
              Это новый main-container с улучшенными стилями и анимациями.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '16px', color: '#888' }}>
            Main Container - Варианты
          </h3>
          
          <div className="main-container main-container--compact mb-3">
            <h5 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '600' }}>
              Компактный вариант
            </h5>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Уменьшенные отступы для экономии места
            </p>
          </div>

          <div className="main-container main-container--primary mb-3">
            <h5 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '600' }}>
              Primary вариант
            </h5>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Зеленая цветовая схема для важных блоков
            </p>
          </div>

          <div className="main-container main-container--warning mb-3">
            <h5 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '600' }}>
              Warning вариант
            </h5>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Желтая цветовая схема для предупреждений
            </p>
          </div>

          <div className="main-container main-container--elevated mb-3">
            <h5 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '600' }}>
              Elevated вариант
            </h5>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Увеличенная тень для большей глубины
            </p>
          </div>
        </div>
      </section>

      {/* Empty State тестирование */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', color: '#666' }}>
          Empty State - Сравнение версий
        </h2>
        
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '16px', color: '#888' }}>
            Старый .no-items-wrapper (через алиас)
          </h3>
          <div className="no-items-wrapper">
            <div className="no-items-title">Товары не найдены</div>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '16px', color: '#888' }}>
            Новый .empty-container (базовый)
          </h3>
          <div className="empty-container empty-container--compact">
            <div className="empty-content">
              <div className="empty-icon">
                <IconComponent name="search" size={32} />
              </div>
              <div className="empty-title">Ничего не найдено</div>
              <div className="empty-subtitle">
                Попробуйте изменить параметры поиска
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '16px', color: '#888' }}>
            Empty State - Специфичные варианты
          </h3>
          
          {/* Пустая корзина */}
          <div className="empty-state empty-state--cart" style={{ marginBottom: '20px' }}>
            <div className="empty-container empty-container--compact">
              <div className="empty-content">
                <div className="empty-icon empty-icon--large empty-icon--primary empty-icon--floating">
                  <IconComponent name="cart-empty" size={48} />
                </div>
                <div className="empty-title">Корзина пуста</div>
                <div className="empty-subtitle">
                  Добавьте товары в корзину, чтобы оформить заказ
                </div>
                <div className="empty-actions">
                  <button className="empty-button empty-button--primary">
                    <IconComponent name="search" size={16} />
                    Перейти к каталогу
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Пустые избранные */}
          <div className="empty-state empty-state--favorites" style={{ marginBottom: '20px' }}>
            <div className="empty-container empty-container--compact">
              <div className="empty-content">
                <div className="empty-icon empty-icon--warning empty-icon--floating">
                  <IconComponent name="heart" size={32} />
                </div>
                <div className="empty-title">Нет избранных товаров</div>
                <div className="empty-subtitle">
                  Добавляйте товары в избранное для быстрого доступа
                </div>
                <div className="empty-actions empty-actions--horizontal">
                  <button className="empty-button empty-button--primary">
                    Перейти к каталогу
                  </button>
                  <button className="empty-button empty-button--secondary">
                    Популярные товары
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Ошибка загрузки */}
          <div className="empty-state empty-state--error" style={{ marginBottom: '20px' }}>
            <div className="empty-container empty-container--compact">
              <div className="empty-content">
                <div className="empty-icon">
                  <IconComponent name="alert-circle" size={32} />
                </div>
                <div className="empty-title">Ошибка загрузки</div>
                <div className="empty-subtitle">
                  Не удалось загрузить данные. Проверьте подключение к интернету.
                </div>
                <div className="empty-actions">
                  <button className="empty-button empty-button--primary">
                    <IconComponent name="refresh" size={16} />
                    Попробовать снова
                  </button>
                  <button className="empty-button empty-button--ghost">
                    Связаться с поддержкой
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading состояния */}
      <section>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', color: '#666' }}>
          Loading состояния
        </h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '16px', color: '#888' }}>
            Main Container - Loading
          </h3>
          <div className="main-container main-container--loading mb-3">
            <h5 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '600' }}>
              Загрузка данных...
            </h5>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Пожалуйста, подождите
            </p>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '15px', fontSize: '16px', color: '#888' }}>
            Empty State - Loading
          </h3>
          <div className="empty-container empty-container--loading empty-container--compact">
            <div className="empty-content">
              <div className="empty-icon">
                <IconComponent name="loader" size={32} />
              </div>
              <div className="empty-title">Загружаем данные...</div>
              <div className="empty-subtitle">
                Это займет несколько секунд
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 