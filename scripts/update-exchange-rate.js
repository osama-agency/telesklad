const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateTRYRate() {
  try {
    console.log('Загружаю курс TRY от ЦБ РФ...');
    
    const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
    if (!response.ok) {
      throw new Error(`Failed to fetch CBR rates: ${response.statusText}`);
    }
    
    const cbrData = await response.json();
    
    if (!cbrData.Valute.TRY) {
      throw new Error('TRY rate not found in CBR response');
    }

    const tryData = cbrData.Valute.TRY;
    const tryRate = tryData.Value / tryData.Nominal;
    
    console.log(`CBR TRY data: Value=${tryData.Value}, Nominal=${tryData.Nominal}, Rate per unit=${tryRate}`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Проверяем, есть ли уже запись на сегодня
    const existingRate = await prisma.exchangeRate.findUnique({
      where: {
        currency_effectiveDate: {
          currency: 'TRY',
          effectiveDate: today,
        },
      },
    });

    if (existingRate) {
      console.log(`Курс TRY на ${today.toISOString()} уже существует: ${existingRate.rate} RUB`);
      return existingRate;
    }

    const bufferPercent = 5.0;
    const rateWithBuffer = tryRate * (1 + bufferPercent / 100);

    // Создаем новую запись
    const newRate = await prisma.exchangeRate.create({
      data: {
        currency: 'TRY',
        rate: tryRate,
        rateWithBuffer: rateWithBuffer,
        bufferPercent: bufferPercent,
        source: 'CBR',
        effectiveDate: today,
      },
    });

    console.log(`✅ Создан курс TRY: ${tryRate} RUB (с буфером: ${rateWithBuffer})`);
    return newRate;
  } catch (error) {
    console.error('❌ Ошибка при обновлении курса TRY:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateTRYRate().catch(console.error); 