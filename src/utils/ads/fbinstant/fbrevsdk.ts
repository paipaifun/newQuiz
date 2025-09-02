import { IRevSDK, RevAdType } from "../revsdk";
import {
  configId,
  getId,
  RevEventCallback,
  RevLoadState,
  RevShareParams,
  RevUserInfo,
} from "../revutils";

let onEvent: RevEventCallback = (event, type, source, params) => {
  console.log(event, type, source, params);
};

export function getFBRevSDK(): IRevSDK | undefined {
  try {
    if (FBInstant == undefined) {
      return undefined;
    }
    if (_gSDK != undefined) {
      return _gSDK;
    }
    _gSDK = new FBRevSDK();
    return _gSDK;
  } catch (err) {
    console.warn("getFBRevSDK error:", err);
  }
  return undefined;
}

let _gSDK: IRevSDK | undefined = undefined;

function getBannerTs(): number {
  if (gLoadBannerTs > 0) {
    return gLoadBannerTs;
  }
  gLoadBannerTs =
    parseInt(window.localStorage.getItem("fbrev_banner_ts") ?? "", 10) || 0;
  return gLoadBannerTs;
}

function setBannerTs(ts: number) {
  gLoadBannerTs = ts;
  window.localStorage.setItem("fbrev_banner_ts", ts.toFixed());
}

let gLoadBannerTs = 0;

interface RevAdItem {
  instance: any;
  type: RevAdType;
  state: RevLoadState;
  startTs: number;
  shownTs: number;
}

const adList: RevAdItem[] = [];

/** 加载成功后重置为0 */
let kAdsLaunchTsOrZero = Date.now();

/** 当出现频繁加载或者多次加载无效时需要长等待 */
const kLongWaitingTs = 180 * 1000;
/** 不得超过3个或以上同类型广告实例 */
const kMaxActiveNum = 3;
/** Banner建议刷新间隔（官方建议，但已经不符合现实情况） */
const kBannerBestWaitTs = 45 * 1000;
/** Banner最小刷新间隔 */
const kBannerRetryInterval = 1000;

class FBRevSDK implements IRevSDK {
  name(): string {
    return "fbinstant";
  }

  setupAd(type: RevAdType, id: string) {
    _setupAd(type, id);
  }

  /**
   * @returns Whether there is an ad available for the given type and source.
   * If the type is banner, always returns true.
   * If the type is not banner, first tries to find an ad that is either
   * already loaded or has been shown more than 30 seconds ago.
   * If no such ad is found, and the source is not null, it will call
   * onGameStarted() and load an ad of the given type and source when
   * onGameStarted() resolves.
   * @param type The type of ad to check for.
   * @param source The source of the ad to check for, if null then it will not
   *               load the ad if it does not exist.
   */
  hasAd(type: RevAdType, source?: string): boolean {
    if (type == RevAdType.banner) {
      return true;
    }

    const actives = _activeList(type);
    if (actives.list.length > 0) {
      return true;
    }
    if (source != null && actives.all.length === 0) {
      const onGameStarted = window.onGameStarted;
      if (onGameStarted) {
        const that = this;
        onGameStarted().then(() => {
          that.loadAd(type, source);
        });
      }
    }
    return false;
  }

  loadAd(type: RevAdType, source: string): Promise<void> {
    if (type === RevAdType.banner) {
      return Promise.resolve();
    }

    const list = adList.filter((item) => item.type === type);
    if (list.length === 0) {
      const ad: RevAdItem = {
        instance: null,
        type: type,
        state: RevLoadState.idle,
        startTs: 0,
        shownTs: 0,
      };
      adList.push(ad);
    }
    return _loadAd(type, source);
  }

  showAd(type: RevAdType, source: string): Promise<boolean> {
    if (type === RevAdType.banner) {
      return new Promise<boolean>((res) => {
        _showBanner(source).then(() => res(true));
      });
    }
    return _showAd(type, source);
  }

  async showBanner(source: string): Promise<void> {
    return _showBanner(source);
  }

  share(params: RevShareParams, source: string): Promise<void> {
    onEvent("share_click", "share", source, {});
    const image = params.image.startsWith("data:image/")
      ? params.image
      : `data:image/jpg;base64,${params.image}`;
    return FBInstant.shareAsync({
      text: params.title,
      image,
    }).then(() => {
      onEvent("share_share", "share", source, {});
    });
  }

  report(event: string, value?: number, params?: { [key: string]: string }) {
    FBInstant.logEvent(event, value, params);
  }

  async userInfo(): Promise<RevUserInfo> {
    return {
      nickName: FBInstant.player.getName(),
      userId: FBInstant.player.getID(),
      avatarUrl: FBInstant.player.getPhoto(),
    };
  }

  onEventCallback(callback: RevEventCallback) {
    onEvent = callback;
  }
}

const saveDetail = (item: RevAdItem) => {
  const key = `rev_ad_item_${item.type}`;
  window.localStorage.setItem(
    key,
    JSON.stringify({
      startTs: item.startTs,
      shownTs: item.shownTs,
    })
  );
};

const _setupAd = (type: RevAdType, id: string) => {
  configId(type, id);
};

const _loadAd = async (type: RevAdType, source: string, retryLeft = 6) => {
  const id = getId(type);
  if (!id || id.length === 0) {
    console.log("miss config:", type);
    return;
  }

  if (type === RevAdType.rewardInterstitial && !hasRewardInterstitial()) {
    console.log("reward interstitial not supported");
    return;
  }

  const list = adList.filter((item) => item.type === type);
  if (list.length === 0) {
    console.log("miss init:", type);
    return;
  }

  const startTime = Date.now();
  const interval = 1 * 1000;

  const current = list.sort((a, b) => a.startTs - b.startTs)[0];
  if (
    current.instance != null &&
    current.state !== RevLoadState.idle &&
    current.startTs > startTime - 5 * 60 * 1000
  ) {
    console.log("ad ocupied", type, current.state);
    return;
  }

  if (current.startTs > startTime - interval) {
    console.log("ad preload too frequent", type);
    return;
  }

  console.log(type, "ad started loading");

  current.startTs = startTime;
  current.state = RevLoadState.loading;
  saveDetail(current);

  let duration = 0;
  let isCached = false;

  const promise: Promise<FBInstant.AdInstance> = (() => {
    const instance: FBInstant.AdInstance | null = current.instance;
    if (instance) {
      isCached = true;
      return new Promise((res) => {
        console.log(
          type,
          "ad using cached instance, please check if the show interval is ok"
        );
        res(instance);
      });
    }

    onEvent("ad_load_c", type, source, {});

    switch (type) {
      case RevAdType.interstitial:
        return FBInstant.getInterstitialAdAsync(id);
      case RevAdType.rewardVideo:
        return FBInstant.getRewardedVideoAsync(id);
      case RevAdType.rewardInterstitial:
        return FBInstant.getRewardedInterstitialAsync(id);
    }
    return Promise.reject(new Error(`unknown ad type[${type}]`));
  })();

  await promise
    .then((instance) => {
      const ad = instance;
      current.instance = ad;
      return ad.loadAsync();
    })
    .then(() => {
      const endTime = Date.now();
      duration = endTime - startTime;
      console.log(type, "ad load success", {
        duration,
        type,
      });

      if (!isCached) {
        onEvent("ad_load_success_c", type, source, {});
      }

      current.state = RevLoadState.loaded;
      saveDetail(current);
    })
    .catch((err: any) => {
      const endTime = Date.now();
      duration = endTime - startTime;
      console.log(type, "ad load fail", {
        duration,
        error: err.message ?? "",
        code: err.code ?? "NULL",
        type,
      });
      console.error(`ad failed to preload: ${err.message}`);

      if (!isCached) {
        onEvent("ad_load_fail_c", type, source, {
          error: err.message,
          code: err.code,
        });
      }

      let left = retryLeft - 1;
      let timeout = 5 * 1000;
      const errCode: FBInstant.ErrorCodeType | null = err.code;
      if (errCode === "ADS_NO_FILL") {
        // 最多可以再试1次，如果收到3次NO_FILL会被限制
        if (left > 0) left = 0;
        timeout = 30 * 1000;

        current.startTs = Date.now() + timeout - interval;
        saveDetail(current);
      } else if (errCode === "ADS_FREQUENT_LOAD") {
        // 过多请求，稍微等等
        timeout = kLongWaitingTs;

        current.startTs = Date.now() + timeout - interval;
        saveDetail(current);
      } else if (errCode === "CLIENT_UNSUPPORTED_OPERATION") {
        // 可能是不支持或者客户端还未准备好，减少重试
        current.instance = null;
        return;
      } else if (errCode === "ADS_TOO_MANY_INSTANCES") {
        // 不再重试
        current.state = RevLoadState.idle;
        // 长时间等待后再次拉取
        current.startTs = Date.now() + kLongWaitingTs;
        saveDetail(current);
        return;
      } else if (retryLeft <= 0) {
        if (errCode === "INVALID_PARAM") {
          // 会提示 invalid instance，尝试重置
          current.instance = null;
        }
        current.state = RevLoadState.idle;
        saveDetail(current);
        return;
      } else {
        // 兼顾快速请求和连续请求，前3次和后3次时间不同
        timeout = (retryLeft >= 3 ? 3 : 6) * 1000;
      }
      setTimeout(() => {
        _loadAd(type, source, left);
      }, timeout);
    });
};

const _activeList = (
  type: RevAdType
): { list: RevAdItem[]; all: RevAdItem[] } => {
  // 激励视频可以连着看，插屏类要求间隔30s
  const secs = type === RevAdType.rewardVideo ? 0.5 : 30;
  const lastTs = Date.now() - secs * 1000;

  const all = adList.filter((item) => {
    return (
      item.instance !== null &&
      item.state === RevLoadState.loaded &&
      item.type === type
    );
  });

  const list = all.filter((item) => item.shownTs < lastTs);

  return { list, all };
};

const _showAd = (type: RevAdType, source: string): Promise<boolean> => {

  const actives = _activeList(type);
  if (actives.list.length === 0) {
    console.log("no ad to show");
    if (actives.all.length === 0) {
      _loadAd(type, source);
    }
    return Promise.reject(new Error("No Ad Available"));
  }

  const current = actives.list.sort((a, b) => a.startTs - b.startTs)[0];

  const instance: FBInstant.AdInstance | null = current.instance;
  if (!instance) {
    // never happens
    console.warn("empty ad_instance");
    return Promise.reject(new Error("Ad Invalid"));
  }

  // 保险起见，无论是否成功都置空
  current.instance = null;
  current.shownTs = Date.now();
  current.state = RevLoadState.idle;
  saveDetail(current);

  const watchTs = Date.now();

  const promise = new Promise<boolean>((resolve, reject) => {
    onEvent("ad_expect_impression_c", type, source, {});
    instance
      .showAsync()
      .then(() => {
        onEvent("ad_impression_c", type, source, {});
        if (current.state === RevLoadState.idle) {
          current.shownTs = Date.now();
          saveDetail(current);

          _loadAd(type, source);
        }

        const watchDur = Date.now() - watchTs;
        if (watchDur < 7 * 1000) {
          console.log("watch time too short");
          resolve(false);
          return;
        }
        onEvent("ad_impression_c_100", type, source, {});
        resolve(true);
      })
      .catch((e: any) => {
        console.warn(type, "ad shown faile", e.code, e.message);

        onEvent("ad_impression_fail_c", type, source, {
          error: e.message,
          code: e.code,
        });

        if (current.state === RevLoadState.idle) {
          current.shownTs = Date.now();
          current.startTs = Date.now();
          saveDetail(current);
          setTimeout(() => _loadAd(type, source), 30 * 1000);
        }
        const errCode = e.code as FBInstant.ErrorCodeType | null;
        if (errCode === "USER_INPUT") {
          console.log("user cancel");
          resolve(false);
          return;
        }
        reject(e);
      });
  });
  return promise;
};

const _showBanner = async (source: string): Promise<void> => {
  const startTime = Date.now();
  if (startTime - getBannerTs() < kBannerRetryInterval) {
    console.log("Banner request too frequent");
    return;
  }

  setBannerTs(startTime + kBannerBestWaitTs);

  console.log("Banner loading");

  let errMsg: string | null = null;
  let errCode: FBInstant.ErrorCodeType | null = null;

  const adId = getId(RevAdType.banner);
  if (adId == null) {
    console.log("Banner id is null");
    return;
  }

  try {
    onEvent("ad_load_c", RevAdType.banner, source, {});
    await FBInstant.loadBannerAdAsync(adId);
    onEvent("ad_load_success_c", RevAdType.banner, source, {});
  } catch (err: any) {
    onEvent("ad_load_fail_c", RevAdType.banner, source, {
      error: err.message,
      code: err.code,
    });

    errCode = err.code;
    if (errCode === "RATE_LIMITED") {
      // 速率被限制，尽量延长间隔（实测预估3分钟）
      setBannerTs(startTime + kLongWaitingTs);
    } else if (errCode === "ADS_NO_FILL") {
      // 未填充时等待30s
      setBannerTs(startTime + 30 * 1000);
    } else if (errCode === "ADS_FREQUENT_LOAD") {
      // 频繁加载，尽量延长间隔（实测预估3分钟）
      setBannerTs(startTime + kLongWaitingTs);
    } else if (errCode === "CLIENT_UNSUPPORTED_OPERATION") {
      // 可能是不支持，可能是客户端未准备好，允许多尝试
      setBannerTs(startTime);
    } else {
      // 其他情况失败，允许多尝试
      setBannerTs(startTime);
    }
    errMsg = err.message;
    console.error("Banner failed to load:", err);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000.0).toFixed(2);
  if (errMsg) {
    console.log("Banner load failed", {
      duration,
      error: errMsg,
      code: errCode ?? "NULL",
    });
  } else {
    console.log("Banner load success", {
      duration,
    });
  }
};

const hasRewardInterstitial = (): boolean => {
  if (gHasRewardInterstitial == undefined) {
    gHasRewardInterstitial =
      FBInstant.getSupportedAPIs().indexOf("getRewardedInterstitialAsync") >= 0;
  }
  return gHasRewardInterstitial;
};

let gHasRewardInterstitial: boolean | undefined;
