import React, { useState, useRef, useEffect } from 'react'
import TITLE_FLAG_BG from '../../assets/img/title_flag_bg.png'
import SPIN_CENTER from '../../assets/img/spin_center.png'
import SPIN_TOP from '../../assets/img/spin_top.png'
import SPIN_SELECT from '../../assets/img/spin_select.png'
import SPIN_BG from '../../assets/img/spin_bg.png'
import Modal from './base';

import IC_DAILY from '../../assets/img/ic_daily.png'
import IC_FRIEND from '../../assets/img/ic_friend.png'
import IC_HUMOR from '../../assets/img/ic_humor.png'
import IC_LOVE from '../../assets/img/ic_love.png'
import IC_PARENT from '../../assets/img/ic_parent.png'
import IC_PERSONALITY from '../../assets/img/ic_personality.png'

import BTN_BLUE_NORMAL_BG from '../../assets/img/btn_blue_normal_bg.png'
import BTN_PINK_NORMAL_BG from '../../assets/img/btn_pink_normal_bg.png'
import IC_ADS_40 from '../../assets/img/ic_ads_40.png'
import BTN_CLOSE from '../../assets/img/btn_close.png'
import { useTranslation } from 'react-i18next'
import { commonStore } from '../../stores/CommonStore'
import { observer } from 'mobx-react-lite'
import { showRewardVideoAd } from '../../utils/ads'
import { showLoading, hideLoading } from './Loading';
import { showToast } from '../Toast';
import { log } from '../../utils/firebase/firebase';

const sections = [
  { label: 'Daily', icon: IC_DAILY },
  { label: 'Love', icon: IC_LOVE },
  { label: 'Parenting', icon: IC_PARENT },
  { label: 'Friend', icon: IC_FRIEND },
  { label: 'Humor', icon: IC_HUMOR },
  { label: 'Personality', icon: IC_PERSONALITY },
];


const DailyFree = () => {
  const { t } = useTranslation()
  const [currentAngle, setCurrentAngle] = useState(0)
  const [showChoose, setShowChoose] = useState(false)
  const { dailyFreeModalVisible, setDailyFreeModalVisible, setDailyFreeResult, setDailyFreeResultModalVisible } = commonStore || {}
  const [spinCount, setSpinCount] = useState(localStorage.getItem('spinDay') === new Date().toISOString().split('T')[0] ? 1 : 0)
  const [spinning, setSpinning] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (dailyFreeModalVisible) {

      // SpinAgain()
      setSpinCount(localStorage.getItem('spinDay') === new Date().toISOString().split('T')[0] ? 1 : 0)
    } else {
      // 重置
      setCurrentAngle(0)
      setShowChoose(false)
    }
  }, [dailyFreeModalVisible])

  const SpinAgain = async () => {

    showLoading()
    
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    // 设置新的定时器
    timeoutRef.current = setTimeout(() => {
      hideLoading()
      showToast(t('Network error, please try again later'))
      timeoutRef.current = null
    }, 8000)

    try {
      // const adRes = await AdProxy.showRewardAd('watch_ad_to_unlock')
      const adRes = await showRewardVideoAd('spin')
      hideLoading()
      // 清除定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      if (adRes) {
        showToast(t('spin again'))
        handleSpin(true)
      } else {
        log('fb_quiz_spin_fail')
        showToast(t('Keep watching to earn 1 draw!'))
      }
    } catch (error) {
      hideLoading()
      log('fb_quiz_spin_fail')
      // 清除定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      console.log(error)
      showToast(t('Network error, please try again later'))
    }
  }

  const handleSpin = (isAd?: boolean) => {
    if (spinning) return
    if (isAd) {
      log('fb_quiz_spin_click', {
        type: 'ad'
      })
    } else {
      log('fb_quiz_spin_click', {
        type: 'free'
      })
    }
    setSpinning(true)
    setShowChoose(false)
    // 获取转盘中心元素
    const spinCenter = document.querySelector('.spin-center') as HTMLElement;
    const spinBg = document.querySelector('.spin-bg') as HTMLElement;
    const randomIndex = Math.floor(Math.random() * 10) * 60 + currentAngle + 720
    setCurrentAngle(randomIndex)
    spinBg.style.transition = 'transform 2s ease-in-out';
    spinBg.style.transform = `rotate(${randomIndex}deg)`;
    // 旋转指定角度，需要有动画效果
    spinCenter.style.transition = 'transform 2s ease-in-out';
    spinCenter.style.transform = `rotate(${randomIndex}deg)`;
    // 旋转后，选中的扇形区对应的label
    const selectedLabel = sections[(randomIndex / 60 % 6 === 0) ? 0 : 6 - (randomIndex / 60 % 6)];
    if (commonStore && typeof setDailyFreeResult === 'function') {
      setDailyFreeResult(selectedLabel.label)
    }
    // 优化后的闪烁效果
    const flashTimings = [2300, 2600, 2900, 3200, 3500, 3800, 4100];
    flashTimings.forEach((timing, index) => {
      setTimeout(() => {
        setShowChoose(index % 2 === 0); // 偶数索引显示，奇数索引隐藏
      }, timing);
    });
    setTimeout(() => {
      // if (commonStore && typeof setDailyFreeModalVisible === 'function') {
      //   setDailyFreeModalVisible(false)
      // }
      if (commonStore && typeof setDailyFreeResultModalVisible === 'function') {
        setDailyFreeResultModalVisible(true)
      }
      const currentDate = new Date().toISOString().split('T')[0]
      console.log('currentDate', currentDate)
      localStorage.setItem('spinDay', currentDate)
      setSpinCount(1)
      setSpinning(false)
    }, 5100)
  }

  const handleClose = () => {
    if (commonStore && typeof setDailyFreeModalVisible === 'function') {
      setDailyFreeModalVisible(false)
      log('fb_quiz_spin_close')
    }
  }

  return (
    <Modal
      isOpen={dailyFreeModalVisible}
      onClose={() => {
        if (commonStore && typeof setDailyFreeModalVisible === 'function') {
          setDailyFreeModalVisible(false)
        }
      }}
      className="max-w-lg"
    >
      <div className='w-[100vw] h-[100vh] relative'>
        <img src={BTN_CLOSE} alt="btn_close" className='w-[40px] h-[40px] absolute top-[20px] right-[20px]' onClick={handleClose}/>
        <div className='w-[330px] h-[68.5px] relative top-[50px] left-[50%] translate-x-[-50%]'>
          <div className='text-[#fff] text-center text-[20px] w-[100%] z-[20] absolute top-[13px]' style={{
            fontWeight: "900",
            textShadow: "-1px -1px 0 #6B0676, 1px -1px 0 #6B0676, -1px 1px 0 #6B0676, 1px 1px 0 #6B0676",
            fontFamily: "Roboto",
          }}>{t('Daily Free Test')}</div>
          <img src={TITLE_FLAG_BG} className='w-full h-full absolute top-[0px] left-[0px]' />
        </div>
        <div className='w-[279.4px] h-[279.4px] absolute top-[153.6px] left-[50%] translate-x-[-50%]'>
          <img src={SPIN_BG} alt="spin_bg" className='w-full h-full absolute top-[0px] left-[0px] spin-bg' />
          <div className='w-full h-full absolute top-[0px] left-[0px]'>
            <div className='w-[141px] h-[140px] absolute top-[0px] left-[50%] translate-x-[-50%] spin-select' style={{
              display: showChoose ? 'block' : 'none',
            }}>
              <img src={SPIN_SELECT} alt="spin_select" className='w-full h-full' />
            </div>
          </div>
          <div className='w-full h-full  spin-center'>
            <div className='w-full h-full relative'>
              {/* 各个扇形区域 */}
              {sections.map((section, index) => {
                const angle = (index * 60); // 每60度一个扇形，从-30度开始
                return (
                  <div
                    key={index}
                    className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-[59px] h-[70px] z-[99]"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-106%)`,
                    }}
                  >
                    <img src={section.icon} alt={section.label} className='w-[59px] h-[55.5px] mb-[-3px]' />
                    <div className='text-sm text-white font-medium text-center text-[9.5px] mt-[-5px]' style={{
                      textShadow: "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff",
                      fontWeight: "700",
                    }}>{t(section.label)}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <img src={SPIN_CENTER} alt="spin_select" className='w-[45.5px] h-[45.5px] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]'/>
        </div>
        <div className='w-[290px] h-[409px] absolute top-[120px] left-[50%] translate-x-[-50%]' onClick={spinCount === 1 ? undefined : () => handleSpin()}>
          <img src={SPIN_TOP} alt="spin_top" className='w-full h-full' />
        </div>
        {/* 两个按钮，一左一右，左边粉色，右边蓝色 */}
        <div className='w-[298px] h-[58.5px] absolute flex  justify-between flex-row top-[540px] left-[50%] translate-x-[-50%]'>
          <div className='w-[139px] h-full relative breathing-fast' style={{
            opacity: spinCount === 1 ? 0.6 : 1,
          }}  onClick={spinCount === 1 ? undefined : () => handleSpin()}> 
            <img src={BTN_PINK_NORMAL_BG} alt="btn_pink_normal_bg" className='h-full ' />
            <div className='text-[#fff] w-full text-center text-[14px] absolute left-[50%] translate-x-[-50%] top-[50%] translate-y-[-50%]' style={{
              fontWeight: "900",
              textShadow: "-1px -1px 0 #6B0676, 1px -1px 0 #6B0676, -1px 1px 0 #6B0676, 1px 1px 0 #6B0676",
              fontFamily: "Roboto",
            }}>{t('Start Spin')} ({spinCount}/1)</div>
          </div>
          <div className='w-[139px] h-full relative breathing-fast' onClick={spinning ? undefined : () => SpinAgain()}> 
            <img src={BTN_BLUE_NORMAL_BG} alt="btn_blue_normal_bg" className='h-full ' />
            <div className='text-[#fff] w-full absolute left-[50%] translate-x-[-50%] top-[50%] translate-y-[-50%] flex justify-center items-center' style={{
              fontWeight: "900",
              textShadow: "-1px -1px 0 #6B0676, 1px -1px 0 #6B0676, -1px 1px 0 #6B0676, 1px 1px 0 #6B0676",
              fontFamily: "Roboto",
            }}>
              <img src={IC_ADS_40} alt="ic_ads_40" className='w-[20px] h-[20px] ml-[16px] mr-[4px]' />
              <div className='flex-1  text-[14px] text-left'>{t('Try Again')}</div>
              <div className=' w-[129px] absolute bottom-[-50px] left-[50%] translate-x-[-50%] text-[10px] text-[#fff] text-center' style={{
                fontWeight: "600",
                textShadow: "none",
                fontFamily: "Roboto",
              }}>{t('Get a free test of your fortune today!')}</div>
            </div>
          </div>
        </div>
      </div>  
    </Modal>
  )
}

export default observer(DailyFree)