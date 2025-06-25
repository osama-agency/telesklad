"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconComponent } from "@/components/webapp/IconComponent";
import SkeletonLoading from "../_components/SkeletonLoading";

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
    const loadData = async () => {
      try {
        setIsLoading(true);
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

    loadData();
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
      <div className="webapp-container profile-page">
        <div className="profile-content-stack">
          <SkeletonLoading type="support" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="webapp-container profile-page">
        <div className="profile-content-stack">
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-secondary"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="webapp-container profile-page">
      {/* Единый контейнер с фиксированными отступами */}
      <div className="profile-content-stack">
        
        {/* Заголовок поддержки */}
        <div className="profile-header">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center profile-avatar">
              <IconComponent name="support" size={20} />
            </div>
            <h2 className="text-xl font-semibold">
              Поддержка 💬
            </h2>
          </div>
        </div>

        {/* FAQ блок */}
        {faqItems.length > 0 && (
          <div className="support-faq-section">
            <h3 className="section-title">Часто задаваемые вопросы</h3>
            <div className="faq-list">
              {faqItems.map((item) => (
                <div key={item.id} className="faq-item">
                  <button 
                    className="faq-question"
                    onClick={() => toggleFAQ(item.id)}
                  >
                    <span className="faq-question-text">{item.question}</span>
                    <IconComponent 
                      name="down" 
                      size={16} 
                      className={`faq-toggle-icon ${openItems.has(item.id) ? 'open' : ''}`}
                    />
                  </button>
                  
                  <div className={`faq-answer ${openItems.has(item.id) ? 'open' : ''}`}>
                    <div className="faq-answer-content">
                      {item.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Контакты поддержки */}
        {supportContacts && (
          <div className="support-contacts-section">
            <h3 className="section-title">Контакты</h3>
            <div className="support-info">
              <div className="support-info-item">
                <span className="support-info-label">Telegram:</span>
                <a 
                  href={supportContacts.telegram_url} 
                  className="support-info-value link" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {supportContacts.telegram}
                </a>
              </div>
              <div className="support-info-item">
                <span className="support-info-label">Время работы:</span>
                <span className="support-info-value">{supportContacts.working_hours}</span>
              </div>
              <div className="support-info-item">
                <span className="support-info-label">Время ответа:</span>
                <span className="support-info-value">{supportContacts.response_time}</span>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
} 