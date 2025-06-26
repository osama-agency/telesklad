"use client";

import React, { useState, useEffect } from 'react';
import { IconComponent } from '@/components/webapp/IconComponent';
import { webAppFetch } from '@/lib/utils/webapp-fetch';
import { useTelegramHaptic } from '@/hooks/useTelegramHaptic';

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

interface SupportSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'faq' | 'contact';
}

export default function SupportSheet({ isOpen, onClose, mode = 'faq' }: SupportSheetProps) {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact'>(mode);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [supportContacts, setSupportContacts] = useState<SupportContacts | null>(null);
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { impactLight, impactMedium } = useTelegramHaptic();

  useEffect(() => {
    if (isOpen && !faqItems.length) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveTab(mode);
  }, [mode]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await webAppFetch('/api/webapp/support');
      const data = await response.json();
      
      if (data.success) {
        setFaqItems(data.faq_items || []);
        setSupportContacts(data.support_contacts || null);
      } else {
        setError(data.error || 'Ошибка загрузки данных');
      }
    } catch (error) {
      console.error('Error loading support data:', error);
      setError('Не удалось загрузить данные');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFAQ = (id: number) => {
    impactLight();
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

  const handleClose = () => {
    impactLight();
    onClose();
  };

  const handleTabChange = (tab: 'faq' | 'contact') => {
    impactLight();
    setActiveTab(tab);
  };

  const handleContactClick = (url: string) => {
    impactMedium();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="sheet-backdrop"
        onClick={handleClose}
      />

      {/* Sheet */}
      <div className={`support-sheet ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sheet-header">
          <button
            onClick={handleClose}
            className="sheet-close-button"
            aria-label="Закрыть"
          >
            <IconComponent name="close" size={24} />
          </button>
          <h2 className="sheet-title">Поддержка</h2>
        </div>

        {/* Tabs */}
        <div className="support-tabs">
          <button
            className={`support-tab ${activeTab === 'faq' ? 'active' : ''}`}
            onClick={() => handleTabChange('faq')}
          >
            <IconComponent name="help-circle" size={20} />
            <span>FAQ</span>
          </button>
          <button
            className={`support-tab ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => handleTabChange('contact')}
          >
            <IconComponent name="support" size={20} />
            <span>Контакты</span>
          </button>
        </div>

        {/* Content */}
        <div className="sheet-content">
          {isLoading ? (
            <div className="support-loading">
              <div className="spinner"></div>
              <p>Загрузка...</p>
            </div>
          ) : error ? (
            <div className="support-error">
              <IconComponent name="alert-circle" size={48} />
              <p>{error}</p>
              <button onClick={loadData} className="btn btn-secondary">
                Попробовать снова
              </button>
            </div>
          ) : (
            <>
              {/* FAQ Tab */}
              {activeTab === 'faq' && (
                <div className="faq-content">
                  {faqItems.length > 0 ? (
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
                              size={20} 
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
                  ) : (
                    <div className="empty-state">
                      <IconComponent name="help-circle" size={48} />
                      <p>Нет доступных вопросов</p>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === 'contact' && supportContacts && (
                <div className="contact-content">
                  <div className="contact-card">
                    <div className="contact-icon">
                      <IconComponent name="telegram" size={32} />
                    </div>
                    <h3>Telegram поддержка</h3>
                    <button 
                      className="contact-button"
                      onClick={() => handleContactClick(supportContacts.telegram_url)}
                    >
                      {supportContacts.telegram}
                      <IconComponent name="external-link" size={16} />
                    </button>
                  </div>

                  <div className="contact-info">
                    <div className="info-item">
                      <IconComponent name="clock" size={20} />
                      <div>
                        <span className="info-label">Время работы</span>
                        <span className="info-value">{supportContacts.working_hours}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <IconComponent name="timer" size={20} />
                      <div>
                        <span className="info-label">Время ответа</span>
                        <span className="info-value">{supportContacts.response_time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
} 