import { RevAdType } from "../utils/ads/revutils";
import { revsdk } from "../utils/ads/revsdk";


export class AdProxy {

    // location 是不是localhost 或者127.0.0.1
    static isMockFB = location.hostname === 'localhost' || location.hostname === '127.0.0.1'

    public static hasRewardAd(source?: string): boolean {
        if(this.isMockFB) {
            return true;
        }
        let adSdk = revsdk()
        return adSdk.hasAd(RevAdType.rewardVideo, source) || 
        adSdk.hasAd(RevAdType.rewardInterstitial, source)
    }

    public static hasCommonAd(source?: string): boolean {
        if(this.isMockFB) {
            return true;
        }
        let adSdk = revsdk()
        return adSdk.hasAd(RevAdType.interstitial, source) || 
        adSdk.hasAd(RevAdType.rewardInterstitial, source)
    }
    
    public static showRewardAd(source: string): Promise<boolean> {
        if(this.isMockFB) {
            return Promise.resolve(true);
        }
        let adSdk = revsdk()
        if(adSdk.hasAd(RevAdType.rewardVideo, source)){
            console.log("showRewardAd", source, "rewardVideo")
            return adSdk.showAd(RevAdType.rewardVideo, source)
        } else if(adSdk.hasAd(RevAdType.rewardInterstitial, source)){
            console.log("showRewardAd", source, "rewardInterstitial")
            return adSdk.showAd(RevAdType.rewardInterstitial, source)
        }
        console.log("showRewardAd", source, "no ad")
        return Promise.resolve(false)
    }

    public static showCommonAd(source: string): Promise<boolean> {
        if(this.isMockFB) {
            return Promise.resolve(true);
        }
        let adSdk = revsdk()
        if(adSdk.hasAd(RevAdType.rewardInterstitial, source)){
            console.log("showCommonAd", source, "interstitial")
            return adSdk.showAd(RevAdType.rewardInterstitial, source)
        } else if(adSdk.hasAd(RevAdType.interstitial, source)){
            console.log("showCommonAd", source, "interstitial")
            return adSdk.showAd(RevAdType.interstitial, source)
        }
        console.log("showCommonAd", source, "no ad")
        return Promise.resolve(false)
    }


    public static showBannerAd(source: string): Promise<void> {
        if(this.isMockFB) {
            return Promise.resolve();
        }
        let adSdk = revsdk()
        return adSdk.showBanner(source)
    }
}