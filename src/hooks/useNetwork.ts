// utils/networkStatusManager.ts
type Listener = (status: NetworkStatus) => void

export interface NetworkStatus {
  isOnline: boolean
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
  lastUpdated: number
}

/**
 * 网络状态管理器 - 单例模式
 * 负责监听网络状态变化并通知订阅者
 */
class NetworkStatusManager {
  private static instance: NetworkStatusManager
  private listeners: Set<Listener> = new Set()
  private status: NetworkStatus
  private initialized: boolean = false
  private offlineUpdateTimer: number | null = null
  private readonly OFFLINE_UPDATE_INTERVAL = 5000 // 断网状态更新间隔，5秒

  private constructor() {
    this.status = this.getNetworkStatus()
    this.setupListeners()
    this.setupOfflineUpdates()
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): NetworkStatusManager {
    if (!NetworkStatusManager.instance) {
      NetworkStatusManager.instance = new NetworkStatusManager()
    }
    return NetworkStatusManager.instance
  }

  /**
   * 获取当前网络状态
   */
  private getNetworkStatus(): NetworkStatus {
    const status: NetworkStatus = {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      lastUpdated: Date.now(),
    }

    // 如果浏览器支持 NetworkInformation API
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        status.effectiveType = connection.effectiveType
        status.downlink = connection.downlink
        status.rtt = connection.rtt
        status.saveData = connection.saveData
      }
    }

    return status
  }

  /**
   * 设置网络状态监听器
   */
  private setupListeners(): void {
    if (typeof window === 'undefined' || this.initialized) return

    // 网络状态变化处理函数
    const handleOnlineStatusChange = () => {
      const isOnline = navigator.onLine

      this.updateStatus({
        ...this.status,
        isOnline,
        lastUpdated: Date.now(),
      })

      // 根据在线状态设置或清除定时器
      if (isOnline) {
        this.clearOfflineUpdateTimer()
      } else {
        this.setupOfflineUpdates()
      }
    }

    // 网络连接信息变化处理函数
    const handleConnectionChange = () => {
      this.updateStatus(this.getNetworkStatus())
    }

    // 添加事件监听器
    window.addEventListener('online', handleOnlineStatusChange)
    window.addEventListener('offline', handleOnlineStatusChange)

    // 如果浏览器支持 NetworkInformation API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        connection.addEventListener('change', handleConnectionChange)
      }
    }

    this.initialized = true
  }

  /**
   * 设置断网状态下的定期更新
   */
  private setupOfflineUpdates(): void {
    // 如果已经有定时器或者当前是在线状态，则不设置
    if (this.offlineUpdateTimer !== null || (typeof navigator !== 'undefined' && navigator.onLine)) {
      return
    }

    // 设置定时器，每隔 OFFLINE_UPDATE_INTERVAL 毫秒更新一次状态
    this.offlineUpdateTimer = window.setInterval(() => {
      if (!navigator.onLine) {
        this.updateStatus({
          ...this.status,
          lastUpdated: Date.now(),
        })
      } else {
        // 如果恢复在线，清除定时器
        this.clearOfflineUpdateTimer()
      }
    }, this.OFFLINE_UPDATE_INTERVAL)
  }

  /**
   * 清除断网状态更新定时器
   */
  private clearOfflineUpdateTimer(): void {
    if (this.offlineUpdateTimer !== null) {
      clearInterval(this.offlineUpdateTimer)
      this.offlineUpdateTimer = null
    }
  }

  /**
   * 更新网络状态并通知所有监听器
   */
  private updateStatus(newStatus: NetworkStatus): void {
    this.status = newStatus
    this.notifyListeners()
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.status)
      } catch (error) {
        console.error('Error in network status listener:', error)
      }
    })
  }

  /**
   * 获取当前网络状态
   */
  public getStatus(): NetworkStatus {
    return { ...this.status }
  }

  /**
   * 添加状态变化监听器
   */
  public addListener(listener: Listener): () => void {
    this.listeners.add(listener)
    // 立即通知新监听器当前状态
    listener(this.status)

    // 返回取消监听的函数
    return () => {
      this.removeListener(listener)
    }
  }

  /**
   * 移除状态变化监听器
   */
  public removeListener(listener: Listener): void {
    this.listeners.delete(listener)
  }

  /**
   * 清理资源
   * 在应用销毁时调用
   */
  public cleanup(): void {
    this.clearOfflineUpdateTimer()
    this.listeners.clear()

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', () => {})
      window.removeEventListener('offline', () => {})

      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        if (connection) {
          connection.removeEventListener('change', () => {})
        }
      }
    }
  }
}

// 导出单例实例
export const networkStatusManager = NetworkStatusManager.getInstance()
