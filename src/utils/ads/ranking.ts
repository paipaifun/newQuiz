import {
  initializeLeaderboard,
  LeaderboardInstance,
  LeaderboardType,
  QueryLeaderboardRequest,
  QueryLeaderboardV2Request,
  SortOrder,
  SubmitPlayerScoreRequest,
} from "./leaderboard/index";

let gAppId = "";
let gHost = "";

export function setAppIdBeforeInstall(appId: string, host: string) {
  gAppId = appId;
  gHost = host;
}

export interface RankItemData {
  score: number;
  rank: number;

  photoUrl: string;
  nickName: string;

  userId: string;
}

export enum RankTimezoneType {
  daily = "daily",
  weekly = "weekly",
  alltime = "alltime",
}

export enum RankRegionType {
  yours = "yours",
  local = "local",
  global = "global",
}

export function formatScore(score: number): string {
  const w = 1000;
  if (score < w) {
    return score.toString();
  }
  const h = Math.floor(score / w);
  const hs = formatScore(h);
  const l = score - h * w;
  const ls = l.toString();
  if (ls.length < 3) {
    return hs + "," + "0".repeat(3 - ls.length) + l.toString();
  }
  return hs + "," + l.toString();
}

export function copyDefinedValue(src: any, dst: any): any {
  if (src == undefined || src == null) {
    return dst;
  }
  const keys = Object.keys(src);
  for (const key of keys) {
    const value = src[key];
    if (value == undefined || value == null) {
      continue;
    }
    dst[key] = value;
  }
  return dst;
}

export async function updateData(
  score: number,
  level: number,
  date: Date = new Date()
): Promise<void> {
  const api = rankingApi();
  const userInfo = queryUserInfo();
  if (!userInfo.userId) {
    throw new Error("user id is empty");
  }

  const params: SubmitPlayerScoreRequest = {
    player_id: userInfo.userId,
    player_name: userInfo.nickName ?? "",
    player_avatar_url: userInfo.photoUrl ?? "",
    score: score,
    context_id: level.toString(),
    // ts: Math.floor(date.getTime() / 1000),
  };

  await api.setScore(params);
}

export function queryUserInfo() {
  const userId = FBInstant.player.getID();
  const photoUrl = FBInstant.player.getPhoto();
  const nickName = FBInstant.player.getName();
  const info = { userId, photoUrl, nickName };
  // console.log("user info:", info);
  return info;
}

export async function requestLevelData(
  limit: number = 50
): Promise<RankItemData[]> {
  const api = rankingApi();
  const res = await api.getScoreV2({
    leaderboard_type: LeaderboardType.LEVEL,
    limit,
  });
  if (!res.entries) {
    return [];
  }
  return res.entries.map((item) => {
    const newItem: RankItemData = {
      score: item.score,
      rank: item.ranking,
      photoUrl: item.player_avatar_url,
      nickName: item.player_name,
      userId: item.player_id,
    };
    return newItem;
  });
}

export async function requestData(
  region: RankRegionType,
  timezone: RankTimezoneType,
  level?: number,
  options?: {
    score?: { min: number; max: number; };
    asc?: boolean;
    limit?: number;
  }
): Promise<RankItemData[]> {
  const api = rankingApi();

  const res = await (async () => {
    let playerIds: string[] | undefined = undefined;
    if (region === RankRegionType.yours) {
      playerIds = [];
      // 先获取自己的uid
      const userId = FBInstant.player.getID();
      if (userId) {
        playerIds.push(userId);
      }
      try {
        const onGameStarted = window.onGameStarted;
        if (typeof onGameStarted == "function") {
          await onGameStarted();
        }
        // 获取好友id，无权限会抛出异常
        const playerList = await FBInstant.player.getConnectedPlayersAsync();
        const list = playerList.map((item) => item.getID());
        playerIds.push(...list);
      } catch (e) {
        console.warn("get friend list error:", e);
      }
    }

    if ((!options || !options.score) && (!level || level == 0)) {
      let type: LeaderboardType | null = null;
      if (timezone === RankTimezoneType.daily) {
        if (region === RankRegionType.yours) {
          type = LeaderboardType.FRIENDS_DAILY;
        } else if (region === RankRegionType.local) {
          type = LeaderboardType.LOCAL_DAILY;
        } else if (region === RankRegionType.global) {
          type = LeaderboardType.GLOBAL_DAILY;
        }
      } else if (timezone === RankTimezoneType.weekly) {
        if (region === RankRegionType.yours) {
          type = LeaderboardType.FRIENDS_WEEKLY;
        } else if (region === RankRegionType.local) {
          type = LeaderboardType.LOCAL_WEEKLY;
        } else if (region === RankRegionType.global) {
          type = LeaderboardType.GLOBAL_WEEKLY;
        }
      } else {
        if (region === RankRegionType.yours) {
          type = LeaderboardType.FRIENDS_ALL_TIME;
        } else if (region === RankRegionType.local) {
          type = LeaderboardType.LOCAL_ALL_TIME;
        } else if (region === RankRegionType.global) {
          type = LeaderboardType.GLOBAL_ALL_TIME;
        }
      }
      if (type == null) {
        throw new Error("type is null");
      }
      const nullableParams: QueryLeaderboardV2Request = {
        leaderboard_type: type,
        player_ids: playerIds,
        sort_order: options?.asc ? SortOrder.ASC : SortOrder.DESC,
      };
      const params = copyDefinedValue(nullableParams, {});
      if (options?.limit) {
        params.limit = options.limit;
      }
      return await api.getScoreV2(params);
    }

    let country: string | undefined = undefined;
    if (region === RankRegionType.local) {
      country = getRegionCode();
    }

    const nullableParams: QueryLeaderboardRequest = {
      player_ids: playerIds,
      country,
      min_score: options?.score?.min,
      max_score: options?.score?.max,
      sort_order: options?.asc ? SortOrder.ASC : SortOrder.DESC,
      context_id: level?.toString(),
    };

    const params = copyDefinedValue(nullableParams, {});
    if (timezone === RankTimezoneType.daily) {
      return await api.getDailyScore(params);
    }
    if (timezone === RankTimezoneType.weekly) {
      return await api.getWeeklyScore(params);
    }
    if (options?.limit) {
      params.limit = options.limit;
    }
    return await api.getScore(params);
  })();

  if (!Array.isArray(res.entries)) {
    return [];
  }
  const data = res.entries.map((item) => {
    const newItem: RankItemData = {
      score: item.score,
      rank: item.ranking,
      photoUrl: item.player_avatar_url,
      nickName: item.player_name,
      userId: item.player_id,
    };
    return newItem;
  });
  // console.log("rank data:", data);
  return data;
}

export function getRegionCode() {
  const language = navigator.language;
  if (!language) {
    return "";
  }

  // 将语言代码分割成部分
  var parts = language.split("-");
  if (parts.length > 1) {
    // 如果有多个部分，返回最后一个部分（通常是地区代码）
    return parts[parts.length - 1].toUpperCase();
  } else {
    // 如果只有一个部分，将其作为地区代码返回
    return parts[0].toUpperCase();
  }
}

export const rankingApi = () => {
  if (gRankingApi) {
    return gRankingApi;
  }
  if (gAppId.length == 0) {
    throw new Error("app id is empty");
  }
  if (gHost.length == 0) {
    throw new Error("host is empty");
  }
  gRankingApi = initializeLeaderboard({
    host: gHost,
    app_id: gAppId,
    userIDGetter: async function (): Promise<string> {
      return FBInstant.player.getID() ?? "";
    },
    signatureGetter: async function (): Promise<string> {
      const info = await FBInstant.player.getSignedPlayerInfoAsync();
      return info.getSignature();
    },
  });
  return gRankingApi;
};

let gRankingApi: LeaderboardInstance | null = null;

function fakeList(): RankItemData[] {
  return [
    {
      score: 100000,
      rank: 1,
      photoUrl:
        "https://i.pinimg.com/236x/30/e5/05/30e505564404a86cf58b02b92ba50ca8.jpg",
      nickName: "Siri",
      userId: "1",
    },
    {
      score: 99998,
      rank: 2,
      photoUrl:
        "https://i.pinimg.com/236x/b7/e5/3e/b7e53e3dfcb1cdb900cf8b98a41fb1f2.jpg",
      nickName: "Jack",
      userId: "2",
    },
    {
      score: 99777,
      rank: 3,
      photoUrl:
        "https://i.pinimg.com/236x/b2/f8/6c/b2f86cabfcd145a50cca57c9302e7aa2.jpg",
      nickName: "Google",
      userId: "3",
    },
    {
      score: 89999,
      rank: 4,
      photoUrl:
        "https://i.pinimg.com/236x/30/e5/05/30e505564404a86cf58b02b92ba50ca8.jpg",
      nickName: "Me",
      userId: "4",
    },
    {
      score: 88888,
      rank: 5,
      photoUrl: "",
      nickName: "Alexa",
      userId: "5",
    },
    {
      score: 87777,
      rank: 6,
      photoUrl: "",
      nickName: "Bixby",
      userId: "6",
    },
    {
      score: 86666,
      rank: 7,
      photoUrl: "",
      nickName: "Cortana",
      userId: "7",
    },
    {
      score: 85555,
      rank: 8,
      photoUrl: "",
      nickName: "Siri",
      userId: "8",
    },
    {
      score: 84444,
      rank: 9,
      photoUrl: "",
      nickName: "Google",
      userId: "9",
    },
    {
      score: 83333,
      rank: 10,
      photoUrl: "",
      nickName: "Jack",
      userId: "10",
    },
  ];
}
