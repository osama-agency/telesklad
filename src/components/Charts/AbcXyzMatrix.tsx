"use client";

import React, { useState } from 'react';
import { Treemap, ResponsiveContainer, Cell } from 'recharts';

interface AbcXyzMatrixProps {
  data: {
    AX: number;
    AY: number;
    AZ: number;
    BX: number;
    BY: number;
    BZ: number;
    CX: number;
    CY: number;
    CZ: number;
  };
  matrixWithProducts?: {
    AX: { count: number; products: string[] };
    AY: { count: number; products: string[] };
    AZ: { count: number; products: string[] };
    BX: { count: number; products: string[] };
    BY: { count: number; products: string[] };
    BZ: { count: number; products: string[] };
    CX: { count: number; products: string[] };
    CY: { count: number; products: string[] };
    CZ: { count: number; products: string[] };
  };
  className?: string;
}

interface TreeMapData {
  name: string;
  size: number;
  color: string;
  description: string;
}

export function AbcXyzMatrix({ data, matrixWithProducts, className = "" }: AbcXyzMatrixProps) {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string[];
    title: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: [],
    title: ''
  });

  // Преобразуем данные для Treemap
  const treeMapData: TreeMapData[] = [
    {
      name: 'AX',
      size: Math.max(data.AX, 1), // минимум 1 для отображения
      color: '#10B981', // зеленый - лучшая категория
      description: 'Высокая выручка, стабильный спрос'
    },
    {
      name: 'AY',
      size: Math.max(data.AY, 1),
      color: '#F59E0B', // желтый
      description: 'Высокая выручка, умеренная стабильность'
    },
    {
      name: 'AZ',
      size: Math.max(data.AZ, 1),
      color: '#EF4444', // красный
      description: 'Высокая выручка, нестабильный спрос'
    },
    {
      name: 'BX',
      size: Math.max(data.BX, 1),
      color: '#06B6D4', // голубой
      description: 'Средняя выручка, стабильный спрос'
    },
    {
      name: 'BY',
      size: Math.max(data.BY, 1),
      color: '#8B5CF6', // фиолетовый
      description: 'Средняя выручка, умеренная стабильность'
    },
    {
      name: 'BZ',
      size: Math.max(data.BZ, 1),
      color: '#F97316', // оранжевый
      description: 'Средняя выручка, нестабильный спрос'
    },
    {
      name: 'CX',
      size: Math.max(data.CX, 1),
      color: '#84CC16', // лайм
      description: 'Низкая выручка, стабильный спрос'
    },
    {
      name: 'CY',
      size: Math.max(data.CY, 1),
      color: '#EC4899', // розовый
      description: 'Низкая выручка, умеренная стабильность'
    },
    {
      name: 'CZ',
      size: Math.max(data.CZ, 1),
      color: '#6B7280', // серый - худшая категория
      description: 'Низкая выручка, нестабильный спрос'
    }
  ];

  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, size } = props;
    
    if (depth !== 1) return null;
    
    const item = treeMapData[index];
    const actualValue = Object.values(data)[index];
    
    const handleMouseEnter = (event: React.MouseEvent) => {
      if (matrixWithProducts) {
        const key = name as keyof typeof matrixWithProducts;
        const products = matrixWithProducts[key]?.products || [];
        
        setTooltip({
          visible: true,
          x: event.clientX + 10,
          y: event.clientY - 10,
          content: products,
          title: `${name} (${actualValue} товар${actualValue === 1 ? '' : actualValue < 5 ? 'а' : 'ов'})`
        });
      }
    };

    const handleMouseLeave = () => {
      setTooltip(prev => ({ ...prev, visible: false }));
    };

    const handleMouseMove = (event: React.MouseEvent) => {
      setTooltip(prev => ({
        ...prev,
        x: event.clientX + 10,
        y: event.clientY - 10
      }));
    };
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: item.color,
            stroke: '#fff',
            strokeWidth: 2,
            strokeOpacity: 1,
            cursor: matrixWithProducts ? 'pointer' : 'default'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        />
        {width > 60 && height > 40 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 10}
              textAnchor="middle"
              fill="#fff"
              fontSize="14"
              fontWeight="bold"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)', pointerEvents: 'none' }}
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 8}
              textAnchor="middle"
              fill="#fff"
              fontSize="12"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)', pointerEvents: 'none' }}
            >
              {actualValue} товар{actualValue === 1 ? '' : actualValue < 5 ? 'а' : 'ов'}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-dark rounded-lg p-6 shadow-sm border border-stroke dark:border-dark-3 ${className}`}>
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-dark dark:text-white mb-2">
          ABC/XYZ Матрица
        </h3>
        <p className="text-sm text-dark-6">
          Анализ товаров по выручке (ABC) и стабильности спроса (XYZ)
        </p>
      </div>

      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treeMapData}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="#fff"
            content={<CustomizedContent />}
          />
        </ResponsiveContainer>
      </div>

      {/* Легенда */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="font-semibold text-dark dark:text-white mb-1">ABC (Выручка)</div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-dark-6">A - Высокая (80%)</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <div className="w-3 h-3 bg-cyan-500 rounded"></div>
              <span className="text-dark-6">B - Средняя (15%)</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <div className="w-3 h-3 bg-lime-500 rounded"></div>
              <span className="text-dark-6">C - Низкая (5%)</span>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="font-semibold text-dark dark:text-white mb-1">XYZ (Стабильность)</div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-dark-6">X - Стабильный</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-dark-6">Y - Умеренный</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-dark-6">Z - Нестабильный</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="font-semibold text-dark dark:text-white mb-1">Рекомендации</div>
          <div className="space-y-1 text-dark-6">
            <div>AX - Приоритет №1</div>
            <div>AY, BX - Важные</div>
            <div>CZ - Пересмотреть</div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && tooltip.content.length > 0 && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-dark rounded-lg shadow-lg border border-stroke dark:border-dark-3 p-3 max-w-xs"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            pointerEvents: 'none'
          }}
        >
          <div className="font-semibold text-dark dark:text-white mb-2">
            {tooltip.title}
          </div>
          <div className="text-sm text-dark-6 max-h-32 overflow-y-auto">
            {tooltip.content.slice(0, 10).map((product, index) => (
              <div key={index} className="mb-1">
                • {product}
              </div>
            ))}
            {tooltip.content.length > 10 && (
              <div className="text-xs text-dark-6 mt-2 italic">
                И ещё {tooltip.content.length - 10} товар{tooltip.content.length - 10 === 1 ? '' : tooltip.content.length - 10 < 5 ? 'а' : 'ов'}...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 