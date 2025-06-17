"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EditableFieldProps {
  value: number;
  label?: string;
  prefix?: string;
  suffix?: string;
  type?: 'integer' | 'decimal';
  min?: number;
  max?: number;
  step?: number;
  onSave: (value: number) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  displayClassName?: string;
  editClassName?: string;
  placeholder?: string;
  formatDisplay?: (value: number) => string;
}

export function EditableField({
  value,
  label,
  prefix = '',
  suffix = '',
  type = 'decimal',
  min,
  max,
  step = type === 'integer' ? 1 : 0.01,
  onSave,
  isLoading = false,
  disabled = false,
  className = '',
  displayClassName = '',
  editClassName = '',
  placeholder,
  formatDisplay
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Обновляем editValue при изменении prop value
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value.toString());
    }
  }, [value, isEditing]);

  // Фокус на input при входе в режим редактирования
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (disabled || isLoading) return;
    setIsEditing(true);
    setEditValue(value.toString());
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value.toString());
  };

  const handleSave = async () => {
    const numValue = parseFloat(editValue);
    
    // Валидация
    if (isNaN(numValue)) {
      handleCancel();
      return;
    }

    if (min !== undefined && numValue < min) {
      setEditValue(min.toString());
      return;
    }

    if (max !== undefined && numValue > max) {
      setEditValue(max.toString());
      return;
    }

    // Если значение не изменилось, просто выходим из режима редактирования
    if (numValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    
    try {
      await onSave(numValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      // Возвращаем исходное значение при ошибке
      setEditValue(value.toString());
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Для целых чисел убираем десятичную точку
    if (type === 'integer') {
      inputValue = inputValue.replace(/[^\d-]/g, '');
    } else {
      // Для десятичных разрешаем только цифры, точку и минус
      inputValue = inputValue.replace(/[^\d.-]/g, '');
    }
    
    setEditValue(inputValue);
  };

  const displayValue = formatDisplay ? formatDisplay(value) : value.toLocaleString();

  if (isEditing) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`relative inline-flex items-center gap-1 ${className}`}
      >
        {prefix && <span className="text-gray-500 text-sm">{prefix}</span>}
        
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          step={step}
          min={min}
          max={max}
          placeholder={placeholder}
          disabled={isSaving}
          className={`
            w-20 px-2 py-1 text-sm border border-blue-300 dark:border-blue-600 rounded
            bg-blue-50 dark:bg-blue-900/20 text-dark dark:text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${editClassName}
          `}
        />
        
        {suffix && <span className="text-gray-500 text-sm">{suffix}</span>}
        
        {/* Кнопки сохранить/отмена */}
        <div className="flex items-center gap-1 ml-1">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors disabled:opacity-50"
            title="Сохранить"
          >
            {isSaving ? (
              <div className="w-3 h-3 border border-green-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
            title="Отмена"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={handleEdit}
      className={`
        relative inline-flex items-center gap-1 cursor-pointer group
        px-2 py-1 rounded transition-all duration-200
        hover:bg-blue-50 dark:hover:bg-blue-900/20
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      title={label ? `Кликните для редактирования ${label.toLowerCase()}` : 'Кликните для редактирования'}
    >
      {prefix && <span className="text-gray-500 text-sm">{prefix}</span>}
      
      <span className={`font-medium text-dark dark:text-white ${displayClassName}`}>
        {displayValue}
      </span>
      
      {suffix && <span className="text-gray-500 text-sm ml-1">{suffix}</span>}
      
      {/* Иконка редактирования */}
      <AnimatePresence>
        {!disabled && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="absolute -top-1 -right-1">
          <div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </motion.div>
  );
} 