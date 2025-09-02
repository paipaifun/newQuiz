import React, { useEffect, useState } from 'react'
import TITLE_FLAG_BG from '../../assets/img/title_flag_bg.png'
import Modal from './base';
import COVER_LOADING from '../../assets/img/cover_loading.jpg'
import BTN_PINK_BIG_BG from '../../assets/img/btn_pink_big_bg.png'
import BTN_BLUE_NORMAL_BG from '../../assets/img/btn_blue_normal_bg.png'
import IC_ADS_40 from '../../assets/img/ic_ads_40.png'
import { useNavigate } from 'react-router-dom';
import { log } from '../../utils/firebase/firebase';
import { showAds } from '../../utils/ads';

import BTN_CLOSE from '../../assets/img/btn_close.png'

import { useTranslation } from 'react-i18next'

import { commonStore } from '../../stores/CommonStore'
import { observer } from 'mobx-react-lite'
import { useIntersectionObserver } from '../../hooks/useObserver'
import { gameStore } from '../../stores/GameStore'
import { getUrlParamsByName } from '../../utils'

const LOVE_LIST = ['male_test_love1', 'female_test_love30']

const DAILY_LIST = ['male_test_daliy13', 'female_test_daily33']

const FRIEND_LIST = ['female_test_love32', 'female_test_love29']

const HUMOR_LIST = ['male_test_daliy21', 'male_test_daliy30']

const PERSONALITY_LIST = ['male_test_daliy8', 'male_test_daliy7']

const PARENTING_LIST = ['female_test_parenting1', 'female_test_parenting2']


// 懒加载图片组件
const LazyImage: React.FC<{
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}> = ({ src, alt = '', className = '', style = {}, placeholder }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);

  const [observerRef] = useIntersectionObserver({
    once: true,
    onVisible: () => {
      setIsInView(true);
    },
  });

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true);
  };

  return (
    <div ref={observerRef as any} className={className} style={style}>
      {isInView && (
        <>
          {!isLoaded && (
            <div 
              className="w-full h-full flex items-center justify-center bg-gray-200 animate-pulse"
              style={{ 
                backgroundImage: `url('${COVER_LOADING}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                borderRadius: style.borderRadius || '0px',
                ...style 
              }}
            >
              {/* <div className="text-gray-400 text-sm">加载中...</div> */}
            </div>
          )}
          <div
            className={`w-full h-full transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0 absolute'
            }`}
            style={{
              backgroundImage: error ? `url('${placeholder}')` : `url('${src}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              borderRadius: style.borderRadius || '0px'
            }}
            onLoad={handleLoad}
            onError={handleError}
          />
          {/* 隐藏的 img 元素用于触发加载事件 */}
          <img
            src={src}
            alt={alt}
            style={{ display: 'none' }}
            onLoad={handleLoad}
            onError={handleError}
          />
        </>
      )}
    </div>
  );
};


const DailyFreeRes: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation()
  const { dailyFreeResult, dailyFreeResultModalVisible, moduleData, setDailyFreeModalVisible, setDailyFreeResultModalVisible, setDailyFreeResult } = commonStore || {}
  const [randomIndex, setRandomIndex] = useState(0)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if(dailyFreeResultModalVisible) {
    const randomIndex = Math.floor(Math.random() * 2)
    setRandomIndex(randomIndex)
      if (dailyFreeResultModalVisible) {
        log('fb_quiz_result_show', {
          template_id: getRandomItem()?.img_name,
        })
        setCountdown(5)
      }
    }
  }, [dailyFreeResultModalVisible])

  useEffect(() => {
    if (countdown > 0 && dailyFreeResultModalVisible) {
      const timer = setInterval(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else {
      if (commonStore && typeof setDailyFreeResultModalVisible === 'function' && dailyFreeResultModalVisible) {
        setDailyFreeResultModalVisible(false)
        jumpToDetail()
      }
    }
  }, [countdown, dailyFreeResultModalVisible])


  const jumpToDetail = () => {
    showAds('view_result')
    log('fb_quiz_result_click', {
      template_id: getRandomItem()?.img_name,
    })
    gameStore.setModuleFrom('spin');
    setDailyFreeModalVisible(false)
    setDailyFreeResultModalVisible(false)
    setDailyFreeResult('')
    setCountdown(5)
    setTimeout(() => {
      navigate(`/details?id=${getRandomItem()?.img_name}`);
      gameStore.addClickedModuleId(getRandomItem()?.img_name);
      showAds('spin_result_to_detail')
    }, 500)

    // 获取 url 上的 id
    const id = getUrlParamsByName('id');
    if(id) {
      const container = document.getElementById(id || '');
      if(container) {
        container.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  }

  const getRandomItem = () => {
    if (dailyFreeResult === 'Love') {
      return moduleData.find((item: any) => LOVE_LIST[randomIndex] === item.img_name) || {} as any
    } else if (dailyFreeResult === 'Daily') {
      return moduleData.find((item: any) => DAILY_LIST[randomIndex] === item.img_name) || {} as any
    } else if (dailyFreeResult === 'Friend') {
      return moduleData.find((item: any) => FRIEND_LIST[randomIndex] === item.img_name) || {} as any
    } else if (dailyFreeResult === 'Humor') {
      return moduleData.find((item: any) => HUMOR_LIST[randomIndex] === item.img_name) || {} as any
    } else if (dailyFreeResult === 'Personality') {
      return moduleData.find((item: any) => PERSONALITY_LIST[randomIndex] === item.img_name) || {} as any
    } else if (dailyFreeResult === 'Parenting') {
      return moduleData.find((item: any) => PARENTING_LIST[randomIndex] === item.img_name) || {} as any
    } else {
      return moduleData.find((item: any) => FRIEND_LIST[randomIndex] === item.img_name) || {}
    }
  }

  return (
    <Modal
      isOpen={dailyFreeResultModalVisible}
      onClose={() => {}}
      className="max-w-lg"
    >
      <div className='w-[100vw] h-[100vh] relative'>
        <img src={BTN_CLOSE} alt="btn_close" className='w-[40px] h-[40px] absolute top-[20px] right-[20px]' onClick={() => {
          if (commonStore && typeof setDailyFreeResultModalVisible === 'function') {
            log('fb_quiz_result_close')
            setDailyFreeResultModalVisible(false)
            setDailyFreeResult('')
          }
        }} />
        <div className='w-[330px] h-[68.5px] relative top-[130px] left-[50%] translate-x-[-50%]'>
          <div className='text-[#fff] text-center text-[20px] w-[100%] z-[20] absolute top-[13px]' style={{
            fontWeight: "900",
            textShadow: "-1px -1px 0 #6B0676, 1px -1px 0 #6B0676, -1px 1px 0 #6B0676, 1px 1px 0 #6B0676",
            fontFamily: "Roboto",
          }}>{t('Your Today\'s Key:')}</div>
          <img src={TITLE_FLAG_BG} alt="title_flag_bg" className='w-full h-full absolute top-[0px] left-[0px]' />
        </div>
        <div className="w-[calc(100%-10px)] h-[210px] bg-[#fff] rounded-[8px] mb-[5px] flex flex-col overflow-hidden relative animated-gradient-halo top-[145px] left-[50%] translate-x-[-50%]">
          <div className="w-[calc(100%-10px)] mx-[5px] my-[5px] bg-[#fff] rounded-[8px]">
            <LazyImage
              src={getRandomItem()?.cover}
              className="w-[100%] h-[162px]"
              style={{
                borderRadius: '8px 8px 0px 0px'
              }}
            />
            <div className="w-[calc(100%)] bg-[#fff] h-[38px] leading-[38px] text-left pl-[13px] font-semibold text-[13px] box-border" style={{
              fontWeight: 600,
              fontFamily: 'Roboto',
              borderRadius: '0px 0px 8px 8px'
            }}>
              {t(getRandomItem()?.title)}
            </div>
          </div>
          {/* {getRandomItem()?.isHot === '1' && <img src={HOT} alt="hot" className="w-[44px] h-[44px] absolute top-[10px] left-[10px]" />} */}
          {/* {getRandomItem()?.isNew === '1' && <img src={NEW} alt="new" className="w-[64px] h-[44px] absolute top-[10px] left-[10px]" />} */}
        </div>
        <div className='w-[200px] h-[48.5px] relative top-[160px] left-[50%] translate-x-[-50%] breathing-fast'>
          <img src={BTN_PINK_BIG_BG} alt="btn_pink_big_bg" className='w-[100%] h-[100%] absolute top-[0px] left-[0px]' />
          <div className='text-[#fff] w-full text-center text-[20px] absolute left-[50%] translate-x-[-50%] top-[50%] translate-y-[-50%]' style={{
            fontWeight: "700",
            textShadow: "-1px -1px 0 #6B0676, 1px -1px 0 #6B0676, -1px 1px 0 #6B0676, 1px 1px 0 #6B0676",
            fontFamily: "Roboto",
          }} onClick={jumpToDetail}>{t('View Result')} 👉</div>
        </div>
        <div className='w-[100%] h-[100px] relative top-[166px] left-[50%] translate-x-[-50%] text-center text-[12px] text-[#fff]'>
          {/* {t('Auto jump in {countdown}s...', { countdown })} */}
          {t('Auto jump in')} {countdown}{t('s...')}
        </div>
        {/* <div className='w-[139px] h-[48.5px] relative top-[90px] left-[50%] translate-x-[-50%]' onClick={SpinAgain}> 
            <img src={BTN_BLUE_NORMAL_BG} alt="btn_blue_normal_bg" className='h-full w-full ' />
            <div className='text-[#fff] w-full absolute left-[50%] translate-x-[-50%] top-[50%] translate-y-[-50%] flex justify-center items-center' style={{
              fontWeight: "900",
              textShadow: "-1px -1px 0 #163296, 1px -1px 0 #163296, -1px 1px 0 #163296, 1px 1px 0 #163296",
              fontFamily: "Roboto",
            }}>
              <img src={IC_ADS_40} alt="ic_ads_40" className='w-[20px] h-[20px] ml-[6px] mr-[2px]' />
              <div className='w-[80px]  text-[14px] text-center'>Try Aagain</div>
            </div>
        </div> */}
      </div>
    </Modal>
  )
}

export default observer(DailyFreeRes)