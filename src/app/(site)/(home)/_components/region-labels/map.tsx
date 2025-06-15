"use client";

import React from "react";

const Map: React.FC = () => {
  return (
    <div className="h-[422px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="text-center p-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-blue-600 dark:text-blue-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Карта регионов
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Интерактивная карта с региональными данными
        </p>
      </div>
    </div>
  );
};

export default Map;
