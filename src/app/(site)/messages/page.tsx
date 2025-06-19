"use client";

import { useEffect } from 'react';
import { MessagesProvider } from '@/context/MessagesContext';
import MessagesImproved from '@/components/Messages/MessagesImproved';
import MessageNotifications from '@/components/Messages/MessageNotifications';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";


export default function MessagesPage() {
  // Set document title
  useEffect(() => {
    document.title = "Чат с клиентами | NextAdmin - Next.js Dashboard Kit";
  }, []);

  return (
    <div className="min-h-screen bg-main">
      <div className="mx-auto max-w-screen-xl xl:max-w-[90vw] 2xl:max-w-[95vw] p-4 md:p-6 2xl:p-10">
        <MessagesProvider>
          <MessagesImproved />
          <MessageNotifications />
        </MessagesProvider>
      </div>
    </div>
  );
}

