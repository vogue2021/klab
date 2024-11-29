interface CacheData {
  timestamp: number
  data: any
}

const CACHE_EXPIRY = 1000 * 60 * 30 // 30分钟过期

export class Cache {
  private static instance: Cache
  private cache: Map<string, CacheData>

  private constructor() {
    this.cache = new Map()
  }

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache()
    }
    return Cache.instance
  }

  // 生成缓存键
  private generateKey(code: string, type: 'flowchart' | 'mindmap' | 'animation'): string {
    return `${type}:${code}`
  }

  // 获取缓存
  get(code: string, type: 'flowchart' | 'mindmap' | 'animation'): any | null {
    const key = this.generateKey(code, type)
    const cached = this.cache.get(key)
    
    if (!cached) return null
    
    // 检查是否过期
    if (Date.now() - cached.timestamp > CACHE_EXPIRY) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  // 设置缓存
  set(code: string, type: 'flowchart' | 'mindmap' | 'animation', data: any): void {
    const key = this.generateKey(code, type)
    this.cache.set(key, {
      timestamp: Date.now(),
      data
    })
  }
} 