// ==== 日志 ====

export const disableLog = () => (gLogOn = false);

export type OnReportCallback = (event: string, params: any) => void;

export function setReportCallback(callback: OnReportCallback) {
  gReportCallback = callback;
}
let gReportCallback: OnReportCallback | null = null;

export function setReportParamsHook(hook: (params: any) => any) {
  gReportParamsHook = hook;
}
let gReportParamsHook: ((params: any) => any) | null = null;

export function setTrackParamsHook(hook: (params: any) => any) {
  gTrackParamsHook = hook;
}
let gTrackParamsHook: ((params: any) => any) | null = null;

export const log = (message: string, params?: any) => {
  if (!gLogOn) {
    return;
  }
  _log(message, params, console.log);
};

export const warn = (message: string, params?: any) => {
  if (!gLogOn) {
    return;
  }
  _log(message, params, console.warn);
};

export const error = (message: string, params?: any) => {
  if (!gLogOn) {
    return;
  }
  _log(message, params, console.error);
};

const _log = (message: string, params: any, func = console.log) => {
  const now = new Date();
  const secs = `${format(now.getSeconds())}.${Math.round(
    now.getMilliseconds() / 100
  )}`;
  const time = `${format(now.getHours())}:${format(now.getMinutes())}:${secs}`;

  if (params != null) {
    func(time, message, ":", params);
  } else {
    func(time, message);
  }
};

let gLogOn = true;

// ==== 分析 ====

/** 投放跟踪 */
export const track = (
  event: string,
  params?: { [key: string]: any; },
  value?: number
) => {
  try {
    _log(`fb.event ${event}`, params);
    if (FBInstant == undefined) {
      return;
    }
    if (gTrackParamsHook) {
      params = gTrackParamsHook(params);
    }
    FBInstant.logEvent(event, value, params);
  } catch (e: any) {
    warn(`fb.event ${event} failed`, { e });
  }
};

/** 产品点位 */
export const report = (event: string, params?: { [key: string]: any; }) => {
  try {
    const analytics = (window as any).analytics;
    if (analytics == undefined) {
      log(`ga.event ${event}`, params);
      return;
    }
    params = params ?? {};
    const uid = userId();
    if (typeof uid === "string") {
      if (gUserId !== uid) {
        gUserId = uid;
        analytics.setUserId(analytics.shared, uid);
      }
      params.fbUserId = uid;
    }
    params.eventTime = Date.now();
    if (params.this_from == undefined && gLaunchFrom.length > 0) {
      params.this_from = gLaunchFrom;
    }
    if (gReportParamsHook) {
      params = gReportParamsHook(params);
    }
    log(`ga.event ${event}`, params);
    analytics.logEvent(analytics.shared, event, params);
    gReportCallback?.(event, params);
  } catch (e: any) {
    warn(`ga.event ${event} failed`, { e });
  }
};

/**
 * 启动时间按数据上报要求格式化
 * @param launchInfo 
 * @returns 
 */
export function launchTimeType(launchInfo: LaunchInfo): string {
  let timeType = "";
  if (launchInfo.first) {
    timeType = "first_open";
  } else {
    const now = Date.now();
    const ts = now - launchInfo.launchTs;
    const hours = [12, 24, 36, 72];
    for (const hour of hours) {
      if (ts < hour * 3600 * 1000) {
        timeType = hour.toFixed(0);
      }
    }
    if (timeType == "") {
      timeType = "72_above";
    }
  }
  return timeType;
}

let gLaunchFrom = "";

/**
 * 启动来源，会从FB获取，如果获取失败，会从URL的from参数获取（前缀web），再获取失败返回web
 * @return
 */
export async function launchFromType(): Promise<string> {
  if (gLaunchFrom.length > 0) {
    return gLaunchFrom;
  }

  try {
    if (typeof window.onGameStarted === "function") {
      await window.onGameStarted();
    }
    const data = await FBInstant.getEntryPointAsync();
    gLaunchFrom = data;
    return data;
  } catch (e: any) {
    log("fbinstant launchFromType failed", e);
  }

  const urlParams = new URLSearchParams(window.location.search);
  let from = urlParams.get("from");
  if (from && from.length > 0) {
    from = "web_" + from;
  } else {
    from = "web";
  }
  gLaunchFrom = from;
  return from;
}

export function launchReferer(): string {
  try {
    const entryPointData = FBInstant.getEntryPointData();
    return entryPointData.referrer;
  } catch (e: any) {
    // console.error(e);
    return "";
  }
}

/**
 * 启动时间、是否首次启动
 * @return
 */
export function launch(): LaunchInfo {
  if (gLaunchInfo) {
    return gLaunchInfo;
  }
  const key = "gz_launch_ts";
  const str = window.localStorage.getItem(key);
  const launchTs = typeof str == "string" ? parseInt(str) : 0;
  if (launchTs > 0) {
    gLaunchInfo = { launchTs, first: false };
  } else {
    const ts = Date.now();
    window.localStorage.setItem(key, ts.toString());
    gLaunchInfo = {
      launchTs: ts,
      first: true,
    };
  }
  return gLaunchInfo;
}

export interface LaunchInfo {
  launchTs: number;
  first: boolean;
}

let gLaunchInfo: LaunchInfo | null = null;
let gUserId = "";

// ==== 内部函数 ====

function format(digit2: number) {
  return digit2 < 10 ? `0${digit2}` : digit2;
}

function userId(): string | null {
  try {
    return FBInstant.player.getID();
  } catch (e: any) {
    return null;
  }
}
