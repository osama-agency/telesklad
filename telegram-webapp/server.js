const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Статические файлы
app.use(express.static(__dirname));

// Маршруты для WebApp
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/edit-order.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'edit-order.html'));
});

// Для тестирования - простой API endpoint
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Telegram WebApp server is running',
    timestamp: new Date().toISOString()
  });
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
  console.log(`🚀 Telegram WebApp server running on http://localhost:${PORT}`);
  console.log(`📱 Status WebApp: http://localhost:${PORT}/`);
  console.log(`✏️ Edit WebApp: http://localhost:${PORT}/edit-order.html`);
});
