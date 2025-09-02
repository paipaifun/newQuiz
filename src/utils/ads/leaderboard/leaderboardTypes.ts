export enum SortOrder {
  ASC,
  DESC,
}

// export interface Cursor {
//   before: string
//   after: string
// }

// export interface Pagination {
//   cursor: Cursor
// }

export interface SubmitPlayerScoreRequest {
  player_id: string
  player_name: string
  player_avatar_url: string
  country?: string
  score: number
  ts?: number
  context_id?: string
  extra_data?: string
  signature?: string
}

export interface SubmitPlayerScoreResponse {
  message: string
}

export interface LeaderboardEntry {
  player_id: string
  player_name: string
  player_avatar_url: string
  country: string
  score: number
  ts: number
  context_id?: string
  extra_data?: string
  ranking: number
}

export interface QueryLeaderboardRequest {
  player_ids?: string[]
  country?: string
  min_score?: number
  max_score?: number
  since?: number
  until?: number
  context_id?: string
  limit?: number
  sort_order?: SortOrder
  signature?: string
}

export interface QueryLeaderboardResponse {
  message: string
  entries?: LeaderboardEntry[]
}

export interface QueryLeaderboardRequestWithTime
  extends Omit<QueryLeaderboardRequest, 'since' | 'until'> {}

export enum LeaderboardType {
  LEVEL = 0,
  FRIENDS_ALL_TIME = 1,
  FRIENDS_WEEKLY = 2,
  FRIENDS_DAILY = 3,
  LOCAL_ALL_TIME = 4,
  LOCAL_WEEKLY = 5,
  LOCAL_DAILY = 6,
  GLOBAL_ALL_TIME = 7,
  GLOBAL_WEEKLY = 8,
  GLOBAL_DAILY = 9,
}
export interface QueryLeaderboardV2Request {
  leaderboard_type: LeaderboardType
  player_ids?: string[]
  limit?: number
  sort_order?: SortOrder
  signature?: string
}

export interface LeaderboardInstance {
  version: string
  getScoreV2: (request: QueryLeaderboardV2Request) => Promise<QueryLeaderboardResponse>
  getScore: (request: QueryLeaderboardRequest) => Promise<QueryLeaderboardResponse>
  getWeeklyScore: (request: QueryLeaderboardRequestWithTime) => Promise<QueryLeaderboardResponse>
  getDailyScore: (request: QueryLeaderboardRequestWithTime) => Promise<QueryLeaderboardResponse>
  setScore: (request: SubmitPlayerScoreRequest) => Promise<SubmitPlayerScoreResponse>
  getRegionCode: () => string
}
