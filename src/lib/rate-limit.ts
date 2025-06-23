const LRU = require('lru-cache');

export type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export default function rateLimit(options?: Options) {
  const tokenCache = new LRU({
    max: options?.uniqueTokenPerInterval || 500,
    maxAge: options?.interval || 60000,
  });

  return {
    check: (res: Response, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;
        
        res.headers.set('X-RateLimit-Limit', limit.toString());
        res.headers.set('X-RateLimit-Remaining', Math.max(0, limit - currentUsage).toString());

        return isRateLimited ? reject() : resolve();
      }),
  };
}

// Специализированные rate limiters
export const authRateLimit = rateLimit({
  interval: 60 * 1000, // 1 минута
  uniqueTokenPerInterval: 500,
});

export const apiRateLimit = rateLimit({
  interval: 60 * 1000, // 1 минута
  uniqueTokenPerInterval: 1000,
});

export const criticalRateLimit = rateLimit({
  interval: 15 * 60 * 1000, // 15 минут
  uniqueTokenPerInterval: 100,
}); 