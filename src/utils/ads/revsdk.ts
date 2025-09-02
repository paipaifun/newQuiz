import { getFBRevSDK } from "./fbinstant/fbrevsdk";
import {
  IRevSDK,
  RevAdType,
  RevEventCallback,
  RevShareParams,
  RevUserInfo,
  gConfigAds
} from "./revutils";

export { RevAdType };
export type { IRevSDK, RevShareParams, RevUserInfo };

export class DefaultRevSDK implements IRevSDK {
  name(): string {
    return "default";
  }

  setupAd(type: RevAdType, id: string): void {
    gConfigAds[type] = id;
    console.log(gConfigAds);
  }

  hasAd(type: RevAdType, source?: string): boolean {
    return true;
  }
  loadAd(type: RevAdType, source: string): Promise<void> {
    return Promise.resolve();
  }
  showAd(type: RevAdType, source: string): Promise<boolean> {
    return Promise.resolve(true);
  }

  showBanner(source: string): Promise<void> {
    return Promise.resolve();
  }

  share(params: RevShareParams, source: string): Promise<void> {
    return Promise.resolve();
  }

  report(event: string, params?: any): void { }

  userInfo(): Promise<RevUserInfo> {
    return Promise.resolve({ nickName: "", userId: "", avatarUrl: "" });
  }

  onEventCallback(callback: RevEventCallback) { }
}

export function revsdk(): IRevSDK {
  const sdk = getFBRevSDK();
  return sdk ?? gSDK;
}

let gSDK = new DefaultRevSDK();
