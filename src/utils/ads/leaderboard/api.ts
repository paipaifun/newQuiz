import {
  LeaderboardType,
  QueryLeaderboardRequest,
  QueryLeaderboardRequestWithTime,
  QueryLeaderboardResponse,
  QueryLeaderboardV2Request,
  SortOrder,
  SubmitPlayerScoreRequest,
  SubmitPlayerScoreResponse,
} from './leaderboardTypes'
import { Config } from './type'
import {
  addParamsToUrl,
  generateUUID,
  getCurrentWeekTimestamps,
  getRegionCode,
  getTodayTimestamps,
  handleSignature,
  isSecondTimestamp,
} from './utils'

const jsonFetch = async (url: string, params: RequestInit, config: Config) => {
  const { app_id, userIDGetter, country, signatureGetter } = config
  // @ts-ignore
  const signature = await signatureGetter()
  const playerID = await userIDGetter()
  const res = await fetch(url, {
    ...params,
    headers: {
      ...(params.headers || {}),
      'Content-Type': 'application/json',
      'X-Request-ID': generateUUID(),
      'X-App-ID': app_id,
      'X-Client-Country': country ?? getRegionCode(),
      'X-Player-ID': playerID,
      'X-Request-Signature': signature,
    },
  })
  return res.json()
}

export const setScoreFn = (config: Config) => {
  const { host, signatureGetter } = config

  return async (params: SubmitPlayerScoreRequest): Promise<SubmitPlayerScoreResponse> => {
    const newParams = await handleSignature(params, signatureGetter)
    if (!newParams.ts || !isSecondTimestamp(newParams.ts)) {
      newParams.ts = Math.floor(Date.now() / 1000)
    }
    const json = await jsonFetch(
      `${host}/v1/score`,
      {
        method: 'POST',
        body: JSON.stringify(newParams),
      },
      config
    )
    return json
  }
}

export const getScoreFn = (config: Config) => {
  const { host, signatureGetter } = config
  return async (params: QueryLeaderboardRequest = {}): Promise<QueryLeaderboardResponse> => {
    const newParams = await handleSignature(params, signatureGetter)
    if (!newParams.sort_order) {
      newParams.sort_order = SortOrder.DESC
    }
    const json = await jsonFetch(
      addParamsToUrl(`${host}/v1/leaderboard`, newParams),
      {
        method: 'GET',
      },
      config
    )
    return json
  }
}

export const getScoreFnWithData = (config: Config, presetDataConfig: Record<string, boolean>) => {
  const { host, signatureGetter } = config
  return async (
    params: QueryLeaderboardRequestWithTime = {}
  ): Promise<QueryLeaderboardResponse> => {
    const newParams: QueryLeaderboardRequest = await handleSignature(params, signatureGetter)
    const { weekly, daily } = presetDataConfig
    if (weekly) {
      const [since, until] = getCurrentWeekTimestamps()
      newParams.since = since
      newParams.until = until
    }
    if (daily) {
      const [since, until] = getTodayTimestamps()
      newParams.since = since
      newParams.until = until
    }
    if (!newParams.sort_order) {
      newParams.sort_order = SortOrder.DESC
    }
    const json = await jsonFetch(
      addParamsToUrl(`${host}/v1/leaderboard`, newParams),
      {
        method: 'GET',
      },
      config
    )
    return json
  }
}

export const getScoreFnV2 = (config: Config) => {
  const { host } = config
  return async (params: QueryLeaderboardV2Request): Promise<QueryLeaderboardResponse> => {
    if (
      (params.leaderboard_type === LeaderboardType.FRIENDS_ALL_TIME ||
        params.leaderboard_type === LeaderboardType.FRIENDS_DAILY ||
        params.leaderboard_type === LeaderboardType.FRIENDS_WEEKLY) &&
      !params.player_ids
    ) {
      throw new Error('player_ids is required for friends leaderboard')
    }
    const newParams = { ...params }
    //fix bug: 这里判断存在问题，当sort_order为ASC时，逻辑有问题，因为sort_order为0的时候会走这个逻辑
    if (newParams.sort_order === undefined || newParams.sort_order === null) {
        newParams.sort_order = SortOrder.DESC
    }
    const json = await jsonFetch(
      addParamsToUrl(`${host}/v2/leaderboard`, newParams),
      {
        method: 'GET',
      },
      config
    )
    return json
  }
}
