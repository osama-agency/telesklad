import * as Icons from "../icons";
import { UI_ELEMENTS } from "./ui-elements-list";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "eCommerce",
            url: "/",
          },
          {
            title: "Analytics",
            url: "/analytics",
            isPro: true,
          },
          {
            title: "Marketing",
            url: "/marketing",
            isPro: true,
          },
          {
            title: "CRM",
            url: "/crm",
            isPro: true,
          },
          {
            title: "Stocks",
            url: "/stocks",
            isPro: true,
          },
        ],
      },
      {
        title: "Calendar",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Profile",
        url: "/profile",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Tasks",
        icon: Icons.CheckList,
        items: [
          {
            title: "List",
            url: "/tasks/task-list",
            isPro: true,
          },
          {
            title: "Kanban",
            url: "/tasks/task-kanban",
            isPro: true,
          },
        ],
      },
      {
        title: "Forms",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Form Elements",
            url: "/forms/form-elements",
          },
          {
            title: "Pro Form Elements",
            url: "/forms/pro-form-elements",
            isPro: true,
          },
          {
            title: "Form Layout",
            url: "/forms/form-layout",
          },
          {
            title: "Pro Form Layout",
            url: "/forms/pro-form-layout",
            isPro: true,
          },
        ],
      },
      {
        title: "Tables",
        url: "/tables",
        icon: Icons.Table,
        items: [
          {
            title: "Tables",
            url: "/tables",
          },
          {
            title: "Pro Tables",
            url: "/tables/pro-tables",
            isPro: true,
          },
          {
            title: "Data Tables",
            url: "/pages/data-tables",
            isPro: true,
          },
        ],
      },
      {
        title: "Pages",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Settings",
            url: "/pages/settings",
          },
          {
            title: "File Manager",
            url: "/pages/file-manager",
            isPro: true,
          },
          {
            title: "Pricing Tables",
            url: "/pages/pricing-tables",
            isPro: true,
          },
          {
            title: "Error Page",
            url: "/pages/error-page",
            isPro: true,
          },
          {
            title: "Teams",
            url: "/pages/team",
            isPro: true,
          },
          {
            title: "Terms & Conditions",
            url: "/pages/terms-conditions",
            isPro: true,
          },
          {
            title: "Mail Success",
            url: "/pages/mail-success",
            isPro: true,
          },
        ],
      },
    ],
  },
  {
    label: "SUPPORT",
    items: [
      {
        title: "Messages",
        icon: Icons.Chat,
        badge: 9,
        items: [],
        isPro: true,
      },
      {
        title: "Inbox",
        icon: Icons.Inbox,
        items: [],
        isPro: true,
      },
      {
        title: "Invoice",
        icon: Icons.Printer,
        items: [],
        isPro: true,
      },
    ],
  },
  {
    label: "OTHERS",
    items: [
      {
        title: "Charts",
        icon: Icons.PieChart,
        items: [
          {
            title: "Basic Chart",
            url: "/charts/basic-chart",
          },
          {
            title: "Advanced Chart",
            url: "/charts/advanced-chart",
            isPro: true,
          },
        ],
      },
      {
        title: "UI Elements",
        icon: Icons.FourCircle,
        items: UI_ELEMENTS,
      },
      {
        title: "Authentication",
        icon: Icons.Authentication,
        items: [
          {
            title: "Sign In",
            url: "/auth/signin",
          },
          {
            title: "Sign Up",
            url: "/auth/signup",
            isPro: true,
          },
          {
            title: "Reset Password",
            url: "/auth/forgot-password",
            isPro: true,
          },
          {
            title: "Coming Soon",
            url: "/auth/coming-soon",
            isPro: true,
          },
          {
            title: "2 Step Verification",
            url: "/auth/two-step-verification",
            isPro: true,
          },
          {
            title: "Under Maintenance",
            url: "/auth/under-maintenance",
            isPro: true,
          },
        ],
      },
    ],
  },
];
