"use client";

import ActionCards from "../_components/ActionCards";
import ActionCardsV2 from "../_components/ActionCardsV2";

export default function TestActionCardsPage() {
  // Тестовые данные пользователя
  const testUser = {
    first_name: "Тест",
    last_name: "Пользователь", 
    middle_name: "",
    phone_number: "+7 (900) 123-45-67",
    address: "Москва",
    street: "Тестовая улица",
    home: "1",
    apartment: "10"
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '24px', color: '#333' }}>
        Тестирование Action Cards
      </h1>
      
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', color: '#666' }}>
          Старые Action Cards (текущие)
        </h2>
        <ActionCards 
          isAdmin={false} 
          user={testUser} 
          subscriptionsCount={3}
          ordersCount={2}
        />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', color: '#666' }}>
          Новые Action Cards V2
        </h2>
        <ActionCardsV2 
          isAdmin={false} 
          user={testUser}
          subscriptionsCount={3}
          ordersCount={2}
        />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', color: '#666' }}>
          Action Cards V2 - Loading состояние
        </h2>
        <ActionCardsV2 
          isAdmin={false} 
          user={testUser}
          subscriptionsCount={3}
          ordersCount={2}
          loading={true}
        />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', color: '#666' }}>
          Action Cards V2 - Admin версия
        </h2>
        <ActionCardsV2 
          isAdmin={true} 
          user={testUser}
          subscriptionsCount={5}
          ordersCount={10}
        />
      </div>
    </div>
  );
} 