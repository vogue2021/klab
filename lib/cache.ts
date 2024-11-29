type CacheData = {
  timestamp: number;
  data: any;
};

type CacheType = 'flowchart' | 'mindmap' | 'animation';

// 创建一个简单的服务器端缓存对象
const cacheStore: Record<string, CacheData> = {};
const CACHE_EXPIRY = 1000 * 60 * 30; // 30分钟过期

export const cache = {
  // 生成缓存键
  generateKey(code: string, type: CacheType): string {
    return `${type}:${code}`;
  },

  // 获取缓存
  get(code: string, type: CacheType): any | null {
    const key = this.generateKey(code, type);
    const cached = cacheStore[key];
    
    if (!cached) return null;
    
    // 检查是否过期
    if (Date.now() - cached.timestamp > CACHE_EXPIRY) {
      delete cacheStore[key];
      return null;
    }
    
    return cached.data;
  },

  // 设置缓存
  set(code: string, type: CacheType, data: any): void {
    const key = this.generateKey(code, type);
    cacheStore[key] = {
      timestamp: Date.now(),
      data
    };
  }
}; 