"use client";

import { useState } from 'react';
import { 
  AppRoot,
  Button,
  Card,
  Avatar,
  Badge,
  Switch,
  Progress,
  Placeholder,
  Skeleton,
  Link,
  Text,
  Title,
  Subheadline,
  Caption,
  Divider,
  List,
  Cell,
  Section
} from '@telegram-apps/telegram-ui';
import { useTelegramTheme } from '../_components/useTelegramTheme';

export default function TelegramUIDemoPage() {
  const { isDark } = useTelegramTheme();
  const [switchValue, setSwitchValue] = useState(false);
  const [progress, setProgress] = useState(65);

  return (
    <AppRoot 
      appearance={isDark ? 'dark' : 'light'}
      platform="base"
      className="min-h-screen"
    >
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level="1" className="mb-2">
            🟢 Telegram UI Demo
          </Title>
          <Text className="text-gray-600">
            Официальные компоненты Telegram в зелёном стиле
          </Text>
        </div>

        {/* Buttons Section */}
        <Section>
          <Cell>
            <Title level="2">Кнопки</Title>
          </Cell>
          <Cell>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <Button mode="filled" size="m">
                  Primary Button
                </Button>
                <Button mode="outline" size="m">
                  Outlined Button
                </Button>
                <Button mode="plain" size="m">
                  Plain Button
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button mode="filled" size="s">
                  Small
                </Button>
                <Button mode="filled" size="m">
                  Medium
                </Button>
                <Button mode="filled" size="l">
                  Large
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button mode="filled" size="m" disabled>
                  Disabled
                </Button>
                <Button mode="filled" size="m" loading>
                  Loading
                </Button>
              </div>
            </div>
          </Cell>
        </Section>

        <Divider />

        {/* Cards Section */}
        <Section>
          <Cell>
            <Title level="2">Карточки</Title>
          </Cell>
          <Cell>
            <div className="grid gap-4">
              <Card className="p-4">
                <Title level="3" className="mb-2">
                  Карточка товара
                </Title>
                <Text className="mb-3">
                  Описание товара с важной информацией для покупателя.
                </Text>
                <div className="flex items-center justify-between">
                  <Text weight="2" className="text-lg">
                    2,500₽
                  </Text>
                  <Button mode="filled" size="s">
                    В корзину
                  </Button>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar size={48} acronym="ЭГ" />
                  <div>
                    <Subheadline weight="2">Эльдар Гафаров</Subheadline>
                    <Caption className="text-gray-500">
                      Администратор
                    </Caption>
                  </div>
                </div>
                <Text>
                  Карточка пользователя с аватаром и информацией.
                </Text>
              </Card>
            </div>
          </Cell>
        </Section>

        <Divider />

        {/* Avatars & Badges */}
        <Section>
          <Cell>
            <Title level="2">Аватары и значки</Title>
          </Cell>
          <Cell>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar size={24} acronym="XS" />
                <Avatar size={28} acronym="S" />
                <Avatar size={40} acronym="M" />
                <Avatar size={48} acronym="L" />
                <Avatar size={96} acronym="XL" />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge type="number" className="bg-green-500">
                  5
                </Badge>
                <Badge type="dot" className="bg-green-500" />
                <Badge type="number" className="bg-red-500">
                  99+
                </Badge>
              </div>
            </div>
          </Cell>
        </Section>

        <Divider />

        {/* Interactive Elements */}
        <Section>
          <Cell>
            <Title level="2">Интерактивные элементы</Title>
          </Cell>
          <Cell>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Text>Уведомления</Text>
                <Switch 
                  checked={switchValue} 
                  onChange={(e) => setSwitchValue(e.target.checked)}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Text>Прогресс загрузки</Text>
                  <Caption>{progress}%</Caption>
                </div>
                <Progress value={progress} />
                <div className="flex gap-2 mt-2">
                  <Button 
                    mode="outline" 
                    size="s"
                    onClick={() => setProgress(Math.max(0, progress - 10))}
                  >
                    -10%
                  </Button>
                  <Button 
                    mode="outline" 
                    size="s"
                    onClick={() => setProgress(Math.min(100, progress + 10))}
                  >
                    +10%
                  </Button>
                </div>
              </div>
            </div>
          </Cell>
        </Section>

        <Divider />

        {/* Loading States */}
        <Section>
          <Cell>
            <Title level="2">Состояния загрузки</Title>
          </Cell>
          <Cell>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton visible className="h-4 w-full" />
                <Skeleton visible className="h-4 w-3/4" />
                <Skeleton visible className="h-4 w-1/2" />
              </div>
              
              <Placeholder
                header="Пустое состояние"
                description="Здесь пока ничего нет, но скоро появится контент"
              >
                <Button mode="filled" size="m">
                  Добавить контент
                </Button>
              </Placeholder>
            </div>
          </Cell>
        </Section>

        <Divider />

        {/* Typography */}
        <Section>
          <Cell>
            <Title level="2">Типографика</Title>
          </Cell>
          <Cell>
            <div className="space-y-3">
              <Title level="1">Заголовок H1</Title>
              <Title level="2">Заголовок H2</Title>
              <Title level="3">Заголовок H3</Title>
              <Subheadline>Подзаголовок</Subheadline>
              <Text>Основной текст для чтения и описаний</Text>
              <Caption>Подпись и дополнительная информация</Caption>
              <Link href="#">Ссылка в зелёном стиле</Link>
            </div>
          </Cell>
        </Section>

        <Divider />

        {/* List Example */}
        <Section>
          <Cell>
            <Title level="2">Списки</Title>
          </Cell>
          <List>
            <Cell 
              before={<Avatar size={40} acronym="AB" />}
              subtitle="Последняя активность: сегодня"
            >
              Abilify 15mg
            </Cell>
            <Cell 
              before={<Avatar size={40} acronym="ST" />}
              subtitle="В наличии: 25 шт"
              after={<Badge type="number" className="bg-green-500">NEW</Badge>}
            >
              Strattera 40mg
            </Cell>
            <Cell 
              before={<Avatar size={40} acronym="CO" />}
              subtitle="Скоро в продаже"
              after={<Switch checked={false} onChange={() => {}} />}
            >
              Concerta 36mg
            </Cell>
          </List>
        </Section>

        {/* Footer */}
        <div className="text-center py-8">
          <Caption className="text-gray-500">
            Powered by @telegram-apps/telegram-ui 🟢
          </Caption>
        </div>
      </div>
    </AppRoot>
  );
} 