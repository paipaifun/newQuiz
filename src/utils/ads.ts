import { log } from './firebase/firebase'
import { ADType, bannerID, innerID, rewardID, rewardVideoID } from './const'

export const logFB = (name: string, value?: any, params?: any) => {
  console.log('fb.log', name, value, params)
  window.FBInstant.logEvent(name, value, params)
}

// 声明 FBInstant 类型，使其可用
declare global {
  interface Window {
    FBInstant: any
    onFBGameStarted: () => Promise<void>
    localStorage: Storage
  }
}

class LoadState {
  static idle = 'idle'
  static loading = 'loading'
  static loaded = 'loaded'
}

let loadBannerTs: number = parseInt(window.localStorage.getItem('ad_banner_ts') || '0', 10) || 0

interface AdItem {
  instance: any
  type: ADType
  state: string
  startTs: number
  shownTs: number
}

const adList: AdItem[] = [
  {
    instance: null,
    type: ADType.RewardInterstitial,
    state: LoadState.idle,
    startTs: 0,
    shownTs: 0,
  },
  {
    instance: null,
    type: ADType.Interstitial,
    state: LoadState.idle,
    startTs: 0,
    shownTs: 0,
  },
]

/** 加载成功后重置为0 */
let adsLaunchTsOrZero: number = Date.now()

/** 当出现频繁加载或者多次加载无效时需要长等待 */
const longWaitingTs: number = 180 * 1000
/** 不得超过3个或以上同类型广告实例 */
const maxActiveNum: number = 2
/** Banner建议刷新间隔（官方建议，但已经不符合现实情况） */
const bannerBestWaitTs: number = 45 * 1000
/** Banner最小刷新间隔 */
const bannerRetryInterval: number = 1000

export const showBanner = async (placement: string): Promise<void> => {
  await window.onFBGameStarted()
  const startTime: number = Date.now()
  console.warn('showBanner', startTime, loadBannerTs)
  if (startTime - loadBannerTs < bannerRetryInterval) {
    console.error('banner ad too frequent')
    return
  }
  loadBannerTs = startTime + bannerBestWaitTs
  window.localStorage.setItem('ad_banner_ts', loadBannerTs.toString())

  log('ad_load_c', {
    type: 'banner',
    placement: `${placement}_banner`,
  })

  let errMsg: string | null = null
  let errCode: string | null = null

  const adId: string = bannerID
  try {
    await window.FBInstant.loadBannerAdAsync(adId)
  } catch (err: any) {
    // log('otome_ad_show_fail_c', {
    //   type: 'banner',
    //   placement: `${placement}`,
    //   error: err.message || '',
    //   code: err.code || '',
    // })
    log('fb_quiz_ad_impression_fail_c', {
      type: 'banner',
      placement: `${placement}_banner`,
      error: err.message || '',
      code: err.code || '',
    })

    log('ad_impression_fail_c', {
      type: 'banner',
      placement: `${placement}_banner`,
      error: err.message || '',
      code: err.code || '',
    })
    if (err.code === 'RATE_LIMITED') {
      // 速率被限制，尽量延长间隔（实测预估3分钟）
      loadBannerTs = startTime + longWaitingTs
    } else if (err.code === 'ADS_NO_FILL') {
      // 未填充时等待30s
      loadBannerTs = startTime + 30 * 1000
    } else if (err.code === 'ADS_FREQUENT_LOAD') {
      // 频繁加载，尽量延长间隔（实测预估3分钟）
      loadBannerTs = startTime + longWaitingTs
    } else if (err.code === 'CLIENT_UNSUPPORTED_OPERATION') {
      // 可能是不支持，可能是客户端未准备好，允许多尝试
      loadBannerTs = startTime
    } else {
      // 其他情况失败，允许多尝试
      loadBannerTs = startTime
    }
    window.localStorage.setItem('ad_banner_ts', loadBannerTs.toString())

    errMsg = err.message
    errCode = err.code
    console.error('Banner failed to load:', err)
  }

  const endTime: number = Date.now()
  const duration: string = ((endTime - startTime) / 1000).toFixed(2)
  const placementType: string = `${placement}_banner`
  if (errMsg) {
    log('fb_quiz_ad_load_fail_c', {
      type: 'banner',
      placement: placementType,
      duration,
      error: errMsg,
      code: errCode ?? 'NULL',
    })

    log('ad_load_fail_c', {
      placement: placementType,
      duration,
      error: errMsg,
      code: errCode ?? 'NULL',
    })
  } else {
    log('ad_load_success_c', {
      placement: placementType,
      duration,
    })
    log('fb_quiz_ad_load_success_c', {
      placement: placementType,
      duration,
      type: 'banner',
    })

    log('ad_impression_c', { placement: placementType })
    logFB('ad_impression')
  }
}

interface AdDetail {
  startTs: number
  shownTs: number
}

const parseJson = (json: string): AdDetail | null => {
  try {
    return JSON.parse(json)
  } catch (e) {
    console.warn(e)
    return null
  }
}

const saveDetail = (item: AdItem): void => {
  const key: string = `ad_detail_${item.type}`
  window.localStorage.setItem(
    key,
    JSON.stringify({
      startTs: item.startTs,
      shownTs: item.shownTs,
    }),
  )
}

const realPreloadAds = async (placement: string, type: ADType, retryLeft: number = 6): Promise<void> => {
  log('fb_quiz_ad_load_c', {
    placement,
    type: type,
    retryLeft: retryLeft,
  })
  const current: AdItem | undefined = adList.find((item) => item.type === type)
  if (!current) {
    console.error('miss config:', type)
    return
  }

  // 同类型广告不超过3个
  const activeNum: number = adList.filter((item) => item.type === type && item.instance !== null).length

  if (retryLeft < 0 || activeNum > maxActiveNum) {
    console.error(`preloadAds return retry=${retryLeft} active=${activeNum}`)
    if (current.state === LoadState.loading) {
      current.state = LoadState.idle
    }
    return
  }

  const startTime: number = Date.now()
  const interval: number = 1 * 1000

  if (current.startTs > startTime - interval) {
    console.error('preload too frequent', type)
    return
  }

  console.warn(type, 'started Loading')

  let duration: number | string = 0

  current.startTs = startTime
  current.state = LoadState.loading
  saveDetail(current)

  const promise: Promise<any> = (() => {
    const { instance } = current
    if (instance) {
      return new Promise((res) => {
        res(instance)
      })
    }
    if (type === ADType.RewardInterstitial) {
      const id: string = rewardID[0]
      return window.FBInstant.getRewardedInterstitialAsync(id)
    }
    const id: string = innerID[0]
    return window.FBInstant.getInterstitialAdAsync(id)
  })()

  await promise
    .then((instance: any) => {
      current.instance = instance
      log('ad_load_c', { type, placement: `${placement}_${type}` })
      return instance.loadAsync()
    })
    .then(() => {
      const endTime: number = Date.now()
      duration = ((endTime - startTime) / 1000).toFixed(2)
      log('ad_load_success_c', {
        duration,
        type,
        placement: `${placement}_${type}`,
      })
      log('fb_quiz_ad_load_success_c', {
        duration,
        type,
        placement: `${placement}_${type}`,
      })

      current.state = LoadState.loaded

      if (adsLaunchTsOrZero !== 0) {
        log('ad_load_first_succ', {
          duration: ((endTime - adsLaunchTsOrZero) / 1000).toFixed(2),
        })
        adsLaunchTsOrZero = 0
      }
    })
    .catch((err: any) => {
      const endTime: number = Date.now()
      duration = ((endTime - startTime) / 1000).toFixed(2)
      log('fb_quiz_ad_load_fail_c', {
        duration,
        error: err.message ?? '',
        code: err.code ?? 'NULL',
        type,
        placement: `${placement}_${type}`,
      })

      log('ad_load_fail_c', {
        duration,
        error: err.message ?? '',
        code: err.code ?? 'NULL',
        type,
        placement: `${placement}_${type}`,
      })
      console.error(`ad failed to preload: ${err.message}`)

      let left: number = retryLeft - 1
      let timeout: number = 5 * 1000
      if (err.code === 'ADS_NO_FILL') {
        console.log('123')
        // 最多可以再试1次，如果收到3次NO_FILL会被限制
        if (left > 0) left = 0
        timeout = 30 * 1000

        current.startTs = Date.now() + timeout - interval
        saveDetail(current)
      } else if (err.code === 'ADS_FREQUENT_LOAD') {
        // 过多请求，稍微等等
        timeout = longWaitingTs

        current.startTs = Date.now() + timeout - interval
        saveDetail(current)
      } else if (err.code === 'CLIENT_UNSUPPORTED_OPERATION') {
        // 可能是不支持或者客户端还未准备好
        timeout = 20 * 1000
        current.instance = null
      } else if (err.code === 'ADS_TOO_MANY_INSTANCES') {
        // 不再重试
        current.state = LoadState.idle
        // 长时间等待后再次拉取
        current.startTs = Date.now() + longWaitingTs
        saveDetail(current)
        return
      } else if (retryLeft <= 0) {
        if (err.code === 'INVALID_PARAM') {
          // 会提示 invalid instance，尝试重置
          current.instance = null
        }
        current.state = LoadState.idle
        saveDetail(current)
        return
      } else {
        // 兼顾快速请求和连续请求，前3次和后3次时间不同
        timeout = (retryLeft >= 3 ? 3 : 6) * 1000
      }
      setTimeout(() => {
        realPreloadAds(placement, type, left)
      }, timeout)
    })
}

export const hasLoadedAds = (): boolean => {
  return adList.filter((item) => item.instance && item.state === LoadState.loaded).length > 0
}

export const preloadAds = async (placement: string): Promise<void> => {
  await window.onFBGameStarted()

  for (let i = 0; i < adList.length; i += 1) {
    const item: AdItem = adList[i]
    if (item.startTs === 0 && item.shownTs === 0) {
      const key: string = `ad_detail_${item.type}`
      const json: string = window.localStorage.getItem(key) || ''
      const detail: AdDetail | null = parseJson(json)
      item.startTs = detail?.startTs ?? 0
      item.shownTs = detail?.shownTs ?? 0
      adList[i] = item
    }
  }

  const list: AdItem[] = adList.filter((item) => {
    return item.state === LoadState.idle
  })
  await Promise.allSettled(list.map((item) => realPreloadAds(placement, item.type)))
}

export const showRewardVideoAd = async (placement: string = '', successCb?: () => void): Promise<boolean> => {
  const type: string = 'rewarded_video'
  try {
    log('ad_load_c', { placement, type })
    const rewardInstance: any = await window.FBInstant.getRewardedVideoAsync(rewardVideoID[0])
    await rewardInstance.loadAsync()
    log('ad_load_success_c', { placement, type })
    log('fb_quiz_ad_load_success_c', { placement, type })

    log('ad_expect_impression_c', { type, placement: `${placement}_${type}` })
    log('fb_quiz_ad_expect_impression_c', { type, placement: `${placement}_${type}` })
    await rewardInstance.showAsync()
    log('ad_impression_c', { placement, type })
    log('fb_quiz_ad_impression_c_100', { placement, type })
    const params = {
      user_id: window.FBInstant.player.getID(),
      time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      recorder_type: 'no_ads',
    }
    successCb?.()
    // genAdTimesrecorder(params)
    return true
  } catch (e: any) {
    // log('otome_ad_show_fail_c', {
    //   type: type,
    //   placement: `${placement}`,
    //   error: e.message || '',
    //   code: e.code || '',
    // })

    log('ad_impression_fail_c', {
      type: type,
      placement: `${placement}_${type}`,
      error: e.message || '',
      code: e.code || '',
    })
    log('fb_quiz_ad_impression_fail_c', {
      type: type,
      placement: `${placement}_${type}`,
      error: e.message || '',
      code: e.code || '',
    })
    console.warn(e)
    log('ad_impression_fail_c', {
      placement: `${placement}_${type}`,
      error: e?.message || '',
      code: e?.code || '',
    })
    log('fb_quiz_ad_impression_fail_c', {
      type,
      placement: `${placement}_${type}`,
      error: e?.message || '',
      code: e?.code || '',
    })
    if (e.message === 'Ad not completed') {
      log('fb_reward_ad_not_complete', { placement, type })
      if (placement === 'unlockWatchAd_rewardVideo') {
        log('fb_templ_lock_ad_f', { type: 'rewardvideo' })
      }
    } else {
      log('fb_quiz_ad_load_fail_c', { placement, error: e.message, type, code: e.code })

      log('ad_load_fail_c', { placement, error: e.message, type, code: e.code })
      log('fb_reward_ad_fail', { placement, error: e.message, type })
    }
    return false
  }
}

let reported: boolean = false
const reportAdsResult = (ok: boolean, placement: string): void => {
  if (reported) return
  reported = true
  log('ad_impression_first', { placement })
  if (ok) {
    log('ad_impression_first_succ', { placement })
  } else {
    log('ad_impression_first_fail', { placement })
  }
}
export const showAds = async (
  placement: string = '',
  fallback: () => void = () => {},
  specifyAdType?: ADType,
): Promise<void> => {
  await window.onFBGameStarted()

  const lastTs: number = Date.now() - 30 * 1000
  console.log('adList：：：：', adList)
  const list: AdItem[] = adList.filter((item) => {
    console.log('ads:::', item.type, item, item.instance !== null, item.state, item.shownTs < lastTs)
    return item.instance !== null && item.state === LoadState.loaded && item.shownTs < lastTs
  })
  console.log('list：：：：', list)

  if (list.length === 0) {
    console.error('no ad to show')
    reportAdsResult(false, placement)

    preloadAds(placement)
    fallback()
    return
  }

  // 每次都拿最远的一次观看记录
  let current: AdItem = list[0]
  for (let i = 1; i < list.length; i += 1) {
    const item: AdItem = list[i]
    // 优先插屏
    if (current.type === ADType.RewardInterstitial) {
      // continue
    } else if (item.type === ADType.RewardInterstitial) {
      current = item
    } else if (item.shownTs < current.shownTs) {
      current = item
    }
  }

  if (specifyAdType) {
    current = list.find((item) => item.type === specifyAdType) || current
  }

  // console.log('ad_instance got:', current)

  const { instance } = current
  if (!instance) {
    console.warn('empty ad_instance')
    reportAdsResult(false, placement)

    fallback()
    return
  }

  // 保险起见，无论是否成功都置空
  current.instance = null
  current.shownTs = Date.now()
  current.state = LoadState.idle
  saveDetail(current)

  const { type } = current
  log('ad_expect_impression_c', { type, placement: `${placement}_${type}` })
  log('fb_quiz_ad_expect_impression_c', { type, placement: `${placement}_${type}` })
  instance
    .showAsync()
    .then(async () => {
      log('ad_impression_c', { placement: `${placement}_${type}` })
      logFB('ad_impression')
      const count: string = window.localStorage.getItem('ad_imp_count') || '1'
      if (Number(count) >= 3) {
        logFB('ad_imp_count_top3', null, { count })
      }
      logFB('ad_imp_count', null, { count })
      window.localStorage.setItem('ad_imp_count', (parseInt(count, 10) + 1).toString())
      reportAdsResult(true, placement)

      if (type === ADType.RewardInterstitial) {
        log('fb_quiz_ad_impression_c_100', { placement, type })
      } else {
        log('fb_quiz_ad_impression_c', { placement, type })
      }

      if (current.state === LoadState.idle) {
        realPreloadAds(placement, type)
      }
      return true
    })
    .catch((e: any) => {
      // log('fb_quiz_ad_show_fail_c', {
      //   type: type,
      //   placement: `${placement}`,
      //   error: e.message || '',
      //   code: e.code || '',
      // })
      log('fb_quiz_ad_impression_fail_c', {
        type: type,
        placement: `${placement}`,
        error: e.message || '',
        code: e.code || '',
      })

      log('ad_impression_fail_c', {
        type: type,
        placement: `${placement}_${type}`,
        error: e.message || '',
        code: e.code || '',
      })
      log('fb_quiz_ad_impression_fail_c', {
        type,
        placement: `${placement}_${type}`,
        error: e?.message || '',
        code: e?.code || '',
      })
      reportAdsResult(false, placement)
      log('ad_impression_fail_c', {
        placement: `${placement}_${type}`,
        error: e?.message || '',
        code: e?.code || '',
      })
      log('fb_quiz_ad_impression_fail_c', {
        type,
        placement: `${placement}_${type}`,
        error: e?.message || '',
        code: e?.code || '',
      })

      if (type === ADType.RewardInterstitial) {
        logFB('ad_impression')
        const count: string = window.localStorage.getItem('ad_imp_count') || '1'
        if (Number(count) >= 3) {
          logFB('ad_imp_count_top3', null, { count })
        }
        logFB('ad_imp_count', null, { count })
        log('reward_interstitial_skip', { error: e.message })
        log('fb_quiz_reward_interstitial_skip', { error: e.message, type })
        if (specifyAdType) log('fb_templ_lock_ad_f', { type: 'rewardinterstitial' })
      }
      console.warn(e.message)

      if (current.state !== LoadState.idle) {
        return
      }
      current.startTs = Date.now()
      saveDetail(current)
      setTimeout(() => realPreloadAds(placement, type), 30 * 1000)
    })
    .finally(() => {
      fallback()
    })
}
