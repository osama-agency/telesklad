const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Статические файлы
app.use(express.static(__dirname));

// Основной маршрут для WebApp
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Telegram WebApp Status Selector'
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Telegram WebApp сервер запущен на порту ${PORT}`);
  console.log(`📱 Доступен по адресу: http://localhost:${PORT}`);
});
