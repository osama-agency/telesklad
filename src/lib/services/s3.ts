export class S3Service {
  static getImageUrl(key: string): string {
    // Формат URL как в Rails: https://strattera.tgapp.online/storage/xx/yy/full_key
    // где xx и yy - первые 4 символа ключа (по 2 символа)
    const prefix1 = key.substring(0, 2);
    const prefix2 = key.substring(2, 4);
    return `https://strattera.tgapp.online/storage/${prefix1}/${prefix2}/${key}`;
  }
} 