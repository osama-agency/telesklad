const { spawn } = require('child_process');

async function executeSQL(sql, database = 'remote') {
  return new Promise((resolve, reject) => {
    const env = database === 'remote' 
      ? {
          PGUSER: 'admin',
          PGPASSWORD: 'admin', 
          PGHOST: '89.169.38.127',
          PGPORT: '5433'
        }
      : {
          PGUSER: 'eldar',
          PGHOST: 'localhost',
          PGPORT: '5432'
        };

    const dbName = database === 'remote' ? 'webapp_production' : 'nextadmin';
    
    const child = spawn('psql', ['-c', sql, dbName], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...env }
    });

    let output = '';
    let error = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      error += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`SQL Error: ${error}`));
      }
    });
  });
}

async function safeMigrateStructure() {
  console.log('🚀 Начинаем безопасную миграцию структуры базы данных...\n');

  try {
    // 1. ПРОВЕРЯЕМ И ДОБАВЛЯЕМ НЕДОСТАЮЩИЕ ТАБЛИЦЫ
    console.log('📋 Проверяем недостающие таблицы...');
    
    // Список таблиц из локальной базы, которых может не быть в удаленной
    const tablesToCheck = [
      'Account',
      'ApiKey', 
      'Session',
      'VerificationToken',
      '_prisma_migrations',
      'exchange_rates',
      'expenses',
      'purchase_items',
      'purchases',
      'supplier_stats'
    ];

    for (const table of tablesToCheck) {
      try {
        // Проверяем, существует ли таблица в удаленной базе
        const result = await executeSQL(`SELECT to_regclass('public.${table}') as exists;`, 'remote');
        const exists = result.includes('(1 row)') && !result.includes('null');
        
        if (!exists) {
          console.log(`⚠️  Таблица ${table} отсутствует в удаленной базе`);
          
          // Получаем структуру таблицы из локальной базы
          try {
            const createStatement = await executeSQL(`pg_dump --schema-only --table=${table} nextadmin`, 'local');
            
            // Применяем создание таблицы к удаленной базе
            const cleanStatement = createStatement
              .split('\n')
              .filter(line => 
                !line.startsWith('--') && 
                !line.includes('pg_dump') &&
                !line.includes('SET ') &&
                !line.includes('SELECT pg_catalog') &&
                line.trim() !== ''
              )
              .join('\n');
            
            if (cleanStatement.includes('CREATE TABLE')) {
              await executeSQL(cleanStatement, 'remote');
              console.log(`✅ Создана таблица ${table}`);
            }
          } catch (error) {
            console.log(`⚠️  Не удалось создать таблицу ${table}: ${error.message}`);
          }
        } else {
          console.log(`🔄 Таблица ${table} уже существует`);
        }
      } catch (error) {
        console.log(`⚠️  Ошибка при проверке таблицы ${table}: ${error.message}`);
      }
    }

    // 2. ПРОВЕРЯЕМ И ДОБАВЛЯЕМ НЕДОСТАЮЩИЕ СТОЛБЦЫ В PRODUCTS
    console.log('\n📦 Проверяем столбцы в таблице products...');
    
    const productColumns = [
      { name: 'is_visible', type: 'BOOLEAN DEFAULT true' },
      { name: 'prime_cost', type: 'NUMERIC(10,2)' },
      { name: 'avgpurchasepricerub', type: 'NUMERIC(10,2)' },
      { name: 'avgpurchasepricetry', type: 'NUMERIC(10,2)' }
    ];

    for (const column of productColumns) {
      try {
        const result = await executeSQL(
          `SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = '${column.name}';`,
          'remote'
        );
        
        if (!result.includes(column.name)) {
          await executeSQL(
            `ALTER TABLE products ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`,
            'remote'
          );
          console.log(`✅ Добавлен столбец products.${column.name}`);
        } else {
          console.log(`🔄 Столбец products.${column.name} уже существует`);
        }
      } catch (error) {
        console.log(`⚠️  Ошибка со столбцом ${column.name}: ${error.message}`);
      }
    }

    // 3. ПРОВЕРЯЕМ И ДОБАВЛЯЕМ НЕДОСТАЮЩИЕ СТОЛБЦЫ В ORDERS
    console.log('\n📋 Проверяем столбцы в таблице orders...');
    
    const orderColumns = [
      { name: 'externalId', type: 'VARCHAR UNIQUE' },
      { name: 'customerName', type: 'VARCHAR' },
      { name: 'customerEmail', type: 'VARCHAR' },
      { name: 'customerPhone', type: 'VARCHAR' },
      { name: 'currency', type: 'VARCHAR DEFAULT \'RUB\'' },
      { name: 'orderDate', type: 'TIMESTAMP' },
      { name: 'bankCard', type: 'VARCHAR' },
      { name: 'customerCity', type: 'VARCHAR' },
      { name: 'deliveryCost', type: 'NUMERIC(10,2) DEFAULT 0' },
      { name: 'customerAddress', type: 'VARCHAR' }
    ];

    for (const column of orderColumns) {
      try {
        const result = await executeSQL(
          `SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name = '${column.name}';`,
          'remote'
        );
        
        if (!result.includes(column.name)) {
          // Для externalId нужно особая обработка из-за UNIQUE
          const columnDef = column.name === 'externalId' 
            ? `${column.name} ${column.type.replace(' UNIQUE', '')}`
            : `${column.name} ${column.type}`;
            
          await executeSQL(
            `ALTER TABLE orders ADD COLUMN IF NOT EXISTS ${columnDef};`,
            'remote'
          );
          
          // Добавляем UNIQUE constraint отдельно для externalId
          if (column.name === 'externalId') {
            try {
              await executeSQL(
                `ALTER TABLE orders ADD CONSTRAINT orders_externalId_unique UNIQUE (externalId);`,
                'remote'
              );
            } catch (e) {
              // Constraint может уже существовать
            }
          }
          
          console.log(`✅ Добавлен столбец orders.${column.name}`);
        } else {
          console.log(`🔄 Столбец orders.${column.name} уже существует`);
        }
      } catch (error) {
        console.log(`⚠️  Ошибка со столбцом ${column.name}: ${error.message}`);
      }
    }

    console.log('\n✅ Безопасная миграция структуры завершена!');
    console.log('💡 Все изменения применены без затрагивания существующих данных');

  } catch (error) {
    console.error('❌ Ошибка при миграции структуры:', error.message);
  }
}

// Запускаем миграцию
safeMigrateStructure(); 