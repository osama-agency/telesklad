class RequestDeduplication {
  private static pending = new Map<string, Promise<any>>();
  
  static async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    if (this.pending.has(key)) {
      console.log(`🔄 Deduplicating request: ${key}`);
      return this.pending.get(key)!;
    }
    
    const promise = fn().finally(() => {
      this.pending.delete(key);
    });
    
    this.pending.set(key, promise);
    return promise;
  }
}

export { RequestDeduplication }; 