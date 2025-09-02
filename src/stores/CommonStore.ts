import { makeAutoObservable, when } from 'mobx';
import { moduleData as moduleDataAll } from '../constant/module-data';
import { showAds } from '../utils/ads';
import { log } from '../utils/firebase/firebase';
class CommonStore {
  language: string = '';
  isLangsModalVisible: boolean = false;
  isInstructionModalVisible: boolean = false;
  showUnlockTips: boolean = false;
  type: string = '';
  isPtUser: boolean = false;
  localeInited: boolean = false;
  needAutoAd: boolean = false;
  dailyFreeModalVisible: boolean = false;
  dailyFreeResultModalVisible: boolean = false;
  dailyFreeResult: string = '';
  isShowedDailyFree: boolean = false;
  isTestListCountry: boolean | null = null;
  currInput: string = '';

  constructor() {
    makeAutoObservable(this);
    setInterval(() => {
      console.log('auto_ad_30s_show')
      showAds('auto_ad_30s')
    }, 30000)
  }

  get moduleData() {
    if (this.language === 'pt' || this.isPtUser) {
      return moduleDataAll.filter((item: any) => !item.language || item.language === 'pt');
    } else if (this.language === 'th') {
      return moduleDataAll.filter((item: any) => !item.language || item.language === 'th');
    } else{
      return moduleDataAll.filter((item: any) => !item.language);
    }
  }

  setCurrInput = (input: string) => {
    this.currInput = input;
  }

  setIsTestListCountry = (isTestListCountry: boolean) => {
    this.isTestListCountry = isTestListCountry;
  }

  setIsShowedDailyFree = (isShowed: boolean) => {
    this.isShowedDailyFree = isShowed;
  }

  setDailyFreeResult = (result: string) => {
    this.dailyFreeResult = result;
  }

  setDailyFreeModalVisible = (isVisible: boolean) => {
    this.dailyFreeModalVisible = isVisible;
  }

  setDailyFreeResultModalVisible = (isVisible: boolean) => {
    console.log('改动setDailyFreeResultModalVisible', this.dailyFreeResultModalVisible, isVisible)
    this.dailyFreeResultModalVisible = isVisible;
  }

  setNeedAutoAd = (needAutoAd: boolean) => {
    this.needAutoAd = needAutoAd;
  }

  setLocaleInited = (localeInited: boolean) => {
    this.localeInited = localeInited;
  }

  setIsPtUser = (isPtUser: boolean) => {
    this.isPtUser = isPtUser;
  }

  setLanguage = (language: string) => {
    console.log('改动setLanguage', language)
    this.language = language;
  }

  setIsLangsModalVisible = (isVisible: boolean) => {
    this.isLangsModalVisible = isVisible;
  }

  setIsInstructionModalVisible = (isVisible: boolean) => {
    this.isInstructionModalVisible = isVisible;
  }

  setShowUnlockTips = (isVisible: boolean) => {
    this.showUnlockTips = isVisible;
  }

  setType = (type: string) => {
    this.type = type;
  }


}


export const commonStore = new CommonStore(); 

// when(
//   () => commonStore.needAutoAd,
//   () => {
//     console.log('auto_ad_30s_start')
//     setInterval(() => {
//       console.log('auto_ad_30s_show')
//       showAds('auto_ad_30s')
//     }, 30000)
//   }
// );
