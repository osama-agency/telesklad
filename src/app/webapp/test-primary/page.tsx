"use client";

import { IconComponent } from "@/components/webapp/IconComponent";
import { useState } from "react";

export default function TestPrimaryPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingTest = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '24px', color: '#333' }}>
        Primary Components - Система важных элементов
      </h1>
      
      {/* Primary Action Cards */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', color: '#666' }}>
          Primary Action Cards
        </h2>
        
        <div className="action-container">
          <div className="action-link">
            <div className="action-item action-item--primary">
              <div className="action-content">
                <div className="action-icon action-icon--pulse">
                  <IconComponent name="cart" size={20} />
                </div>
                <div className="action-text">
                  <div className="action-title">
                    Оформить заказ
                    <span className="badge-primary badge-primary--pulse">Новинка!</span>
                  </div>
                  <div className="action-description">
                    Быстрое оформление заказа с доставкой
                  </div>
                </div>
                <div className="action-arrow">
                  <IconComponent name="right" size={16} />
                </div>
              </div>
            </div>
          </div>

          <div className="action-link">
            <div className="action-item action-item--primary">
              <div className="action-content">
                <div className="action-icon">
                  <IconComponent name="support" size={20} />
                </div>
                <div className="action-text">
                  <div className="action-title">
                    Экстренная поддержка
                    <span className="badge-primary badge-primary--glow">24/7</span>
                  </div>
                  <div className="action-description">
                    Круглосуточная помощь специалистов
                  </div>
                </div>
                <div className="action-arrow">
                  <IconComponent name="right" size={16} />
                </div>
              </div>
              <div className="action-footer">
                <div className="action-footer-text">
                  Ответ в течение 5 минут
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Main Containers */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', color: '#666' }}>
          Primary Main Containers
        </h2>
        
        <div className="main-container main-container--primary mb-5">
          <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: '600', color: '#48C928' }}>
            🎯 Важное уведомление
          </h3>
          <p style={{ color: '#374151', lineHeight: '1.5', marginBottom: '15px' }}>
            Этот блок привлекает особое внимание пользователя к важной информации. 
            Используйте для критически важных уведомлений.
          </p>
          <div className="alert-primary">
            <div className="alert-title">Системное обновление</div>
            <div className="alert-content">
              Завтра с 02:00 до 04:00 будет проведено плановое обновление системы. 
              Возможны кратковременные перебои в работе.
            </div>
          </div>
        </div>
      </section>

      {/* Primary Buttons */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', color: '#666' }}>
          Primary Buttons
        </h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
          <button className="btn-primary">
            <IconComponent name="cart" size={16} />
            <span>Добавить в корзину</span>
          </button>
          
          <button className="btn-primary btn-primary--large">
            <IconComponent name="profile" size={20} />
            <span>Создать аккаунт</span>
          </button>
          
          <button className="btn-primary btn-primary--small">
            <span>Сохранить</span>
          </button>
          
          <button 
            className={`btn-primary ${isLoading ? 'btn-primary--loading' : ''}`}
            onClick={handleLoadingTest}
            disabled={isLoading}
          >
            <span>Загрузить данные</span>
          </button>
        </div>
      </section>

      {/* Primary Form Elements */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', color: '#666' }}>
          Primary Form Elements
        </h2>
        
        <div style={{ maxWidth: '400px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>
              Email адрес
            </label>
            <input 
              type="email" 
              className="form-input--primary" 
              placeholder="example@domain.com"
              style={{ width: '100%' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>
              Пароль (с ошибкой)
            </label>
            <input 
              type="password" 
              className="form-input--primary form-input--error" 
              placeholder="Введите пароль"
              style={{ width: '100%' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>
              Подтверждение (успешно)
            </label>
            <input 
              type="password" 
              className="form-input--primary form-input--success" 
              placeholder="Повторите пароль"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </section>

      {/* Primary Empty States */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', color: '#666' }}>
          Primary Empty States
        </h2>
        
        <div className="empty-state empty-state--primary">
          <div className="empty-container empty-container--compact">
            <div className="empty-content">
              <div className="empty-icon empty-icon--large empty-icon--floating">
                <IconComponent name="cart-empty" size={48} />
              </div>
              <div className="empty-title">Начните покупки прямо сейчас!</div>
              <div className="empty-subtitle">
                Откройте для себя широкий ассортимент качественных товаров 
                по выгодным ценам
              </div>
              <div className="empty-actions">
                <button className="empty-button empty-button--primary">
                  <IconComponent name="search" size={16} />
                  Перейти к каталогу
                </button>
                <button className="empty-button empty-button--secondary">
                  Популярные товары
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Badges */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', color: '#666' }}>
          Primary Badges
        </h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <span className="badge-primary">
            <IconComponent name="check" size={12} />
            Проверено
          </span>
          
          <span className="badge-primary badge-primary--pulse">
            <IconComponent name="star" size={12} />
            Хит продаж
          </span>
          
          <span className="badge-primary badge-primary--glow">
            <IconComponent name="gift" size={12} />
            Подарок
          </span>
          
          <span className="badge-primary">
            Быстрая доставка
          </span>
        </div>
      </section>

      {/* Primary Alerts */}
      <section style={{ marginBottom: '50px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', color: '#666' }}>
          Primary Alerts
        </h2>
        
                 <div className="alert-primary" style={{ marginBottom: '15px' }}>
           <div className="alert-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <IconComponent name="info" size={16} />
             Важная информация
           </div>
          <div className="alert-content">
            Ваш заказ успешно оформлен и передан в обработку. 
            Ожидаемое время доставки: 2-3 рабочих дня.
          </div>
        </div>
        
                 <div className="alert-primary">
           <div className="alert-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <IconComponent name="gift" size={16} />
             Специальное предложение
           </div>
          <div className="alert-content">
            При заказе на сумму свыше 5000₽ доставка бесплатная! 
            Акция действует до конца месяца.
          </div>
        </div>
      </section>

      {/* Интерактивная демонстрация */}
      <section>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', color: '#666' }}>
          Интерактивная демонстрация
        </h2>
        
        <div className="main-container main-container--primary">
          <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>
            🎮 Попробуйте в действии
          </h3>
          <p style={{ marginBottom: '20px', color: '#374151', lineHeight: '1.5' }}>
            Наведите курсор на элементы и нажимайте кнопки, чтобы увидеть анимации и эффекты.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <button className="btn-primary" onClick={() => alert('Анимация ripple effect!')}>
              Ripple Effect
            </button>
            
            <div className="action-link">
              <div className="action-item action-item--primary">
                <div className="action-content">
                  <div className="action-icon action-icon--pulse">
                    <IconComponent name="heart" size={16} />
                  </div>
                  <div className="action-text">
                    <div className="action-title">Hover эффект</div>
                  </div>
                  <div className="action-arrow">
                    <IconComponent name="right" size={14} />
                  </div>
                </div>
              </div>
            </div>
            
            <span className="badge-primary badge-primary--pulse">
              Пульсирующий badge
            </span>
          </div>
        </div>
      </section>
    </div>
  );
} 