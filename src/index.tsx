// import React from 'react';
// import { createRoot } from 'react-dom/client';
// import App from './App';
// import './index.css';
// import './i18n';
// import { install } from './utils/flashup'
// import { log } from './utils/firebase/firebase'
// import { revsdk } from './utils/ads/revsdk'
// import { RevAdType, configId } from './utils/ads/revutils'
// import { bannerID, innerID, rewardID, rewardVideoID } from './constant/index'

// install({
//   apiUrl: 'https://api.fig.brainburst.cloud/74bf23/v1/event',
//   appId: '1707011756883885',
//   appVersion: '1.0.0',
//   appBuildNumber: '1000',
//   log: console.log,
// })

// const logLaunch = async () => {
//   await window.onFBInstantInited()
//   const entryPoint = await window.FBInstant.getEntryPointAsync()
//   const a = window.FBInstant.getEntryPointData()
//   console.log('a-aaaa-xxxaa-aaaa-', a)
//   log('fb_quiz_app_launch', {
//     from: entryPoint,
//     source: a?.referrer || '',
//   })

//   const isFirstOpen = localStorage.getItem('isFirstOpen')
//   // log('fb_quiz_first_open')
//   if (!isFirstOpen) {
//     localStorage.setItem('isFirstOpen', 'true')
//     log('fb_quiz_first_open')
//   }
// }

// logLaunch()

// const adStatictics = (
//   event: string,
//   type: RevAdType | "share",
//   source: string,
//   params?: any
// ): void => {
//   const newParams: any = params ?? {};
//   if (
//       type === RevAdType.banner ||
//       type === RevAdType.rewardVideo ||
//       type === RevAdType.interstitial ||
//       type === RevAdType.rewardInterstitial
//   ) {
//       const placement = `${source}_${type}`;
//       newParams.placement = placement;
//       log(event, newParams);
//       return;
//   }
//   newParams.from = source;
//   log(event, newParams);
// };

// const loadAdsPromise = new Promise<void>((resolve) => {
//   window.onFBInstantInited()
//   const sdk = revsdk()
//   sdk.onEventCallback(adStatictics);
//   let adConfigList = [
//       {type: RevAdType.interstitial, id: innerID[0]},
//       {type: RevAdType.rewardInterstitial, id: rewardID[0]},
//       {type: RevAdType.rewardVideo, id: rewardVideoID[0]},
//       {type: RevAdType.banner, id: bannerID}
//   ]
//   adConfigList.forEach((adConfig) => {
//       configId(adConfig.type, adConfig.id)
//       sdk.loadAd(adConfig.type, "game")
//   })
// })

// const timeoutPromise = new Promise<void>((resolve) => {
//   setTimeout(resolve, 10000)
// })

// const initData = async () => {
//   await Promise.allSettled([
//     Promise.race([loadAdsPromise, timeoutPromise]),
//   ])
// }

// initData()

// const container = document.getElementById('root');
// if (container) {
//   const root = createRoot(container);
//   root.render(
//     <React.StrictMode>
//         <App />
//     </React.StrictMode>
//   );
// } 

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import { install } from './utils/flashup'
import { log } from './utils/firebase/firebase'
import { hasLoadedAds, preloadAds } from './utils/ads'
// import { StoreProvider } from './stores/StoreProvider';
install({
  apiUrl: 'https://api.fig.brainburst.cloud/74bf23/v1/event',
  appId: '1707011756883885',
  appVersion: '1.0.0',
  appBuildNumber: '1000',
  log: console.log,
})

const logLaunch = async () => {
  await window.onFBInstantInited()
  const entryPoint = await window.FBInstant.getEntryPointAsync()
  const a = window.FBInstant.getEntryPointData()
  console.log('a-aaaa-xxxaa-aaaa-', a)
  log('fb_quiz_app_launch', {
    from: entryPoint,
    source: a?.referrer || '',
  })

  const isFirstOpen = localStorage.getItem('isFirstOpen')
  // log('fb_quiz_first_open')
  if (!isFirstOpen) {
    localStorage.setItem('isFirstOpen', 'true')
    log('fb_quiz_first_open')
  }
}

logLaunch()

const loadAdsPromise = new Promise<void>((resolve) => {
  const endTs = Date.now() + 5 * 1000

  const load = async () => {
    if (hasLoadedAds() || Date.now() > endTs) {
      resolve()
      return
    }
    console.log('loading ads...')
    preloadAds('loading_page')
  }
  load().catch(() => load())
})

const timeoutPromise = new Promise<void>((resolve) => {
  setTimeout(resolve, 5000)
})

const initData = async () => {
  await Promise.allSettled([
    Promise.race([loadAdsPromise, timeoutPromise]),
  ])
}

initData()

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
  );
} 