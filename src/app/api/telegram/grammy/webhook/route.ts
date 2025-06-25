import { NextRequest, NextResponse } from 'next/server';
import { GrammyBotWorker } from '@/lib/services/grammy/GrammyBotWorker';
import { logger } from '@/lib/logger';

/**
 * Grammy Webhook endpoint - современная замена старого webhook'а
 * 
 * Особенности:
 * - Полная типобезопасность через grammY
 * - Автоматическая обработка ошибок
 * - Встроенные метрики производительности
 * - Безопасная валидация входящих данных
 * - Логирование всех операций
 */

let grammyWorker: GrammyBotWorker | null = null;

/**
 * Инициализация Grammy worker'а (lazy loading)
 */
async function initializeGrammyWorker(): Promise<GrammyBotWorker> {
  if (!grammyWorker) {
    grammyWorker = GrammyBotWorker.getInstance();
    
    if (!grammyWorker.isReady()) {
      logger.info('🚀 Initializing GrammyBotWorker for webhook...', undefined, 'Grammy');
      await grammyWorker.initialize();
      logger.info('✅ GrammyBotWorker initialized successfully', undefined, 'Grammy');
    }
  }
  
  return grammyWorker;
}

/**
 * POST handler - основной webhook endpoint
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = performance.now();
  
  try {
    logger.info('📨 Grammy webhook received', {
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      contentType: request.headers.get('content-type')
    }, 'Grammy');

    // Проверяем наличие тела запроса
    const contentLength = request.headers.get('content-length');
    if (!contentLength || parseInt(contentLength) === 0) {
      logger.warn('⚠️ Empty webhook request body', undefined, 'Grammy');
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
    }

    // Инициализируем worker
    const worker = await initializeGrammyWorker();

    // Получаем тело запроса как текст
    const requestBody = await request.text();
    
    // Парсим JSON
    let update;
    try {
      update = JSON.parse(requestBody);
    } catch (parseError) {
      logger.error('❌ Failed to parse webhook JSON', { error: parseError.message }, 'Grammy');
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Обрабатываем update через Grammy worker
    await worker.handleUpdate(update);

    const duration = performance.now() - startTime;
    
    logger.info('✅ Grammy webhook processed successfully', {
      duration: Math.round(duration),
      updateType: Object.keys(update).filter(key => key !== 'update_id')[0]
    }, 'Grammy');

    // Telegram ожидает статус 200 для успешной обработки
    return NextResponse.json({ ok: true }, { status: 200 });

  } catch (error) {
    const duration = performance.now() - startTime;
    
    logger.error('❌ Grammy webhook error', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      duration: Math.round(duration),
      url: request.url
    }, 'Grammy');

    // Логируем тело запроса для отладки (только в development)
    if (process.env.NODE_ENV === 'development') {
      try {
        const body = await request.clone().text();
        logger.debug('📝 Request body for debugging', { body: body.substring(0, 1000) }, 'Grammy');
      } catch (bodyError) {
        logger.debug('⚠️ Could not read request body for debugging', { error: (bodyError as Error).message }, 'Grammy');
      }
    }

    // Отправляем ошибку в формате, ожидаемом Telegram
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

/**
 * GET handler - информация о webhook'е и статус
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    // Инициализируем worker
    const worker = await initializeGrammyWorker();

    switch (action) {
      case 'status':
        return await getWebhookStatus(worker);
      
      case 'info':
        return await getWebhookInfo(worker);
      
      case 'metrics':
        return await getWebhookMetrics(worker);
      
      case 'health':
        return await getHealthCheck(worker);
      
      default:
        return NextResponse.json({
          message: 'Grammy Webhook Endpoint',
          available_actions: ['status', 'info', 'metrics', 'health'],
          usage: '/api/telegram/grammy/webhook?action=status',
          timestamp: new Date().toISOString(),
          version: 'grammY v1.0.0'
        });
    }

  } catch (error) {
    logger.error('❌ Grammy webhook GET error', { error: error.message }, 'Grammy');
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        message: error.message,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

/**
 * Получение статуса webhook'а
 */
async function getWebhookStatus(worker: GrammyBotWorker): Promise<NextResponse> {
  try {
    const webhookInfo = await worker.getWebhookInfo();
    const botInfo = await worker.getBotInfo();
    
    return NextResponse.json({
      status: 'active',
      bot: {
        id: botInfo.id,
        username: botInfo.username,
        first_name: botInfo.first_name,
        can_join_groups: botInfo.can_join_groups,
        can_read_all_group_messages: botInfo.can_read_all_group_messages,
        supports_inline_queries: botInfo.supports_inline_queries
      },
      webhook: {
        url: webhookInfo.url,
        has_custom_certificate: webhookInfo.has_custom_certificate,
        pending_update_count: webhookInfo.pending_update_count,
        max_connections: webhookInfo.max_connections,
        allowed_updates: webhookInfo.allowed_updates
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Получение детальной информации о webhook'е
 */
async function getWebhookInfo(worker: GrammyBotWorker): Promise<NextResponse> {
  try {
    const webhookInfo = await worker.getWebhookInfo();
    const metrics = worker.getMetrics();
    const settings = worker.getSettings();
    
    return NextResponse.json({
      webhook_info: webhookInfo,
      metrics: metrics,
      settings: {
        admin_chat_id: settings.admin_chat_id,
        courier_tg_id: settings.courier_tg_id,
        bot_btn_title: settings.bot_btn_title,
        group_btn_title: settings.group_btn_title
      },
      system: {
        node_env: process.env.NODE_ENV,
        grammy_ready: worker.isReady(),
        uptime: process.uptime(),
        memory_usage: process.memoryUsage()
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Получение метрик производительности
 */
async function getWebhookMetrics(worker: GrammyBotWorker): Promise<NextResponse> {
  const metrics = worker.getMetrics();
  
  return NextResponse.json({
    performance_metrics: metrics,
    system_metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu_usage: process.cpuUsage()
    },
    timestamp: new Date().toISOString()
  });
}

/**
 * Health check endpoint
 */
async function getHealthCheck(worker: GrammyBotWorker): Promise<NextResponse> {
  try {
    // Проверяем подключение к Telegram API
    await worker.getBotInfo();
    
    return NextResponse.json({
      status: 'healthy',
      checks: {
        bot_api: 'ok',
        worker_ready: worker.isReady(),
        webhook_configured: true
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      checks: {
        bot_api: 'error',
        worker_ready: worker.isReady(),
        webhook_configured: false
      },
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}

/**
 * Обработка неподдерживаемых методов
 */
export async function PUT(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PATCH(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}