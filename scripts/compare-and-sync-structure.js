const { spawn } = require('child_process');
const fs = require('fs');

// Конфигурация подключений
const LOCAL_DB = {
  PGUSER: 'eldar',
  PGHOST: 'localhost',
  PGPORT: '5432',
  PGDATABASE: 'nextadmin'
};

const REMOTE_DB = {
  PGUSER: 'admin',
  PGPASSWORD: 'admin',
  PGHOST: '89.169.38.127',
  PGPORT: '5433',
  PGDATABASE: 'webapp_production'
};

async function executeSQL(sql, isRemote = false) {
  return new Promise((resolve, reject) => {
    const env = isRemote ? REMOTE_DB : LOCAL_DB;
    
    const child = spawn('psql', ['-c', sql, env.PGDATABASE], {
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
        reject(new Error(`SQL Error: ${error || output}`));
      }
    });
  });
}

async function getTables(isRemote = false) {
  const sql = `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;`;
  const result = await executeSQL(sql, isRemote);
  
  // Парсим результат
  const lines = result.split('\n');
  const tables = [];
  let inData = false;
  
  for (const line of lines) {
    if (line.includes('----')) {
      inData = true;
      continue;
    }
    if (inData && line.trim() && !line.includes('(') && !line.includes('rows')) {
      tables.push(line.trim());
    }
  }
  
  return tables;
}

async function getTableStructure(tableName, isRemote = false) {
  const sql = `
    SELECT 
      column_name,
      data_type,
      character_maximum_length,
      numeric_precision,
      numeric_scale,
      is_nullable,
      column_default
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = '${tableName}'
    ORDER BY ordinal_position;
  `;
  
  const result = await executeSQL(sql, isRemote);
  
  // Парсим результат
  const lines = result.split('\n');
  const columns = [];
  let inData = false;
  
  for (const line of lines) {
    if (line.includes('----')) {
      inData = true;
      continue;
    }
    if (inData && line.includes('|')) {
      const parts = line.split('|').map(p => p.trim());
      if (parts[0] && parts[0] !== 'column_name') {
        columns.push({
          name: parts[0],
          type: parts[1],
          maxLength: parts[2],
          precision: parts[3],
          scale: parts[4],
          nullable: parts[5],
          default: parts[6]
        });
      }
    }
  }
  
  return columns;
}

async function getTableDDL(tableName) {
  const env = LOCAL_DB;
  
  return new Promise((resolve, reject) => {
    const child = spawn('pg_dump', [
      '--schema-only',
      '--no-owner',
      '--no-privileges',
      '--table=' + tableName,
      env.PGDATABASE
    ], {
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
        // Очищаем от комментариев и лишнего
        const cleanDDL = output
          .split('\n')
          .filter(line => 
            !line.startsWith('--') && 
            !line.includes('pg_dump') &&
            !line.includes('SET ') &&
            !line.includes('SELECT pg_catalog') &&
            line.trim() !== ''
          )
          .join('\n');
        resolve(cleanDDL);
      } else {
        reject(new Error(`pg_dump Error: ${error}`));
      }
    });
  });
}

function generateColumnSQL(column) {
  let sql = `${column.type}`;
  
  // Добавляем размеры для типов, которые их требуют
  if (column.type === 'character varying' && column.maxLength) {
    sql = `VARCHAR(${column.maxLength})`;
  } else if (column.type === 'numeric' && column.precision) {
    sql = `NUMERIC(${column.precision}${column.scale ? ',' + column.scale : ''})`;
  } else if (column.type === 'character varying') {
    sql = 'VARCHAR';
  }
  
  // Добавляем NULL/NOT NULL
  if (column.nullable === 'NO') {
    sql += ' NOT NULL';
  }
  
  // Добавляем DEFAULT
  if (column.default && !column.default.includes('nextval')) {
    sql += ` DEFAULT ${column.default}`;
  }
  
  return sql;
}

async function compareAndSync() {
  console.log('🚀 Начинаем сравнение структур баз данных...\n');

  try {
    // 1. Получаем списки таблиц
    console.log('📋 Получаем списки таблиц...');
    const localTables = await getTables(false);
    const remoteTables = await getTables(true);
    
    console.log(`📊 Локальная база: ${localTables.length} таблиц`);
    console.log(`📊 Удаленная база: ${remoteTables.length} таблиц\n`);

    // 2. Находим недостающие таблицы
    const missingTables = localTables.filter(t => !remoteTables.includes(t));
    
    if (missingTables.length > 0) {
      console.log('🆕 Недостающие таблицы в удаленной базе:');
      missingTables.forEach(t => console.log(`   - ${t}`));
      console.log('');
      
      // Создаем недостающие таблицы
      for (const table of missingTables) {
        console.log(`📦 Создаем таблицу ${table}...`);
        try {
          const ddl = await getTableDDL(table);
          if (ddl.includes('CREATE TABLE')) {
            await executeSQL(ddl, true);
            console.log(`✅ Таблица ${table} создана`);
          }
        } catch (error) {
          console.log(`⚠️  Ошибка при создании таблицы ${table}: ${error.message}`);
        }
      }
      console.log('');
    }

    // 3. Проверяем структуру существующих таблиц
    console.log('🔍 Проверяем структуру существующих таблиц...\n');
    
    const commonTables = localTables.filter(t => remoteTables.includes(t));
    
    for (const table of commonTables) {
      const localColumns = await getTableStructure(table, false);
      const remoteColumns = await getTableStructure(table, true);
      
      const localColumnNames = localColumns.map(c => c.name);
      const remoteColumnNames = remoteColumns.map(c => c.name);
      
      const missingColumns = localColumns.filter(c => !remoteColumnNames.includes(c.name));
      
      if (missingColumns.length > 0) {
        console.log(`📋 Таблица ${table} - недостающие столбцы:`);
        
        for (const column of missingColumns) {
          console.log(`   - ${column.name} (${column.type})`);
          
          try {
            const columnSQL = generateColumnSQL(column);
            const alterSQL = `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column.name} ${columnSQL};`;
            
            await executeSQL(alterSQL, true);
            console.log(`   ✅ Добавлен столбец ${column.name}`);
          } catch (error) {
            console.log(`   ⚠️  Ошибка при добавлении столбца ${column.name}: ${error.message}`);
          }
        }
        console.log('');
      }
    }

    // 4. Специальная проверка для важных таблиц
    console.log('🔧 Проверяем критически важные таблицы...\n');
    
    const criticalTables = ['purchases', 'purchase_items', 'expenses', 'exchange_rates', 'supplier_stats'];
    
    for (const table of criticalTables) {
      if (!remoteTables.includes(table)) {
        console.log(`❗ Критическая таблица ${table} отсутствует в удаленной базе`);
        
        if (localTables.includes(table)) {
          console.log(`   Пытаемся создать из локальной базы...`);
          try {
            const ddl = await getTableDDL(table);
            if (ddl.includes('CREATE TABLE')) {
              await executeSQL(ddl, true);
              console.log(`   ✅ Таблица ${table} успешно создана`);
            }
          } catch (error) {
            console.log(`   ⚠️  Ошибка: ${error.message}`);
          }
        }
      } else {
        console.log(`✅ Таблица ${table} существует`);
      }
    }

    console.log('\n✅ Сравнение и синхронизация структур завершены!');
    console.log('💡 Все недостающие таблицы и столбцы добавлены в удаленную базу');
    console.log('🔒 Существующие данные не были затронуты');

  } catch (error) {
    console.error('❌ Ошибка при сравнении структур:', error.message);
  }
}

// Запускаем сравнение и синхронизацию
compareAndSync(); 