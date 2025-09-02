# 配置纪要

1. 设置类型识别
```json
"typeRoots" : [
      "./assets/framework/revsdk/fbinstant/types",
    ],
```

2. 调用前设置AppId和服务地址

```typescript
import { setAppIdBeforeInstall } from "./revsdk/ranking";
import { gzRankUrl } from "./revsdk/gzendpoint";

setAppIdBeforeInstall("XXXXX", gzRankUrl());
```

3. 【可选，推荐】设置window.onGameStarted变量（Promise），用于判断FB是否已经启动了游戏

```typescript
// 示例

// 初始化promise
let startResolve = () => { };
const promise = new Promise((resolve) => {
    startResolve = () => {
        try {
            let locale = FBInstant.getLocale();
            console.log("locale = " + locale);
        } catch (e) {
            console.warn(e);
        }
        resolve();
    };
});
window.onGameStarted = () => promise;

// 回调
FBInstant.startGameAsync().then(() => {
    // 先执行其他代码，最后调用startResolve

    startResolve();
});

```

4. 接口可以调用时机统一
   1. 安装接口随时可调用
   2. 普通接口在游戏初始化后可调用
   3. 广告、授权等接口在游戏启动后可调用（如果配置onGameStarted则接口会自动保证调用时机）

## 普通埋点上报

1. 在index.html中添加代码，设置window.analytics

```html
<body>
  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
    import { getAnalytics, logEvent, setUserId } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";

    const firebaseConfig = {
      apiKey: "...",
      authDomain: "...",
      databaseURL: "...",
      projectId: "...",
      storageBucket: "...",
      messagingSenderId: "...",
      appId: "...",
      measurementId: "..."
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);

    window.analytics = {
      shared: analytics,
      logEvent: logEvent,
      setUserId: setUserId,
    };
  </script>
  <script src="https://connect.facebook.net/en_US/fbinstant.7.1.js"></script>

  <!-- 其他代码 -->

</body>

```

2. 初始化TS代码

```typescript
import {
  launch,
  launchFromType,
  launchTimeType,
  report,
} from "./revsdk/gamezoo";

// 上报启动点位

const launchInfo = launch(); // 启动时间、是否首次启动
launchFromType().then((source) => { // 启动来源
  const timeType = launchTimeType(launchInfo); // 格式化
  report("fb_candy_app_launch", { type: timeType, from: source });
  if (launchInfo.first) {
    report("fb_candy_first_open");
  }
});

```

## 广告

建议实践：
1. 所有广告场景仅区分插屏和激励
2. 插屏广告包括激励插屏和普通插屏，优先展示激励插屏
3. 激励广告包括激励插屏和激励视频，优先展示激励插屏

```typescript
import { revsdk } from "./revsdk/revsdk";
import { report } from "./revsdk/gamezoo";

// 1.初始化点位上报，这里通过gamezoo上报（也可以用其他）
revsdk().onEventCallback((event, type, source, params) => {
  const name = "fb_candy_" + event;
  const newParams: any = params ?? {};
  if (
    type === RevAdType.banner ||
    type === RevAdType.rewardVideo ||
    type === RevAdType.interstitial ||
    type === RevAdType.rewardInterstitial
  ) {
    const placement = source + "_" + type;
    newParams.placement = placement;
    report(name, newParams);
    return;
  }
  newParams.from = source;
  report(name, newParams);
});

// 2.预加载广告
static async reloadAds(): Promise<void> {
  const configs = [
    { type: RevAdType.rewardInterstitial, id: ConfigAds.rewardInterstitial },
    { type: RevAdType.interstitial, id: ConfigAds.interstitial },
    { type: RevAdType.banner, id: ConfigAds.banner },
    { type: RevAdType.rewardVideo, id: ConfigAds.rewardVideo },
  ];

  const promises = [];
  const sdk = revsdk();
  for (const item of configs) {
    configId(item.type, item.id);
    promises.push(sdk.loadAd(item.type, "launch"));
  }
  await Promise.all(promises);
}


// 3.根据实际使用需要调用hasAd和showAd，一般来说不需要主动调用loadAd

// 3.1 激励广告示例
static showRewardAd(source: string): Promise<boolean> {
  const types = this.rewardAdTypes();
  const sdk = revsdk();
  for (const type of types) {
    if (!sdk.hasAd(type, source)) {
      continue;
    }
    console.log("using ad", type);

    const music = cc.audioEngine.isMusicPlaying();
    music && cc.audioEngine.pauseMusic();

    const promise = sdk.showAd(type, source);
    promise
      .then(() => music && cc.audioEngine.resumeMusic())
      .catch(() => music && cc.audioEngine.resumeMusic());
    return promise;
  }
  return Promise.reject(new Error("no ad"));
}

// 3.2 插屏广告示例
static async showInterstitialAd(source: string): Promise<void> {
  const sdk = revsdk();
  const music = cc.audioEngine.isMusicPlaying();
  try {
    const types = [RevAdType.rewardInterstitial, RevAdType.interstitial];
    for (const type of types) {
      if (sdk.hasAd(type, source)) {
        music && cc.audioEngine.pauseMusic();
        await sdk.showAd(type, source);
        music && cc.audioEngine.resumeMusic();
        return;
      }
    }
  } catch (e) {
    console.warn(e);
    music && cc.audioEngine.resumeMusic();
  }
}

// 3.3 Banner广告示例
// TODO 可请教星海

```

## 实时埋点上报

```typescript
// 在FB初始化后安装
import * as flashup from "./revsdk/flashup";
import { setReportCallback } from "./revsdk/gamezoo";
import { gzFlashupUrl } from "./revsdk/gzendpoint";

const kAppId = "";

flashup.install({
  appId: kAppId,
  apiUrl: gzFlashupUrl(), // 新版地址，注意区分老版，不能搞混地址
  appVersion: "1.0.0",
  appBuildNumber: "1000",
});
setReportCallback((event, params) => {
  flashup.report(event, params);
});
```
