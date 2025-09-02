import { getScoreFn, getScoreFnV2, getScoreFnWithData, setScoreFn } from './api'
import { LeaderboardInstance } from './leaderboardTypes'
import { Config } from './type'
import { getRegionCode } from './utils'

export * from './leaderboardTypes'
export * from './type'

export const initializeLeaderboard = (config: Config): LeaderboardInstance => {
  return {
    setScore: setScoreFn(config),
    getScore: getScoreFn(config),
    getWeeklyScore: getScoreFnWithData(config, { weekly: true }),
    getDailyScore: getScoreFnWithData(config, { daily: true }),
    version: '0.3.3',
    getRegionCode,
    getScoreV2: getScoreFnV2(config),
  }
}
