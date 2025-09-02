import React, { useEffect, useState } from 'react';
import List from '../components/list';
import ListTest from '../components/list-test';
import HEADER_IMG from '../assets/img/header.png';
import { log } from '../utils/firebase/firebase';
import { showBanner } from '../utils/ads';
import { shortcutGame } from '../utils/FBCommonUtils';
import NavBar from '../components/NavBar';
import { useI18n } from '../hooks/useI18n';
import { commonStore } from '../stores/CommonStore';
import { observer } from 'mobx-react-lite';
import { NEED_AUTO_AD_COUNTRY } from '../constant';
import { showAds } from '../utils/ads';
import { gameStore } from '../stores/GameStore';
import { useNavigate } from 'react-router-dom';



const Home: React.FC = () => {
  const { changeLanguage } = useI18n();
  const navigate = useNavigate();
  // const [showTestList, setShowTestList] = useState<boolean | null>(null);

  useEffect(() => {
    log('fb_quiz_home_show')
    showBanner('home')
    shortcutGame()
    initI18n()
  }, [])

  const handleClick = () => {
    // AdProxy.showCommonAd('module_click')
    const item = commonStore.moduleData[0]
    showAds('module_click')
    gameStore.addClickedModuleId(item.img_name);
    log('fb_quiz_templ_click', {
      from: 'home_feed',
      type: item.module_type,
      id: item.img_name,
      code: item.isNew === '1' ? 'new' : item.isHot === '1' ? 'hot' : 'normal'
    })
    gameStore.setModuleFrom('home_feed');
    navigate(`/details?id=${item.img_name}`);

    log('fb_quiz_card_unlock_suc', {
      id: item.img_name,
      amount: JSON.parse(localStorage.getItem(item.img_name) || '[false, false, false, false]').filter((item: boolean) => item).length + 1,
      type: 'home_click'
    })
  }

  const initI18n = async () => {
    await window.onFBInstantInited()
    let locale = window.FBInstant.getLocale() // 'en_US'

    console.log('isTestListCountry', locale)
    const testCountry =  ['en', 'fr', 'ar', 'de', 'es', 'id', 'pl', 'pt', 'th', 'vi', 'zh-TW', 'ja']
    if (commonStore.isTestListCountry === null) {
      if (testCountry.includes(locale?.split('_')?.[0])) {
        commonStore.setIsTestListCountry(true)
        handleClick()
      } else {
        commonStore.setIsTestListCountry(false)
      }
    }
    const list = ['en', 'fr', 'ar', 'de', 'es', 'id', 'pl', 'pt', 'th', 'vi', 'zh-TW', 'ja']
    console.log('改动', locale, window.FBInstant.getLocale())
    if (NEED_AUTO_AD_COUNTRY.includes(locale?.split('_')?.[0])) {
      commonStore.setNeedAutoAd(true)
      console.log('needAutoAd---')
    }
    if (locale.includes('th') && !commonStore.localeInited) {
      console.log('泰国老铁🇹🇭')
      commonStore.setLanguage('th')
      changeLanguage('th')
    }
    if (locale.includes('pt') && !commonStore.localeInited) {
      console.log('巴西老铁🇧🇷')
      commonStore.setIsPtUser(true)
      changeLanguage('pt')
    }
    commonStore.setLocaleInited(true)
    if (list.includes(locale?.split('_')?.[0]) || locale?.split('_')?.[0] === 'zh') {
      changeLanguage((commonStore.language || ((locale?.split('_')?.[0] === 'zh') ? 'zh-TW' : (locale?.split('_')?.[0]) || 'en')))
    } else {
      changeLanguage(commonStore.language || 'en')
    }
  }
  

  const handleBackTop = () => {
    const container = document.getElementById('home-container');
    console.log(container, 'container')
    if (container) {
      container.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  if (commonStore.isTestListCountry === null) {
    return <></>
  }

  return (
    <div className="w-[100vw] h-[100vh] absolute top-0 left-0 z-0" >
      {/* <img src={HEADER_IMG} alt="header" className="w-[100vw] h-[49px] z-10 absolute top-0 left-0" onClick={handleBackTop}/> */}
      <NavBar />
      <div className="w-[100vw] h-[calc(100vh-50px)] z-10 bg-[#f2f4f7] mt-[50px] px-[5px] pt-[5px] pb-[60px] box-border overflow-y-auto scrollbar-hide" id="home-container">
        <List />
      </div>
    </div>
  );
};

export default observer(Home); 
