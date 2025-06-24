"use client";

import { useEffect, useState } from 'react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useCart } from '@/hooks/useCart';
import Link from "next/link";
import { IconComponent } from "@/components/webapp/IconComponent";
import SkeletonLoading from "../_components/SkeletonLoading";

interface FAQItem {
  question: string;
  answer: string;
}

interface SupportContacts {
  telegram: string;
  workingHours: string;
  responseTime: string;
}

interface SupportApiResponse {
  success: boolean;
  faq: FAQItem[];
  contacts: SupportContacts | null;
  error?: string;
}

export default function SupportPage() {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [supportContacts, setSupportContacts] = useState<SupportContacts | null>(null);
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cart } = useCart();

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
          setFaqItems(data.faq);
          setSupportContacts(data.contacts);
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

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  if (isLoading) {
    return (
      <div className="webapp-container support-page">
        <SkeletonLoading type="page" />
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
    <div className={`support-page webapp-container ${cart.items.length > 0 ? 'has-cart-bar' : ''}`}>
      <div className="container-adaptive">
        <h1>Поддержка</h1>
        
        {/* Кнопка связи с поддержкой */}
        <div className="mb-6">
          <a 
            href={supportContacts?.telegram || "https://t.me/your_support_bot"}
            target="_blank"
            rel="noopener noreferrer"
            className="webapp-btn-secondary webapp-btn-big block text-center"
          >
            Задать вопрос
          </a>
        </div>

        {/* FAQ секция */}
        <div className="faq-container">
          {faqItems.map((item, index) => (
            <div key={index} className="main-block bg-white rounded-xl overflow-hidden">
              <button
                className="w-full text-left p-4 flex justify-between items-center"
                onClick={() => toggleItem(index)}
              >
                <span className="text-base font-medium">{item.question}</span>
                <span className={`transform transition-transform ${openItems.has(index) ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {openItems.has(index) && (
                <div className="p-4 pt-0 text-gray-600">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Контакты поддержки */}
        {supportContacts && (
          <div className="support-contacts">
            <h4 className="text-lg font-medium mb-4">Контакты поддержки</h4>
            <div className="support-contact-item">
              <span className="text-gray-600">Telegram:</span>
              <a href={supportContacts.telegram} className="text-green-500 ml-2">
                {supportContacts.telegram.replace('https://t.me/', '@')}
              </a>
            </div>
            <div className="support-contact-item">
              <span className="text-gray-600">Время работы:</span>
              <span className="ml-2">{supportContacts.workingHours}</span>
            </div>
            <div className="support-contact-item">
              <span className="text-gray-600">Время ответа:</span>
              <span className="ml-2">{supportContacts.responseTime}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 