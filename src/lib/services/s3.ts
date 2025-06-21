export class S3Service {
  static getImageUrl(key: string): string {
    // Используем новое Beget S3 хранилище как основное
    const endpoint = process.env.S3_ENDPOINT || 'https://s3.ru1.storage.beget.cloud';
    const bucket = process.env.S3_BUCKET || '2c11548b454d-eldar-agency';
    return `${endpoint}/${bucket}/products/${key}`;
  }
  
  static getNewImageUrl(key: string): string {
    // Новый формат URL для Beget S3
    const endpoint = process.env.S3_ENDPOINT || 'https://s3.ru1.storage.beget.cloud';
    const bucket = process.env.S3_BUCKET || '2c11548b454d-eldar-agency';
    return `${endpoint}/${bucket}/products/${key}`;
  }
  
  static getOldImageUrl(key: string): string {
    // Старый формат URL (для fallback)
    const prefix1 = key.substring(0, 2);
    const prefix2 = key.substring(2, 4);
    return `https://strattera.tgapp.online/storage/${prefix1}/${prefix2}/${key}`;
  }
} 