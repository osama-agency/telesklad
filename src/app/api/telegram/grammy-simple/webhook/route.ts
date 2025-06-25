import { NextRequest, NextResponse } from 'next/server';
import { GrammyBotWorker } from '@/lib/services/grammy/GrammyBotWorker';
import { logger } from '@/lib/logger';

/**
 * Упрощенный Grammy Webhook для @strattera_test_bot
 * Полноценная обработка всех обновлений
 */

let grammyWorker: GrammyBotWorker | null = null;

async function initializeGrammyWorker(): Promise<GrammyBotWorker> {
  if (!grammyWorker) {
    grammyWorker = GrammyBotWorker.getInstance('client');
    
    if (!grammyWorker.isReady()) {
      logger.info('🚀 Initializing GrammyBotWorker for simple webhook...', undefined, 'Grammy');
      await grammyWorker.initialize();
      logger.info('✅ GrammyBotWorker initialized successfully', undefined, 'Grammy');
    }
  }
  
  return grammyWorker;
}

/**
 * POST handler - полноценная обработка через Grammy
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = performance.now();
  
  try {
    logger.info('📨 Simple Grammy webhook received', {
      url: request.url,
      contentType: request.headers.get('content-type')
    }, 'Grammy');

    // Получаем тело запроса
    const requestBody = await request.text();
    
    if (!requestBody) {
      logger.warn('⚠️ Empty webhook request body', undefined, 'Grammy');
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
    }

    // Парсим JSON
    let update;
    try {
      update = JSON.parse(requestBody);
    } catch (parseError) {
      logger.error('❌ Failed to parse webhook JSON', { 
        error: parseError instanceof Error ? parseError.message : 'Unknown parse error' 
      }, 'Grammy');
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    logger.info('📝 Received update', { 
      updateId: update.update_id,
      updateType: Object.keys(update).filter(key => key !== 'update_id')[0]
    }, 'Grammy');

    // Инициализируем worker
    const worker = await initializeGrammyWorker();

    // ВАЖНО: Вызываем полную обработку обновления через handleUpdate
    await worker.handleUpdate(update);
    
    const duration = performance.now() - startTime;
    
    logger.info('✅ Simple Grammy webhook processed successfully', {
      duration: Math.round(duration),
      updateId: update.update_id
    }, 'Grammy');

    // Telegram ожидает статус 200
    return NextResponse.json({ 
      ok: true, 
      processed: true,
      update_id: update.update_id,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    const duration = performance.now() - startTime;
    
    logger.error('❌ Simple Grammy webhook error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Math.round(duration),
      url: request.url
    }, 'Grammy');

    return NextResponse.json(
      { 
        ok: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

/**
 * GET handler - статус
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const worker = await initializeGrammyWorker();
    
    return NextResponse.json({
      message: 'Simple Grammy Webhook Endpoint',
      status: 'active',
      worker_ready: worker.isReady(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
