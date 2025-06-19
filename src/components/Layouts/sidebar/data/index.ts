import * as Icons from "../icons";
import { UI_ELEMENTS } from "./ui-elements-list";

export const NAV_DATA = [
  {
    label: "ГЛАВНАЯ",
    items: [
      {
        title: "Дашборд",
        url: "/",
        icon: Icons.HomeIcon,
        items: [],
      },
    ],
  },
  {
    label: "АНАЛИТИКА",
    items: [
      {
                  title: "Товары",
        url: "/products",
        icon: Icons.PieChart,
        items: [],
      },
      {
        title: "Закупки",
        url: "/purchases-analytics",
        icon: Icons.PurchaseIcon,
        items: [],
      },
      {
        title: "Заказы",
        url: "/orders-analytics",
        icon: Icons.OrderIcon,
        items: [],
      },
      {
        title: "Расходы",
        url: "/expenses-analytics",
        icon: Icons.ExpenseIcon,
        items: [],
      },
    ],
  },
  {
    label: "УПРАВЛЕНИЕ",
    items: [
      {
        title: "Товары",
        url: "/products",
        icon: Icons.ProductIcon,
        items: [],
      },
      {
        title: "Заказы",
        url: "/orders",
        icon: Icons.OrderIcon,
        items: [],
      },
      {
        title: "Закупки",
        url: "/purchases",
        icon: Icons.PurchaseIcon,
        items: [],
      },
      {
        title: "Склад",
        url: "/stocks",
        icon: Icons.ProductIcon,
        items: [],
      },
      {
        title: "Расходы",
        url: "/expenses",
        icon: Icons.ExpenseIcon,
        items: [],
      },
    ],
  },
  {
    label: "КОММУНИКАЦИИ",
    items: [
      {
        title: "Сообщения",
        url: "/messages",
        icon: Icons.MessageIcon,
        items: [],
      },
      {
        title: "Входящие",
        url: "/inbox",
        icon: Icons.Inbox,
        items: [],
      },
      {
        title: "CRM",
        url: "/crm",
        icon: Icons.User,
        items: [],
      },
    ],
  },
  {
    label: "ИНСТРУМЕНТЫ",
    items: [
      {
        title: "Календарь",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Задачи",
        url: "/tasks",
        icon: Icons.CheckList,
        items: [],
      },
      {
        title: "Таблицы",
        url: "/tables",
        icon: Icons.Table,
        items: [
          {
            title: "Таблица данных",
            url: "/tables/data-tables",
          },
          {
            title: "Базовые таблицы",
            url: "/tables/basic-tables",
          },
        ],
      },
      {
        title: "Графики",
        url: "/charts",
        icon: Icons.PieChart,
        items: [
          {
            title: "Базовые графики",
            url: "/charts/basic-chart",
          },
          {
            title: "Продвинутые",
            url: "/charts/advanced-chart",
          },
        ],
      },
      {
        title: "Формы",
        url: "/forms",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Элементы форм",
            url: "/forms/form-elements",
          },
          {
            title: "Макет форм",
            url: "/forms/form-layout",
          },
          {
            title: "Pro формы",
            url: "/forms/pro-form-elements",
          },
          {
            title: "Pro макет",
            url: "/forms/pro-form-layout",
          },
        ],
      },
    ],
  },
  {
    label: "UI ЭЛЕМЕНТЫ",
    items: [
      {
        title: "UI Элементы",
        url: "/ui-elements",
        icon: Icons.FourCircle,
        items: UI_ELEMENTS,
      },
    ],
  },
  {
    label: "СТРАНИЦЫ",
    items: [
      {
        title: "Настройки",
        url: "/pages/settings",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Профиль",
        url: "/pages/profile",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Счета",
        url: "/invoice",
        icon: Icons.Printer,
        items: [],
      },
      {
        title: "Авторизация",
        url: "/auth",
        icon: Icons.Authentication,
        items: [
          {
            title: "Вход",
            url: "/auth/signin",
          },
          {
            title: "Регистрация",
            url: "/auth/signup",
          },
          {
            title: "Забыли пароль",
            url: "/auth/forgot-password",
          },
          {
            title: "Сброс пароля",
            url: "/auth/reset-password",
          },
        ],
      },
    ],
  },
];
