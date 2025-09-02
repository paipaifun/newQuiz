import React, { useState, useEffect, useRef } from 'react';
import TITLE_LOGO from '../assets/img/title_logo.png';
import BTN_LANGUAGE from '../assets/img/btn_language.png';
import BTN_SHARE from '../assets/img/btn_share.png';
import BTN_PINK_BG from '../assets/img/btn_pink_bg.png';
import { commonStore } from '../stores/CommonStore';
import { useNavigate } from 'react-router-dom';
import SHARE_IMG from '../assets/img/share_img.jpg';
import { log } from '../utils/firebase/firebase';
import { useI18n } from '../hooks/useI18n';
import BTN_SPIN from '../assets/img/btn_spin.png';
import RED_POINT from '../assets/img/red_point.png';
import { networkStatusManager, NetworkStatus } from '../hooks/useNetwork';
import { showToast } from './Toast';


const NavBar: React.FC = () => {
  const [shareImgBase64, setShareImgBase64] = useState('');
  const [redPointRotate, setRedPointRotate] = useState(0);
  const navigate = useNavigate();
  const { t } = useI18n();
  const timer = useRef<NodeJS.Timeout | null>(null);

  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(networkStatusManager.getStatus())

  useEffect(() => {
    console.log('networkStatus', networkStatus)
    if (!networkStatus.isOnline === true) {
      showToast(t('Network error. Please check your connection and try again.'))
    }
  }, [networkStatus.lastUpdated])
  useEffect(() => {
    // 添加监听器并获取取消监听的函数
    const unsubscribe = networkStatusManager.addListener(setNetworkStatus)

    // 组件卸载时取消监听
    return unsubscribe
  }, [])

  useEffect(() => {
    handleJPGToBase64();
  }, []);

  useEffect(() => {
    if(timer.current) {
      clearInterval(timer.current);
    }
    const redPoint = document.querySelector('.red_point');
    if (redPoint && redPoint instanceof HTMLElement) {
      timer.current = setInterval(() => {
        redPoint.style.transform = `rotate(${redPointRotate + 720}deg)`;
        redPoint.style.transition = 'transform 0.5s ease-in-out';
        redPoint.style.transformOrigin = 'center';
        setRedPointRotate(redPointRotate + 720);
      }, 5000);
    }
    return () => {
      if(timer.current) {
        clearInterval(timer.current);
      }
    }
  }, [redPointRotate]);

  const handleLanguageClick = () => {
    console.log('handleLanguageClick');
    log('fb_quiz_top_language')
    commonStore.setIsLangsModalVisible(true);
  }

  const handleJPGToBase64 = async () => {
    const img = new Image();
    img.src = SHARE_IMG;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg');
      setShareImgBase64(base64);
    }
  }

  const backHome = () => {
    // window.location.href = '/';
    navigate('/');
  }

  const handleShareClick = async () => {
    console.log('shareImgBase64', shareImgBase64);
    log('fb_quiz_share_click', {
      from: 'top_banner',
      id: '',
    })
    
    log('fb_quiz_share_show', {
      from: 'top_banner',
      id: 'top_banner',
    })
    
    window.FBInstant.shareAsync({
      intent: 'INVITE',
      image: shareImgBase64,
      text: '',
      data: {
        fromUser: window.FBInstant.player.getID(),
      },
    }).then(() => {
      console.log('share success');
      log('fb_quiz_share_share', {
        from: 'top_banner',
        id: 'top_banner',
      })
    })
  } 

  const handleInstructionClick = () => {
    log('fb_quiz_top_tutorial')
    log('fb_quiz_tutorial_show')
    commonStore.setIsInstructionModalVisible(true);
  }

  const handleSpinClick = () => {
    console.log('handleSpinClick')
    log('fb_quiz_spin_show', {
      from: 'top_banner'
    })
    commonStore.setDailyFreeModalVisible(true);
  }

  return (
    <div className="w-[100vw] h-[50px] z-10 absolute top-0 left-0 bg-[#000]" id="nav-bar">
      <img src={TITLE_LOGO} alt="title_logo" className="w-[84px] h-[30px] absolute top-[10px] left-[7px]" onClick={backHome}/>
      <div className="flex flex-row-reverse w-[230px] h-[38px] absolute top-[0px] right-[5px]">
        <img src={BTN_SHARE} alt="btn_share" className="w-[38px] h-[38px] mt-[6px] mr-[5px]" onClick={handleShareClick}/>

        <img src={BTN_LANGUAGE} alt="btn_language" className="w-[38px] h-[38px] mt-[6px] mr-[6px]" onClick={handleLanguageClick} />
        {
          commonStore.localeInited && !commonStore.isPtUser && <div className="w-[82.5px] h-[41px] mr-[5px] top-[3.5px] relative left-[-0px]" onClick={handleInstructionClick}>
            <img src={BTN_PINK_BG} alt="btn_pink_bg" className="w-[82.5px] h-[41px] absolute top-[0px] left-[0px]" />
            <div className="w-[82.5px] h-[41px] absolute top-[0px] left-[0px] flex items-center justify-center">
              <span className="text-[15px] text-[#fff] Roboto" style={{
                fontWeight: '600',
                textShadow: '0px 2px 0px #000000'
              }}>{t('Guide')}</span>
            </div>
          </div>
        }
        <div className="w-[37px] h-[37px] relative mr-[5px]">
          <img src={BTN_SPIN} alt="btn_spin" className="w-[37px] h-[37px] mt-[6px] mr-[6px] red_point" onClick={handleSpinClick} />
          <img src={RED_POINT} alt="red_point" className="w-[12px] h-[12px] absolute top-[4px] right-[0px]" />
        </div>
      </div>
    </div>
  );
};

export default NavBar; 