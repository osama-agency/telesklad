'use client';

import Link from 'next/link';
import { Button } from '@/components/catalyst/button';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface EmptyCartProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}

export default function EmptyCart({
  title = "Ваша корзина пуста",
  description = "Добавьте товары в корзину, чтобы оформить заказ",
  actionText = "Продолжить покупки",
  actionHref = "/webapp"
}: EmptyCartProps) {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="text-center">
          {/* Empty Cart Icon */}
          <div className="mx-auto h-24 w-24 rounded-full bg-green-50 flex items-center justify-center mb-8">
            <ShoppingCartIcon className="h-12 w-12 text-green-500" />
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          
          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            {description}
          </p>
          
          {/* Action Button */}
          <Link href={actionHref}>
            <Button className="bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 px-8 py-3 text-base font-medium">
              {actionText}
            </Button>
          </Link>
          
          {/* Additional Info */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0zM19.5 18.75a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900">Быстрая доставка</h3>
              <p className="text-sm text-gray-500">По Москве в день заказа</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900">Гарантия качества</h3>
              <p className="text-sm text-gray-500">Только оригинальные препараты</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25c0-1.372-.465-2.637-1.244-3.626.28-.665.444-1.395.444-2.124 0-2.951-2.299-5.364-5.25-5.364-1.836 0-3.462.92-4.435 2.319C9.578 9.482 8.5 8.25 7.125 8.25a2.625 2.625 0 00-2.625 2.625c0 .414.336.75.75.75s.75-.336.75-.75a1.125 1.125 0 011.125-1.125c.621 0 1.125.504 1.125 1.125v.75c0 .414.336.75.75.75s.75-.336.75-.75V9a.75.75 0 01.75-.75 4.5 4.5 0 014.5 4.5c0 .729-.195 1.412-.535 2.002-.34.59-.535 1.273-.535 2.002 0 .414.336.75.75.75s.75-.336.75-.75c0-.729.195-1.412.535-2.002.34-.59.535-1.273.535-2.002a6 6 0 00-6-6V9a2.25 2.25 0 00-2.25-2.25z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900">Поддержка 24/7</h3>
              <p className="text-sm text-gray-500">Консультации специалистов</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 