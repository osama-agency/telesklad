"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { webAppFetch } from "@/lib/utils/webapp-fetch";
import { Package, Clock, ChevronRight, ShoppingBag, Copy, ExternalLink, Star } from "lucide-react";
import { useBackButton } from "../../_components/useBackButton";
import Image from "next/image";
import "./orders.css";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
  image_url?: string;
}

interface Order {
  id: number;
  total_amount: number;
  status: "unpaid" | "paid" | "shipped" | "delivered" | "cancelled" | "processing";
  created_at: string;
  paid_at?: string;
  shipped_at?: string;
  tracking_number?: string;
  bonus: number;
  items: OrderItem[];
  total_items: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useTelegramAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedTrack, setCopiedTrack] = useState<string | null>(null);
  
  // Показываем кнопку "Назад" в Telegram
  useBackButton(true);

  const loadOrders = useCallback(async () => {
    if (!user?.tg_id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await webAppFetch("/api/webapp/orders");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка загрузки заказов");
      }
      
      const data = await response.json();
      
      if (data.success && data.orders) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Ошибка загрузки заказов:", err);
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  }, [user?.tg_id]);

  useEffect(() => {
    if (isAuthenticated && user?.tg_id) {
      loadOrders();
    } else if (!isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, user?.tg_id, loadOrders]);

  const formatPrice = (val: number) =>
    new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(val);

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(d));

  const statusMap = {
    unpaid: { label: "Ожидает оплаты", color: "#D97706", bgColor: "#FEF3C7" },
    paid: { label: "Проверка оплаты", color: "#2563EB", bgColor: "#DBEAFE" },
    processing: { label: "Обрабатывается", color: "#7C3AED", bgColor: "#EDE9FE" },
    shipped: { label: "Отправлен", color: "#059669", bgColor: "#D1FAE5" },
    delivered: { label: "Доставлен", color: "#059669", bgColor: "#D1FAE5" },
    cancelled: { label: "Отменён", color: "#DC2626", bgColor: "#FEE2E2" },
  } as const;
  
  const handleCopyTrack = useCallback((trackNumber: string) => {
    const pure = trackNumber.startsWith("http")
      ? trackNumber.replace(/.*#/g, "")
      : trackNumber.replace("@", "");
    
    navigator.clipboard.writeText(pure).then(() => {
      setCopiedTrack(trackNumber);
      setTimeout(() => setCopiedTrack(null), 2000);
      
      // Виброотклик Telegram
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    }).catch(err => {
      console.error('Ошибка копирования:', err);
    });
  }, []);
  
  const openTrackingUrl = useCallback((trackingNumber: string) => {
    let trackingUrl = '';
    if (trackingNumber.startsWith('@')) {
      trackingUrl = trackingNumber.substring(1);
    } else if (trackingNumber.startsWith('http')) {
      trackingUrl = trackingNumber;
    } else {
      trackingUrl = `https://www.pochta.ru/tracking#${trackingNumber}`;
    }
    window.open(trackingUrl, '_blank');
  }, []);

  if (loading) {
    return (
      <div className="tgapp-orders-loading">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="tgapp-order-skeleton">
            <div className="tgapp-skeleton-line short" />
            <div className="tgapp-skeleton-line medium" />
            <div className="tgapp-skeleton-line long" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="tgapp-error">
        <div className="tgapp-error-title">Ошибка загрузки</div>
        <div className="tgapp-error-message">{error}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="tgapp-profile">
        <div className="tgapp-profile-header">
          <h1 className="tgapp-profile-greeting">История заказов</h1>
        </div>
        <div className="tgapp-empty-state">
          <ShoppingBag className="tgapp-empty-state-icon" size={64} />
          <div className="tgapp-empty-title">Войдите в аккаунт</div>
          <div className="tgapp-empty-message">Чтобы увидеть историю заказов</div>
        </div>
      </div>
    );
  }
  
  if (orders.length === 0) {
    return (
      <div className="tgapp-profile">
        <div className="tgapp-profile-header">
          <h1 className="tgapp-profile-greeting">История заказов</h1>
        </div>
        <div className="tgapp-empty-state">
          <ShoppingBag className="tgapp-empty-state-icon" size={64} />
          <div className="tgapp-empty-title">Нет заказов</div>
          <div className="tgapp-empty-message">Когда вы сделаете первый заказ, он отобразится здесь</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tgapp-profile">
      <div className="tgapp-profile-header">
        <h1 className="tgapp-profile-greeting">История заказов</h1>
      </div>
      
      <div className="tgapp-orders-list">
        {orders.map((order) => {
          const status = statusMap[order.status];
          return (
            <div key={order.id} className="tgapp-order-card">
              {/* Header */}
              <div className="tgapp-order-header">
                <div>
                  <div className="tgapp-order-label">Заказ</div>
                  <div className="tgapp-order-number">#{order.id}</div>
                </div>
                <div className="tgapp-order-date">{formatDate(order.created_at)}</div>
              </div>

              {/* Summary */}
              <div className="tgapp-order-summary">
                <div>
                  <div className="tgapp-order-amount">{formatPrice(order.total_amount)}</div>
                  <div className="tgapp-order-items-count">
                    {order.total_items} {order.total_items === 1 ? "товар" : order.total_items < 5 ? "товара" : "товаров"}
                  </div>
                </div>
                <span 
                  className="tgapp-order-status-badge"
                  style={{ 
                    color: status.color,
                    backgroundColor: status.bgColor
                  }}
                >
                  {status.label}
                </span>
              </div>

              {/* Items */}
              {order.items.length > 0 && (
                <div className="tgapp-order-items">
                  <div className="tgapp-order-items-header">Товары в заказе:</div>
                  <div className="tgapp-order-items-list">
                    {order.items.map((item) => (
                      <div key={item.id} className="tgapp-order-item-row">
                        <div className="tgapp-order-item-image">
                          {item.image_url ? (
                            <Image 
                              src={item.image_url} 
                              alt={item.product_name} 
                              fill 
                              className="object-cover" 
                              sizes="40px" 
                            />
                          ) : (
                            <div className="tgapp-order-item-no-image">
                              <Package size={16} />
                            </div>
                          )}
                        </div>
                        <div className="tgapp-order-item-info">
                          <div className="tgapp-order-item-name">{item.product_name}</div>
                          <div className="tgapp-order-item-quantity">×{item.quantity}</div>
                        </div>
                        <div className="tgapp-order-item-price">{formatPrice(item.total)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="tgapp-order-details">
                {order.tracking_number && (
                  <div className="tgapp-tracking-section">
                    <div className="tgapp-detail-row">
                      <Package size={16} className="tgapp-detail-icon" />
                      <span className="tgapp-detail-label">Трек-номер:</span>
                      <button
                        className="tgapp-tracking-number"
                        onClick={() => handleCopyTrack(order.tracking_number!)}
                      >
                        {order.tracking_number.startsWith("http")
                          ? order.tracking_number.replace(/.*#/g, "")
                          : order.tracking_number.replace("@", "")}
                        <Copy size={12} className="tgapp-copy-icon" />
                      </button>
                    </div>
                    {copiedTrack === order.tracking_number && (
                      <div className="tgapp-copy-tooltip">Скопировано!</div>
                    )}
                    <button 
                      onClick={() => openTrackingUrl(order.tracking_number!)}
                      className="tgapp-track-button"
                    >
                      <ExternalLink size={16} />
                      Отследить посылку
                    </button>
                  </div>
                )}
                
                {order.paid_at && (
                  <div className="tgapp-detail-row">
                    <Clock size={14} className="tgapp-detail-icon" />
                    <span className="tgapp-detail-label">Проверка оплаты:</span>
                    <span className="tgapp-detail-value">{formatDate(order.paid_at)}</span>
                  </div>
                )}
                
                {order.shipped_at && (
                  <div className="tgapp-detail-row">
                    <ChevronRight size={14} className="tgapp-detail-icon" />
                    <span className="tgapp-detail-label">Отправлен:</span>
                    <span className="tgapp-detail-value">{formatDate(order.shipped_at)}</span>
                  </div>
                )}
                
                {order.bonus > 0 && (
                  <div className="tgapp-detail-row tgapp-bonus-row">
                    <Star size={14} className="tgapp-detail-icon" style={{ color: '#D97706' }} />
                    <span className="tgapp-detail-label">Бонусы:</span>
                    <span className="tgapp-bonus-value">+{order.bonus}₽</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}