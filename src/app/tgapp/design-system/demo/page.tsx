"use client";

import { useState } from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  Input,
  InputGroup,
  Textarea,
  Badge,
  StatusBadge,
  CountBadge,
  Avatar,
  AvatarGroup,
  getInitials,
  Loading,
  Spinner,
  Skeleton
} from '../components';
import '../tgapp-theme.css';

export default function DesignSystemDemo() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState(false);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLoadingClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

      return (
      <div className={`min-h-screen ${theme === 'dark' ? 'tg-dark' : 'tg-light'} transition-colors`}>
        <div className="min-h-screen p-6" style={{ 
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)' 
            : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-[var(--tg-text-primary)]">TgApp Design System</h1>
            <Button variant="secondary" onClick={toggleTheme}>
              {theme === 'light' ? '🌙' : '☀️'} Сменить тему
            </Button>
          </div>
          <p className="text-[var(--text-[var(--tg-text-secondary)])]">
            Демонстрация компонентов и стилей дизайн-системы
          </p>
        </div>

        {/* Buttons Section */}
        <section className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-[var(--text-[var(--tg-text-primary)])] mb-6">Кнопки</h2>
          
          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Варианты кнопок</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Button Variants */}
                <div>
                  <h3 className="text-sm font-medium text-[var(--tg-text-secondary)] mb-3">Варианты</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                  </div>
                </div>

                {/* Button Sizes */}
                <div>
                  <h3 className="text-sm font-medium text-[var(--tg-text-secondary)] mb-3">Размеры</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>

                {/* Button States */}
                <div>
                  <h3 className="text-sm font-medium text-[var(--tg-text-secondary)] mb-3">Состояния</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button disabled>Disabled</Button>
                    <Button loading={loading} onClick={handleLoadingClick}>
                      {loading ? 'Loading...' : 'Click to load'}
                    </Button>
                    <Button fullWidth>Full Width</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cards Section */}
        <section className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-[var(--tg-text-primary)] mb-6">Карточки</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Default Card */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Базовая карточка без границ и теней</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm">Подробнее</Button>
              </CardFooter>
            </Card>

            {/* Bordered Card */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Bordered Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Карточка с границей для разделения контента</p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" size="sm">Действие</Button>
              </CardFooter>
            </Card>

            {/* Elevated Card */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Приподнятая карточка с тенью</p>
              </CardContent>
              <CardFooter>
                <Button variant="primary" size="sm">Купить</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Colors Section */}
        <section className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-[var(--tg-text-primary)] mb-6">Цветовая палитра</h2>
          
          <Card variant="bordered" padding="lg">
            <CardContent>
              <div className="space-y-6">
                {/* Primary Colors */}
                <div>
                  <h3 className="text-sm font-medium text-[var(--tg-text-secondary)] mb-3">Primary Colors</h3>
                  <div className="grid grid-cols-6 gap-3">
                    {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                      <div key={shade} className="text-center">
                        <div 
                          className={`h-16 rounded-lg mb-2 bg-tg-primary-${shade}`}
                          style={{ backgroundColor: `var(--tg-color-primary-${shade})` }}
                        />
                        <span className="text-xs text-[var(--tg-text-secondary)]">{shade}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Semantic Colors */}
                <div>
                  <h3 className="text-sm font-medium text-[var(--tg-text-secondary)] mb-3">Semantic Colors</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="h-16 rounded-lg mb-2" style={{ backgroundColor: 'var(--tg-color-success)' }} />
                      <span className="text-xs text-[var(--tg-text-secondary)]">Success</span>
                    </div>
                    <div className="text-center">
                      <div className="h-16 rounded-lg mb-2" style={{ backgroundColor: 'var(--tg-color-error)' }} />
                      <span className="text-xs text-[var(--tg-text-secondary)]">Error</span>
                    </div>
                    <div className="text-center">
                      <div className="h-16 rounded-lg mb-2" style={{ backgroundColor: 'var(--tg-color-warning)' }} />
                      <span className="text-xs text-[var(--tg-text-secondary)]">Warning</span>
                    </div>
                    <div className="text-center">
                      <div className="h-16 rounded-lg mb-2" style={{ backgroundColor: 'var(--tg-color-info)' }} />
                      <span className="text-xs text-[var(--tg-text-secondary)]">Info</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Spacing Section */}
        <section className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-[var(--tg-text-primary)] mb-6">Система отступов</h2>
          
          <Card variant="bordered" padding="lg">
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map(space => (
                  <div key={space} className="flex items-center gap-4">
                    <span className="text-sm text-[var(--tg-text-secondary)] w-20">spacing-{space}</span>
                    <div 
                      className="h-8 bg-tg-primary-500 rounded"
                      style={{ width: `var(--tg-spacing-${space})` }}
                    />
                    <span className="text-xs text-[var(--tg-text-tertiary)]">{space * 4}px</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Form Elements Section */}
        <section className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-[var(--tg-text-primary)] mb-6">Элементы форм</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card variant="bordered" padding="lg">
              <CardHeader>
                <CardTitle>Поля ввода</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--tg-text-primary)] mb-1">
                    Обычный Input
                  </label>
                  <Input placeholder="Введите текст..." />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--tg-text-primary)] mb-1">
                    Email
                  </label>
                  <Input type="email" placeholder="example@mail.com" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--tg-text-primary)] mb-1">
                    С ошибкой
                  </label>
                  <Input invalid placeholder="Неверные данные" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--tg-text-primary)] mb-1">
                    Отключенный
                  </label>
                  <Input disabled placeholder="Недоступно" />
                </div>
              </CardContent>
            </Card>

            <Card variant="bordered" padding="lg">
              <CardHeader>
                <CardTitle>Textarea</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--tg-text-primary)] mb-1">
                    Комментарий
                  </label>
                  <Textarea placeholder="Напишите ваш комментарий..." rows={4} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--tg-text-primary)] mb-1">
                    Без изменения размера
                  </label>
                  <Textarea 
                    placeholder="Фиксированный размер" 
                    rows={3} 
                    resizable={false}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Badges Section */}
        <section className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-[var(--tg-text-primary)] mb-6">Значки и индикаторы</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card variant="bordered" padding="lg">
              <CardHeader>
                <CardTitle>Обычные Badge</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--tg-text-secondary)] mb-3">Варианты</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="primary">Primary</Badge>
                      <Badge variant="success">Success</Badge>
                      <Badge variant="error">Error</Badge>
                      <Badge variant="warning">Warning</Badge>
                      <Badge variant="info">Info</Badge>
                      <Badge variant="neutral">Neutral</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-[var(--tg-text-secondary)] mb-3">Размеры</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge size="sm">Small</Badge>
                      <Badge size="md">Medium</Badge>
                      <Badge size="lg">Large</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="bordered" padding="lg">
              <CardHeader>
                <CardTitle>Статусы заказов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ожидает оплаты:</span>
                    <StatusBadge status="pending" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Оплачен:</span>
                    <StatusBadge status="paid" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">В обработке:</span>
                    <StatusBadge status="processing" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Отправлен:</span>
                    <StatusBadge status="shipped" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Доставлен:</span>
                    <StatusBadge status="delivered" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Отменён:</span>
                    <StatusBadge status="cancelled" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Avatars Section */}
        <section className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-[var(--tg-text-primary)] mb-6">Аватары</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card variant="bordered" padding="lg">
              <CardHeader>
                <CardTitle>Размеры и типы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--tg-text-secondary)] mb-3">Размеры</h3>
                    <div className="flex items-center gap-3">
                      <Avatar size="xs" initials="XS" />
                      <Avatar size="sm" initials="SM" />
                      <Avatar size="md" initials="MD" />
                      <Avatar size="lg" initials="LG" />
                      <Avatar size="xl" initials="XL" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-[var(--tg-text-secondary)] mb-3">С изображением</h3>
                    <div className="flex items-center gap-3">
                      <Avatar 
                        src="https://t.me/i/userpic/320/VVk4wyYKx-bNIByg--cE_uvYSfeoVr-YwqfsaATdT_0.svg" 
                        alt="User" 
                        size="md" 
                      />
                      <Avatar initials={getInitials("Эльдар Гафаров")} size="md" />
                      <Avatar size="md" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="bordered" padding="lg">
              <CardHeader>
                <CardTitle>Группа аватаров</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--tg-text-secondary)] mb-3">Группа (max 3)</h3>
                    <AvatarGroup max={3}>
                      <Avatar initials="ЭГ" />
                      <Avatar initials="АС" />
                      <Avatar initials="МП" />
                      <Avatar initials="ДК" />
                      <Avatar initials="НВ" />
                    </AvatarGroup>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-[var(--tg-text-secondary)] mb-3">Команда проекта</h3>
                    <AvatarGroup max={4} size="lg">
                      <Avatar 
                        src="https://t.me/i/userpic/320/VVk4wyYKx-bNIByg--cE_uvYSfeoVr-YwqfsaATdT_0.svg" 
                        alt="User" 
                      />
                      <Avatar initials="АД" />
                      <Avatar initials="ПМ" />
                      <Avatar initials="УХ" />
                      <Avatar initials="ДЗ" />
                      <Avatar initials="КТ" />
                    </AvatarGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Loading States Section */}
        <section className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-[var(--tg-text-primary)] mb-6">Состояния загрузки</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card variant="bordered" padding="lg">
              <CardHeader>
                <CardTitle>Спиннеры</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--tg-text-secondary)] mb-3">Размеры</h3>
                    <div className="flex items-center gap-4">
                      <Spinner size="xs" />
                      <Spinner size="sm" />
                      <Spinner size="md" />
                      <Spinner size="lg" />
                      <Spinner size="xl" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-[var(--tg-text-secondary)] mb-3">Цвета</h3>
                    <div className="flex items-center gap-4">
                      <Spinner color="primary" />
                      <Spinner color="secondary" />
                      <div className="bg-gray-800 p-2 rounded">
                        <Spinner color="white" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="bordered" padding="lg">
              <CardHeader>
                <CardTitle>Skeleton Loading</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--tg-text-secondary)] mb-3">Элементы</h3>
                    <div className="space-y-3">
                      <Skeleton width="100%" height="20px" />
                      <Skeleton width="75%" height="16px" />
                      <div className="flex items-center gap-3">
                        <Skeleton circle width="40px" height="40px" />
                        <div className="flex-1">
                          <Skeleton width="60%" height="16px" />
                          <div className="mt-1">
                            <Skeleton width="40%" height="14px" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-[var(--tg-text-secondary)] mb-3">Множественные строки</h3>
                    <Skeleton lines={3} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Typography Section */}
        <section className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-[var(--text-[var(--tg-text-primary)])] mb-6">Типографика</h2>
          
          <Card variant="bordered" padding="lg">
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ 
                  background: theme === 'dark' 
                    ? 'rgba(22, 27, 34, 0.8)' 
                    : 'rgba(248, 250, 252, 0.8)' 
                }}>
                  <h3 className="text-3xl font-bold text-[var(--text-[var(--tg-text-primary)])] mb-2">
                    Заголовок H1
                  </h3>
                  <p className="text-xs text-[var(--text-[var(--tg-text-tertiary)])]">
                    text-3xl font-bold • Для главных заголовков страниц
                  </p>
                </div>
                
                <div className="p-4 rounded-lg" style={{ 
                  background: theme === 'dark' 
                    ? 'rgba(22, 27, 34, 0.6)' 
                    : 'rgba(248, 250, 252, 0.6)' 
                }}>
                  <h4 className="text-2xl font-semibold text-[var(--text-[var(--tg-text-primary)])] mb-2">
                    Заголовок H2
                  </h4>
                  <p className="text-xs text-[var(--text-[var(--tg-text-tertiary)])]">
                    text-2xl font-semibold • Для разделов и секций
                  </p>
                </div>
                
                <div className="p-4 rounded-lg" style={{ 
                  background: theme === 'dark' 
                    ? 'rgba(22, 27, 34, 0.4)' 
                    : 'rgba(248, 250, 252, 0.4)' 
                }}>
                  <h5 className="text-xl font-medium text-[var(--text-[var(--tg-text-primary)])] mb-2">
                    Заголовок H3
                  </h5>
                  <p className="text-xs text-[var(--text-[var(--tg-text-tertiary)])]">
                    text-xl font-medium • Для подразделов
                  </p>
                </div>
              </div>
              
              <div className="border-t border-[var(--tg-border-primary)] pt-4 space-y-3">
                <div>
                  <p className="text-base text-[var(--text-[var(--tg-text-primary)])] mb-1">
                    Основной текст для чтения
                  </p>
                  <p className="text-xs text-[var(--text-[var(--tg-text-tertiary)])]">
                    text-base • Основной контент, статьи, описания
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-[var(--text-[var(--tg-text-secondary)])] mb-1">
                    Вторичный текст для дополнительной информации
                  </p>
                  <p className="text-xs text-[var(--text-[var(--tg-text-tertiary)])]">
                    text-sm • Подписи, метаданные, вспомогательная информация
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-[var(--text-[var(--tg-text-tertiary)])] mb-1">
                    Мелкий текст для подписей и примечаний
                  </p>
                  <p className="text-xs text-[var(--text-[var(--tg-text-tertiary)])]">
                    text-xs • Копирайты, технические детали, timestamps
                  </p>
                </div>
              </div>
              
              <div className="border-t border-[var(--tg-border-primary)] pt-4">
                <h4 className="text-lg font-medium text-[var(--text-[var(--tg-text-primary)])] mb-3">
                  Цветовая схема текста
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg border border-[var(--tg-border-primary)]">
                    <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ 
                      background: 'var(--text-[var(--tg-text-primary)])' 
                    }}></div>
                    <p className="text-sm font-medium text-[var(--text-[var(--tg-text-primary)])]">Primary</p>
                    <p className="text-xs text-[var(--text-[var(--tg-text-tertiary)])]">Основной текст</p>
                  </div>
                  <div className="text-center p-3 rounded-lg border border-[var(--tg-border-primary)]">
                    <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ 
                      background: 'var(--text-[var(--tg-text-secondary)])' 
                    }}></div>
                    <p className="text-sm font-medium text-[var(--text-[var(--tg-text-primary)])]">Secondary</p>
                    <p className="text-xs text-[var(--text-[var(--tg-text-tertiary)])]">Вторичный текст</p>
                  </div>
                  <div className="text-center p-3 rounded-lg border border-[var(--tg-border-primary)]">
                    <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ 
                      background: 'var(--text-[var(--tg-text-tertiary)])' 
                    }}></div>
                    <p className="text-sm font-medium text-[var(--text-[var(--tg-text-primary)])]">Tertiary</p>
                    <p className="text-xs text-[var(--text-[var(--tg-text-tertiary)])]">Подписи</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
} 