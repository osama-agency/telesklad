"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconComponent } from "@/components/webapp/IconComponent";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function SupportPage() {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set document title for Telegram Web App
    document.title = "Поддержка";
    
    // Telegram Web App initialization
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#FFFFFF');
      tg.setBackgroundColor('#f9f9f9');
    }

    // Загрузка FAQ данных
    const loadFAQ = async () => {
      try {
        // Имитируем загрузку данных
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Мок данные FAQ - типичные вопросы для интернет-магазина
        const mockFAQ: FAQItem[] = [
          {
            id: 1,
            question: "Как оформить заказ?",
            answer: "Добавьте товары в корзину, перейдите в корзину, заполните данные для доставки и подтвердите заказ. Мы свяжемся с вами для уточнения деталей."
          },
          {
            id: 2,
            question: "Какие способы оплаты доступны?",
            answer: "Мы принимаем оплату наличными при получении, банковскими картами, через Сбербанк Онлайн, ЮMoney и другие популярные платежные системы."
          },
          {
            id: 3,
            question: "Сколько стоит доставка?",
            answer: "Стоимость доставки зависит от региона и веса заказа. По Москве в пределах МКАД доставка составляет 300₽. При заказе от 3000₽ - доставка бесплатная."
          },
          {
            id: 4,
            question: "Как долго ждать доставку?",
            answer: "Обычно доставка занимает 1-3 рабочих дня по Москве и Московской области, 3-7 дней по регионам России. Точные сроки уточняются при оформлении заказа."
          },
          {
            id: 5,
            question: "Можно ли вернуть товар?",
            answer: "Да, вы можете вернуть товар в течение 14 дней с момента получения, если товар не подошел или имеет дефекты. Товар должен быть в оригинальной упаковке."
          },
          {
            id: 6,
            question: "Как отследить заказ?",
            answer: "После отправки заказа вы получите номер для отслеживания. Также можно посмотреть статус заказа в разделе 'История заказов' в вашем профиле."
          },
          {
            id: 7,
            question: "Что делать если товара нет в наличии?",
            answer: "Вы можете подписаться на уведомления о поступлении товара. Как только товар появится в наличии, мы пришлем вам уведомление."
          },
          {
            id: 8,
            question: "Как связаться с поддержкой?",
            answer: "Вы можете написать нам в Telegram, позвонить по телефону или отправить сообщение через форму обратной связи. Мы отвечаем в течение 15 минут в рабочее время."
          }
        ];
        
        setFaqItems(mockFAQ);
      } catch (error) {
        console.error('Error loading FAQ:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFAQ();
  }, []);

  const toggleFAQ = (id: number) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Telegram support link - в реальном приложении это будет из настроек
  const telegramSupportLink = "https://t.me/your_support_bot";

  if (isLoading) {
    return (
      <div className="webapp-container support-page">
        <h1>Поддержка</h1>
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="webapp-container support-page">
      <h1>Поддержка</h1>
      
      {/* Кнопка связи с поддержкой */}
      <div className="mb-6">
        <a 
          href={telegramSupportLink}
          target="_blank"
          rel="noopener noreferrer"
          className="webapp-btn-secondary webapp-btn-big block text-center"
        >
          Задать вопрос
        </a>
      </div>

      {/* Заголовок FAQ */}
      <h3 className="mb-4">Часто задаваемые вопросы</h3>

      {/* FAQ список */}
      <div className="faq-container">
        {faqItems.map((item) => (
          <div key={item.id} className="main-block mb-2">
            <div className="faq-question">
              <div 
                className="faq-question-header"
                onClick={() => toggleFAQ(item.id)}
              >
                <div className="faq-question-text">
                  {item.question}
                </div>
                <button 
                  className={`faq-toggle-icon ${openItems.has(item.id) ? 'open' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFAQ(item.id);
                  }}
                >
                  <IconComponent name="down" size={16} />
                </button>
              </div>
              
              <div className={`faq-answer ${openItems.has(item.id) ? 'open' : ''}`}>
                <div className="faq-answer-content">
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Дополнительная информация */}
      <div className="main-block mt-6">
        <div className="support-contacts">
          <h4 className="mb-3 font-semibold">Контакты поддержки</h4>
          <div className="support-contact-item">
            <div className="support-contact-label">Telegram:</div>
            <a href={telegramSupportLink} className="support-contact-value" target="_blank" rel="noopener noreferrer">
              @your_support_bot
            </a>
          </div>
          <div className="support-contact-item">
            <div className="support-contact-label">Время работы:</div>
            <div className="support-contact-value">Пн-Пт 9:00-18:00 МСК</div>
          </div>
          <div className="support-contact-item">
            <div className="support-contact-label">Время ответа:</div>
            <div className="support-contact-value">В течение 15 минут</div>
          </div>
        </div>
      </div>
    </div>
  );
} 