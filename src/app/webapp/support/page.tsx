"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconComponent } from "@/components/webapp/IconComponent";
import LoadingSpinner from "../_components/LoadingSpinner";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface SupportContacts {
  telegram: string;
  telegram_url: string;
  working_hours: string;
  response_time: string;
}

interface SupportApiResponse {
  success: boolean;
  faq_items: FAQItem[];
  support_contacts: SupportContacts;
  error?: string;
}

export default function SupportPage() {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [supportContacts, setSupportContacts] = useState<SupportContacts | null>(null);
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    // Загрузка FAQ данных из API
    const loadFAQ = async () => {
      try {
        const response = await fetch('/api/webapp/support');
        const data: SupportApiResponse = await response.json();
        
        if (data.success) {
          setFaqItems(data.faq_items);
          setSupportContacts(data.support_contacts);
        } else {
          setError(data.error || 'Ошибка загрузки данных');
        }
      } catch (error) {
        console.error('Error loading FAQ:', error);
        setError('Не удалось загрузить данные. Попробуйте позже.');
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

  if (isLoading) {
    return (
      <div className="webapp-container support-page">
        <h1>Поддержка</h1>
        <LoadingSpinner variant="page" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="webapp-container support-page">
        <h1>Поддержка</h1>
        <div className="main-block">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="webapp-btn-secondary mt-4"
            >
              Попробовать снова
            </button>
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
          href={supportContacts?.telegram_url || "https://t.me/your_support_bot"}
          target="_blank"
          rel="noopener noreferrer"
          className="webapp-btn-secondary webapp-btn-big block text-center"
        >
          Задать вопрос
        </a>
      </div>

      {/* Заголовок FAQ */}
      {faqItems.length > 0 && (
        <h3 className="mb-4">Часто задаваемые вопросы</h3>
      )}

      {/* FAQ список */}
      {faqItems.length > 0 ? (
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
      ) : (
        <div className="main-block">
          <div className="text-center text-gray-500">
            <p>FAQ пока не добавлены</p>
          </div>
        </div>
      )}

      {/* Дополнительная информация */}
      {supportContacts && (
        <div className="main-block mt-6">
          <div className="support-contacts">
            <h4 className="mb-3 font-semibold">Контакты поддержки</h4>
            <div className="support-contact-item">
              <div className="support-contact-label">Telegram:</div>
              <a 
                href={supportContacts.telegram_url} 
                className="support-contact-value" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {supportContacts.telegram}
              </a>
            </div>
            <div className="support-contact-item">
              <div className="support-contact-label">Время работы:</div>
              <div className="support-contact-value">{supportContacts.working_hours}</div>
            </div>
            <div className="support-contact-item">
              <div className="support-contact-label">Время ответа:</div>
              <div className="support-contact-value">{supportContacts.response_time}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 