const { FBInstant } = window

// 实际有效时长由服务端决定
const kSignValidDuration = 30 * 60 * 1000

export interface Config {
  apiUrl: string
  appId: string
  appVersion: string
  appBuildNumber: string
  log?: typeof console.log
  isFirstLaunch?: boolean
}

const Global = {
  sign: {
    content: '',
    expiredMs: 0,
  },
  countryCode: '',
  deviceModel: '',
  isReportInited: false,

  eventQueue: [] as any[],
  flushTimer: 0,

  config: {
    apiUrl: '',
    appId: '',
    appVersion: '1.0.0',
    appBuildNumber: '1000',
    log: (...data: any[]) => {},
    isFirstLaunch: true as boolean | undefined,
  },
}

const QUEUE_SIZE_TO_FLUSH = 5 // 队列最大容量（大于时则立即发送）
const QUEUE_SIZE__TO_DROP = 25 // 队列最大容量（大于时则丢弃）
const FLUSH_INTERVAL = 5000 // 定时发送间隔(ms)

function log(...data: any[]) {
  Global.config.log(...data)
}

export function install(config: Config) {
  if (Global.isReportInited) return
  console.log('install', config)
  Global.isReportInited = true

  Global.config.apiUrl = config.apiUrl
  Global.countryCode = Platform.getCountryCode()
  Global.deviceModel = Platform.getDeviceModel()

  config.log = config.log ?? Global.config.log
  Global.config = {
    ...config,
    log: config.log ?? Global.config.log,
    isFirstLaunch: config.isFirstLaunch,
  }

  window?.document?.addEventListener('visibilitychange', () => {
    if (window.document.hidden) {
      flushAllEvents()
    }
  })
}

export const report = async (event: string, params: any) => {
  if (!Global.isReportInited) {
    console.error('report is not init')
    return
  }

  log('reportEvent: ', event, params)

  const requestParams = constructParams(event, params)

  // 添加到队列
  Global.eventQueue.push(requestParams)
  const drop = Global.eventQueue.length - QUEUE_SIZE__TO_DROP
  if (drop > 0) {
    Global.eventQueue = Global.eventQueue.slice(drop)
  }

  initFlushTimer()

  // 当队列达到最大容量时立即发送
  if (Global.eventQueue.length >= QUEUE_SIZE_TO_FLUSH) {
    await flushEvents()
  }
}

export const flushAllEvents = async () => {
  try {
    if (Global.eventQueue.length > 0) {
      await flushEvents()
    }
  } catch (error: any) {
    // FBInstant.logEvent("flush_all_events_fail", undefined, { error: error.message });
    console.error('Error flushing all events:', error)
  }
}

export function getPlatform() {
  return Platform.currentPlatform
}

const getHttpHeader = async () => {
  if (!Global.sign.content || Global.sign.expiredMs < Date.now()) {
    await refreshSignature()
  }
  return {
    'X-App-Id': Global.config.appId,
    'X-Client-Country': Global.countryCode,
    'X-Player-Id': FBInstant.player.getID() ?? '',
    'X-Request-Signature': Global.sign.content,
  }
}

const refreshSignature = async () => {
  const now = Date.now()
  let signedPlayerInfo = await FBInstant.player.getSignedPlayerInfoAsync()
  if (signedPlayerInfo) {
    Global.sign = {
      content: signedPlayerInfo.getSignature(),
      expiredMs: now + kSignValidDuration, // 实际有效时长由服务端决定
    }
  }
}

// 发送队列中的所有事件
const flushEvents = async () => {
  if (Global.eventQueue.length === 0) return

  const eventsToSend = [...Global.eventQueue]
  Global.eventQueue = [] // 清空队列

  let retryCount = 0
  const maxRetries = 2

  while (retryCount <= maxRetries) {
    try {
      await upload2Server(eventsToSend)
      return // 成功后退出
    } catch (error: any) {
      // 从错误对象中获取错误码，如果不存在则设为空字符串
      let errorCode = error.code ?? ''
      if (errorCode === '401') {
        await refreshSignature()
      }
      // FBInstant.logEvent("flush_events_fail", undefined, {
      //   error: error.message,
      //   errorCode: errorCode,
      //   retry: retryCount.toString(),
      // });
      console.error('Error flushing events:', error)
      retryCount++
    }
  }
  // 未成功上传等待下一次上传
  if (eventsToSend.length + Global.eventQueue.length <= QUEUE_SIZE__TO_DROP) {
    Global.eventQueue = eventsToSend.concat(Global.eventQueue)
  }
}

// 初始化定时发送
const initFlushTimer = () => {
  if (Global.flushTimer === 0) return
  // @ts-ignore
  Global.flushTimer = setInterval(async () => {
    if (Global.eventQueue.length >= QUEUE_SIZE_TO_FLUSH) {
      await flushEvents()
    }
  }, FLUSH_INTERVAL)
}

const upload2Server = async (batchParams: any[]) => {
  let httpHeader = await getHttpHeader()
  let uploadInfo = {
    events: batchParams,
  }
  const response = await fetch(Global.config.apiUrl, {
    method: 'POST',
    body: JSON.stringify(uploadInfo),
    headers: {
      'Content-Type': 'application/json',
      ...httpHeader,
    },
  })
  if (!response.ok) {
    const error: any = new Error(`HTTP error! status: ${response.status}`)
    error.code = response.status.toString()
    throw error
  }
  return await response.json()
}

const constructParams = (event: string, params: any) => {
  const now = Date.now()

  let isFirst = false
  if (Global.config.isFirstLaunch != undefined) {
    isFirst = Global.config.isFirstLaunch
  } else {
    if (firstLaunch == null) {
      const key = 'fu_first_luanch_ts'
      const launchStr = window.localStorage.getItem(key)
      firstLaunch = launchStr == null
      if (firstLaunch) {
        window.localStorage.setItem(key, now.toString())
      }
    }
    isFirst = firstLaunch
  }

  let requestParams: any = {}
  requestParams.app_id = Global.config.appId
  requestParams.app_version = Global.config.appVersion
  requestParams.app_version_major = Global.config.appBuildNumber
  requestParams.device_model = deviceModel
  const newParams = {
    ...params,
    fbUserID: FBInstant.player.getID(),
    eventTime: now,
    isFirst: isFirst,
  }
  let eventData = {
    name: event,
    params: Object.keys(newParams).map((name) => ({
      name,
      value: String(newParams[name]),
    })),
    timestamp_millis: now,
  }
  requestParams.event_data = eventData
  requestParams.limited_ad_tracking = false
  requestParams.os_version = Platform.getOsVersion()
  requestParams.platform = Platform.currentPlatform
  requestParams.resettable_device_id = ''
  requestParams.user_default_language = Platform.getDefaultLanguage()
  let userUUIdProperties = {
    name: 'user_uuid',
    set_timestamp_millis: now,
    value: uuid,
  }

  let userCountryproperties = {
    name: 'country_code',
    set_timestamp_millis: now,
    value: Global.countryCode,
  }
  requestParams.user_properties = [userUUIdProperties, userCountryproperties]

  return requestParams
}

/**
 * 打点example
 * {"app_id": "instagram.video.downloader.story.saver.ig", // app 包名
    "app_version": "1.0.1",  // 版本号
    "app_version_major": 101, // 版本Code
    "device_model": "PCT-AL10", // 手机型号
    "event_data": // 事件数据
    {
        "name": "test_send_event", // 事件名
        "params": // 事件参数列表，支持多个 
        [
            {
                "name": "from", // 参数名
                "value": "user_click" // 参数值，统一字符串类型
            }
        ],
        "timestamp_millis": 1724295151286 // 事件发生的时间戳
    },
    "limited_ad_tracking": false, // 广告id是否被限制
    "os_version": 29, // 手机系统版本
    "platform": "android", // 操作系统
    "resettable_device_id": "b4dacb75-db62-4a61-84c7-d9608bbb971d", // 广告id
    "user_default_language": "zh-Hans-CN", // 设备语言
    "user_properties": //用户属性，列表，支持多个 
    [
        {
            "name": "user_id", // 属性名，当为user_id时作为特殊含义，代表用户的自定义id
            "set_timestamp_millis": 1724295151286, // 此属性被设置的时间
            "value": "test-user-id-1" // 取值，统一string
        }
    ],
    "traffic_source":
        {
            "name":"GA-ins3-2.5(ad_value)-IN-20231201", // utm_campaign
            "medium":"cpc", // utm_medium
            "source":"google" // utm_source
    }
}} params 
 */

export const Platform = {
  OS: {
    IOS: 'ios',
    ANDROID: 'android',
    WEB: 'web',
    UNKNOWN: 'unknown',
  },

  // 获取当前平台
  get currentPlatform() {
    if (platform != null) {
      return platform
    }
    try {
      platform = FBInstant.getPlatform()
    } catch (error) {
      platform = 'unknown'
    }
    if (platform?.toLowerCase() === 'ios') {
      platform = this.OS.IOS
    } else if (platform?.toLowerCase() === 'android') {
      platform = this.OS.ANDROID
    } else if (platform?.toLowerCase() === 'web') {
      platform = this.OS.WEB
    } else {
      platform = this.OS.UNKNOWN
    }
    return platform
  },

  getOsVersion() {
    if (osVersion != null && osVersion !== '') {
      return osVersion
    }
    osVersion = navigator.userAgent.match(/(?:Android|iPhone OS|Windows NT|Mac OS X) ([0-9._]+)/i)?.[1] || ''
    return osVersion
  },

  getDefaultLanguage() {
    return navigator.language || 'en-US'
  },

  //获取浏览器类型
  getBrowserType() {
    if (browserType !== null) {
      return browserType
    }

    const ua = navigator.userAgent

    if (ua.indexOf('Firefox') > -1) {
      browserType = 'Firefox'
    } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
      browserType = 'Opera'
    } else if (ua.indexOf('Edge') > -1) {
      browserType = 'Edge'
    } else if (ua.indexOf('Chrome') > -1) {
      browserType = 'Chrome'
    } else if (ua.indexOf('Safari') > -1) {
      browserType = 'Safari'
    } else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
      browserType = 'IE'
    } else {
      browserType = 'Unknown'
    }
    return browserType
  },

  getDeviceModel() {
    if (deviceModel != null && deviceModel !== '') {
      return deviceModel
    }
    // 获取 User Agent
    const ua = navigator.userAgent
    // iOS 设备检测
    if (this.isIOS()) {
      // 匹配 iPhone 型号
      const iPhoneMatch = ua.match(/iPhone(?:\s+OS\s+[\d_]+)?(?:\s+like\s+Mac\s+OS\s+X)?/i)
      if (iPhoneMatch) {
        // 尝试获取具体型号（如 iPhone14,2 表示 iPhone 13 Pro）
        const modelMatch = ua.match(/iPhone\s*([^;\s)]+)/i)
        deviceModel = modelMatch ? `iPhone ${modelMatch[1]}` : 'iPhone'
        return deviceModel
      }

      // 匹配 iPad 型号
      const iPadMatch = ua.match(/iPad(?:\s+OS\s+[\d_]+)?(?:\s+like\s+Mac\s+OS\s+X)?/i)
      if (iPadMatch) {
        const modelMatch = ua.match(/iPad\s*([^;\s)]+)/i)
        deviceModel = modelMatch ? `iPad ${modelMatch[1]}` : 'iPad'
        return deviceModel
      }
      deviceModel = 'iOS Device'
      return deviceModel
    }

    // Android 设备检测
    if (this.isAndroid()) {
      // 尝试匹配设备型号
      const match = ua.match(/\(Linux;[^)]+\) ([^)]+)\)/i) || ua.match(/;\s*([^;)]+(?:\s+Build|\)))/i)
      if (match) {
        // 清理型号字符串
        deviceModel = match[1]
          .replace(/\s+Build.*$/, '') // 移除 Build 标记
          .replace(/\s*\([^)]*\)/g, '') // 移除括号内容
          .replace(/[_\s]+/g, ' ') // 规范化空格
          .trim()
        return deviceModel
      }
      // 如果无法匹配到具体型号，返回Android
      deviceModel = 'Android Device'
      return deviceModel
    }

    //web平台，从agent中提取device model
    if (this.isWeb()) {
      const macMatch = ua.match(/Macintosh; Intel Mac OS X ([0-9._]+)/i)
      if (macMatch) {
        deviceModel = `Mac ${macMatch[1]}`
        return deviceModel
      }
      const windowsMatch = ua.match(/Windows NT ([0-9._]+)/i)
      if (windowsMatch) {
        deviceModel = `Windows ${windowsMatch[1]}`
        return deviceModel
      }
      const linuxMatch = ua.match(/Linux/i)
      if (linuxMatch) {
        deviceModel = 'Linux'
        return deviceModel
      }
      deviceModel = 'Web Device'
      return deviceModel
    }

    // Web 平台或无法识别的设备
    deviceModel = 'Unknown Device'
    return deviceModel
  },

  getCountryCode() {
    // 浏览器语言设置
    try {
      const language = navigator.language
      const countryCode = language.split('-')[1] || language
      return countryCode
    } catch (error) {
      console.error('Error getting country from language:', error)
    }
    return 'None'
  },

  // 检查是否是 iOS
  isIOS() {
    return this.currentPlatform === this.OS.IOS
  },

  // 检查是否是 Android
  isAndroid() {
    return this.currentPlatform === this.OS.ANDROID
  },

  isWeb() {
    return this.currentPlatform === this.OS.WEB
  },

  // 检查是否是移动设备
  isMobile() {
    return this.isIOS || this.isAndroid
  },

  getAgent() {
    if (this.isWeb()) {
      return navigator.userAgent
    }
    return ''
  },
}

function generate16CharUUID() {
  try {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => ('0' + byte.toString(16)).slice(-2)).join('')
  } catch (error) {
    return ''
  }
}
const uuid = generate16CharUUID()

let platform: string | null = null
let deviceModel: string | null = null
let osVersion: string | null = null
let browserType: string | null = null
let firstLaunch: boolean | null = null
