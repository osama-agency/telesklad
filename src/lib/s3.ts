import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Конфигурация S3 (Beget Cloud Storage)
const s3Config = {
  region: process.env.S3_REGION || 'ru-1',
  endpoint: process.env.S3_ENDPOINT || 'https://s3.ru1.storage.beget.cloud',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: true, // Важно для S3-совместимых хранилищ
};

// Debug logging
console.log('S3 Config:', {
  region: s3Config.region,
  endpoint: s3Config.endpoint,
  accessKeyId: s3Config.credentials.accessKeyId ? 'Set' : 'Not set',
  secretAccessKey: s3Config.credentials.secretAccessKey ? 'Set' : 'Not set',
});

// Создаем клиент S3
export const s3Client = new S3Client(s3Config);

// Настройки bucket
export const S3_BUCKET = process.env.S3_BUCKET || '2c11548b454d-eldar-agency';
export const S3_REGION = process.env.S3_REGION || 'ru-1';
export const S3_ENDPOINT = process.env.S3_ENDPOINT || 'https://s3.ru1.storage.beget.cloud';

// Функция загрузки файла в S3
export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'products'
): Promise<string> {
  const key = `${folder}/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read', // Делаем файл публично доступным
  });

  try {
    console.log('Uploading to S3:', {
      bucket: S3_BUCKET,
      key: key,
      contentType: contentType,
    });
    
    await s3Client.send(command);
    const fileUrl = `${S3_ENDPOINT}/${S3_BUCKET}/${key}`;
    console.log('Upload successful:', fileUrl);
    return fileUrl;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
}

// Функция удаления файла из S3
export async function deleteFromS3(url: string): Promise<void> {
  try {
    // Извлекаем ключ из URL
    // URL формат: https://s3.ru1.storage.beget.cloud/2c11548b454d-eldar-agency/avatars/123456-filename.jpg
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Убираем bucket name из пути и получаем ключ
    const bucketIndex = pathParts.findIndex(part => part === S3_BUCKET);
    const key = bucketIndex >= 0 
      ? pathParts.slice(bucketIndex + 1).join('/')
      : pathParts.slice(-2).join('/'); // fallback для старого формата
    
    console.log('Deleting from S3:', {
      url: url,
      bucket: S3_BUCKET,
      key: key,
    });
    
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    await s3Client.send(command);
    console.log('Delete successful:', key);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    // Не выбрасываем ошибку, чтобы не блокировать загрузку нового файла
    console.warn('Failed to delete old file, continuing with upload');
  }
}

// Функция получения подписанного URL для приватных файлов
export async function getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
}

// Функция получения presigned URL для загрузки (клиентская загрузка)
export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string,
  folder: string = 'products'
): Promise<{ uploadUrl: string; fileUrl: string }> {
  const key = `${folder}/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
    ACL: 'public-read',
  });

  try {
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const fileUrl = `${S3_ENDPOINT}/${S3_BUCKET}/${key}`;
    
    return { uploadUrl, fileUrl };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate presigned URL');
  }
} 