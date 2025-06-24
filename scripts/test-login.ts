import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log('🔐 Тестирование входа в систему...');
    
    // 1. Получаем CSRF токен
    console.log('1. Получение CSRF токена...');
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await csrfResponse.json() as any;
    console.log('CSRF токен:', csrfData.csrfToken);

    // 2. Пытаемся войти
    console.log('2. Попытка входа...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        csrfToken: csrfData.csrfToken,
        email: 'go@osama.agency',
        password: 'admin123',
        callbackUrl: 'http://localhost:3000/pages/settings'
      }),
      redirect: 'manual'
    });

    console.log('Статус ответа:', loginResponse.status);
    console.log('Заголовки:', Object.fromEntries(loginResponse.headers.entries()));
    
    if (loginResponse.status === 302) {
      const location = loginResponse.headers.get('location');
      console.log('✅ Перенаправление на:', location);
      
      if (location?.includes('/pages/settings')) {
        console.log('✅ Успешный вход в систему!');
      } else if (location?.includes('/login')) {
        console.log('❌ Ошибка входа - перенаправление обратно на логин');
      }
    } else {
      const text = await loginResponse.text();
      console.log('Ответ:', text.substring(0, 500));
    }

    // 3. Проверяем сессию
    console.log('3. Проверка сессии...');
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session', {
      headers: {
        'Cookie': loginResponse.headers.get('set-cookie') || ''
      }
    });
    const sessionData = await sessionResponse.json();
    console.log('Данные сессии:', sessionData);

  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

testLogin(); 