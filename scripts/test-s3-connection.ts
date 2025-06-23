import { S3Client, ListBucketsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';

// Загружаем переменные окружения
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

console.log('Testing S3 connection...\n');

// Проверяем переменные окружения
console.log('Environment variables:');
console.log('S3_ENDPOINT:', process.env.S3_ENDPOINT || 'Not set');
console.log('S3_BUCKET:', process.env.S3_BUCKET || 'Not set');
console.log('S3_REGION:', process.env.S3_REGION || 'Not set');
console.log('S3_ACCESS_KEY:', process.env.S3_ACCESS_KEY ? '***' + process.env.S3_ACCESS_KEY.slice(-4) : 'Not set');
console.log('S3_SECRET_KEY:', process.env.S3_SECRET_KEY ? '***' : 'Not set');
console.log('\n');

// Создаем клиент S3
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'ru-1',
  endpoint: process.env.S3_ENDPOINT || 'https://s3.ru1.storage.beget.cloud',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: true,
});

async function testConnection() {
  try {
    // Тест 1: Список бакетов
    console.log('Test 1: Listing buckets...');
    const bucketsCommand = new ListBucketsCommand({});
    const bucketsResponse = await s3Client.send(bucketsCommand);
    console.log('✅ Buckets found:', bucketsResponse.Buckets?.map(b => b.Name).join(', '));
    console.log('\n');

    // Тест 2: Список объектов в бакете
    console.log('Test 2: Listing objects in bucket...');
    const bucket = process.env.S3_BUCKET || '2c11548b454d-eldar-agency';
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: 'avatars/',
      MaxKeys: 10,
    });
    
    const listResponse = await s3Client.send(listCommand);
    console.log(`✅ Objects in bucket '${bucket}' with prefix 'avatars/':`);
    
    if (listResponse.Contents && listResponse.Contents.length > 0) {
      listResponse.Contents.forEach(obj => {
        console.log(`  - ${obj.Key} (${obj.Size} bytes)`);
      });
    } else {
      console.log('  No objects found with prefix "avatars/"');
    }
    
    console.log('\n✨ S3 connection test successful!');
  } catch (error: any) {
    console.error('❌ S3 connection test failed!');
    console.error('Error:', error.message);
    
    if (error.Code === 'InvalidAccessKeyId') {
      console.error('\n⚠️  The access key ID is invalid. Please check your S3_ACCESS_KEY environment variable.');
    } else if (error.Code === 'SignatureDoesNotMatch') {
      console.error('\n⚠️  The secret access key is invalid. Please check your S3_SECRET_KEY environment variable.');
    } else if (error.Code === 'NoSuchBucket') {
      console.error('\n⚠️  The bucket does not exist. Please check your S3_BUCKET environment variable.');
    }
    
    process.exit(1);
  }
}

testConnection(); 