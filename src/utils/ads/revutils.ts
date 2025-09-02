export interface IRevSDK {
  name: () => string;

  hasAd: (type: RevAdType, source?: string) => boolean;
  setupAd: (type: RevAdType, id: string) => void;
  loadAd: (type: RevAdType, source: string) => Promise<void>;
  showAd: (type: RevAdType, source: string) => Promise<boolean>;

  showBanner: (source: string) => Promise<void>;

  share: (params: RevShareParams, source: string) => Promise<void>;

  report: (event: string, params?: any) => void;

  userInfo: () => Promise<RevUserInfo>;

  onEventCallback: (callback: RevEventCallback) => void;
}

export interface RevUserInfo {
  nickName: string | null;
  userId: string | null;
  avatarUrl: string | null;
}

export interface RevShareParams {
  title: string;
  /** base64 string */
  image: string;
}

export enum RevLoadState {
  idle = "idle",
  loading = "loading",
  loaded = "loaded",
}

export enum RevAdType {
  interstitial = "interstitial",
  rewardInterstitial = "rewarded_interstitial",
  rewardVideo = "rewarded_video",
  banner = "banner",
}

export type RevEventCallback = (
  event: string,
  type: RevAdType | "share",
  source: string,
  params: any
) => void;

export function getId(type: RevAdType): string | undefined {
  let adid = gConfigAds[type];
  console.log("getId:", adid);
  return adid;
}

export function configId(type: RevAdType, id: string) {
  console.log(`configId: ${type} -> ${id}`);
  gConfigAds[type] = id;
}

export function configIds(ids: { [key: string]: string }) {
  gConfigAds = ids;
}

export let gConfigAds: { [key: string]: string } = {};