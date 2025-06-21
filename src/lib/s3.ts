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
    await s3Client.send(command);
    return `${S3_ENDPOINT}/${S3_BUCKET}/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
}

// Функция удаления файла из S3
export async function deleteFromS3(url: string): Promise<void> {
  try {
    // Извлекаем ключ из URL
    const urlParts = url.split('/');
    const key = urlParts.slice(-2).join('/'); // folder/filename
    
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error('Failed to delete file from S3');
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