import { GZPlatform as Platform } from "./gzplatform";

// 实际有效时长由服务端决定
const kSignValidDuration = 30 * 60 * 1000;

export interface Config {
  apiUrl: string;
  appId: string;
  appVersion: string;
  appBuildNumber: string;
  log?: typeof console.log;
  isFirstLaunch?: boolean;
}

const Global = {
  sign: {
    content: "",
    expiredMs: 0,
  },
  countryCode: "",
  deviceModel: "",
  isReportInited: false,

  eventQueue: [] as any[],
  flushTimer: 0,

  config: {
    apiUrl: "",
    appId: "",
    appVersion: "1.0.0",
    appBuildNumber: "1000",
    log: (...data: any[]) => { },
    isFirstLaunch: true as boolean | undefined,
  },
};

const QUEUE_SIZE_TO_FLUSH = 5; // 队列最大容量（大于时则立即发送）
const QUEUE_SIZE__TO_DROP = 25; // 队列最大容量（大于时则丢弃）
const FLUSH_INTERVAL = 5000; // 定时发送间隔(ms)

function log(...data: any[]) {
  Global.config.log(...data);
}

export function install(config: Config) {
  if (Global.isReportInited) return;
  Global.isReportInited = true;

  Global.config.apiUrl = config.apiUrl;
  Global.countryCode = Platform.getCountryCode();
  Global.deviceModel = Platform.getDeviceModel();

  config.log = config.log ?? Global.config.log;
  Global.config = {
    ...config,
    log: config.log ?? Global.config.log,
    isFirstLaunch: config.isFirstLaunch,
  };

  window?.document?.addEventListener("visibilitychange", () => {
    if (window.document.hidden) {
      flushAllEvents();
    }
  });
}

export const report = async (event: string, params: any) => {
  if (!Global.isReportInited) {
    console.error("report is not init");
    return;
  }

  log("reportEvent: ", event, params);

  const requestParams = constructParams(event, params);

  // 添加到队列
  Global.eventQueue.push(requestParams);
  const drop = Global.eventQueue.length - QUEUE_SIZE__TO_DROP;
  if (drop > 0) {
    Global.eventQueue = Global.eventQueue.slice(drop);
  }

  initFlushTimer();

  // 当队列达到最大容量时立即发送
  if (Global.eventQueue.length >= QUEUE_SIZE_TO_FLUSH) {
    await flushEvents();
  }
};

export const flushAllEvents = async () => {
  try {
    if (Global.eventQueue.length > 0) {
      await flushEvents();
    }
  } catch (error: any) {
    // FBInstant.logEvent("flush_all_events_fail", undefined, { error: error.message });
    console.error("Error flushing all events:", error);
  }
};

export function getPlatform() {
  return Platform.currentPlatform;
}

const getHttpHeader = async () => {
  if (!Global.sign.content || Global.sign.expiredMs < Date.now()) {
    await refreshSignature();
  }
  return {
    "X-App-Id": Global.config.appId,
    "X-Client-Country": Global.countryCode,
    "X-Player-Id": FBInstant.player.getID() ?? "",
    "X-Request-Signature": Global.sign.content,
  };
};

const refreshSignature = async () => {
  const now = Date.now();
  let signedPlayerInfo = await FBInstant.player.getSignedPlayerInfoAsync();
  if (signedPlayerInfo) {
    Global.sign = {
      content: signedPlayerInfo.getSignature(),
      expiredMs: now + kSignValidDuration, // 实际有效时长由服务端决定
    };
  }
};

// 发送队列中的所有事件
const flushEvents = async () => {
  if (Global.eventQueue.length === 0) return;

  const eventsToSend = [...Global.eventQueue];
  Global.eventQueue = []; // 清空队列

  let retryCount = 0;
  const maxRetries = 2;

  while (retryCount <= maxRetries) {
    try {
      await upload2Server(eventsToSend);
      return; // 成功后退出
    } catch (error: any) {
      // 从错误对象中获取错误码，如果不存在则设为空字符串
      let errorCode = error.code ?? "";
      if (errorCode === "401") {
        await refreshSignature();
      }
      // FBInstant.logEvent("flush_events_fail", undefined, {
      //   error: error.message,
      //   errorCode: errorCode,
      //   retry: retryCount.toString(),
      // });
      console.error("Error flushing events:", error);
      retryCount++;
    }
  }
  // 未成功上传等待下一次上传
  if (eventsToSend.length + Global.eventQueue.length <= QUEUE_SIZE__TO_DROP) {
    Global.eventQueue = eventsToSend.concat(Global.eventQueue);
  }
};

// 初始化定时发送
const initFlushTimer = () => {
  if (Global.flushTimer === 0) return;
  // @ts-ignore
  Global.flushTimer = setInterval(async () => {
    if (Global.eventQueue.length >= QUEUE_SIZE_TO_FLUSH) {
      await flushEvents();
    }
  }, FLUSH_INTERVAL);
};

const upload2Server = async (batchParams: any[]) => {
  let httpHeader = await getHttpHeader();
  let uploadInfo = {
    events: batchParams,
  };
  const response = await fetch(Global.config.apiUrl, {
    method: "POST",
    body: JSON.stringify(uploadInfo),
    headers: {
      "Content-Type": "application/json",
      ...httpHeader,
    },
  });
  if (!response.ok) {
    const error: any = new Error(`HTTP error! status: ${response.status}`);
    error.code = response.status.toString();
    throw error;
  }
  return await response.json();
};

export const getCountryInfoFromServer = async () => {
  let httpHeader = await getHttpHeader();
  const response = await fetch(Global.config.apiUrl + "/client/params", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...httpHeader,
    },
  });
  if (!response.ok) {
    const error: any = new Error(`HTTP error! status: ${response.status}`);
    error.code = response.status.toString();
    throw error;
  }
  return await response.json();
};

const constructParams = (event: string, params: any) => {
  const now = Date.now();

  let isFirst = false;
  if (Global.config.isFirstLaunch != undefined) {
    isFirst = Global.config.isFirstLaunch;
  } else {
    isFirst = Platform.isFirstLaunch;
  }

  let requestParams: any = {};
  requestParams.app_id = Global.config.appId;
  requestParams.app_version = Global.config.appVersion;
  requestParams.app_version_major = Global.config.appBuildNumber;
  requestParams.device_model = Platform.getDeviceModel();
  const newParams = {
    ...params,
    fbUserID: FBInstant.player.getID(),
    eventTime: now,
    isFirst: isFirst,
  };
  let eventData = {
    name: event,
    params: Object.keys(newParams).map((name) => ({
      name,
      value: String(newParams[name]),
    })),
    timestamp_millis: now,
  };
  requestParams.event_data = eventData;
  requestParams.limited_ad_tracking = false;
  requestParams.os_version = Platform.getOsVersion();
  requestParams.platform = Platform.currentPlatform;
  requestParams.resettable_device_id = "";
  requestParams.user_default_language = Platform.getDefaultLanguage();
  let userUUIdProperties = {
    name: "user_uuid",
    set_timestamp_millis: now,
    value: Platform.uuid,
  };

  let userCountryproperties = {
    name: "country_code",
    set_timestamp_millis: now,
    value: Global.countryCode,
  };
  requestParams.user_properties = [userUUIdProperties, userCountryproperties];

  return requestParams;
};

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
