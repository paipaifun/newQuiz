import React, { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import { BASE_URL } from '../constant/module-data';
import AModule from './AModule';
import BModule from './BModule';
import CModule from './CModule';
import DModule from './DModule';
import EModule from './EModule';
import FModule from './FModule';
import GModule from './GModule';
import HModule from './HModule';
import IModule from './IModule';
import JModule from './JModule';
import KModule from './KModule';
import LModule from './LModule';
import MModule from './MModule';
import NModule from './NModule';
import OModule from './OModule';
import PModule from './PModule';
import QModule from './QModule';
import { log } from '../utils/firebase/firebase';
import { getUrlParamsByName } from '../utils/index';
import { gameStore } from '../stores/GameStore';
import { observer } from 'mobx-react-lite';
import { useI18n } from '../hooks/useI18n';
import { showAds } from '../utils/ads';
import { commonStore } from '../stores/CommonStore';

const ModuleEditor: React.FC<{name: string, currIdx: number, currData: any, avatar: string, setCurrImg: (img: string) => void}> = ({name, currIdx, currData, avatar, setCurrImg}) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const [bgStyle, setBgStyle] = useState<React.CSSProperties>({});
  const [imgSrc, setImgSrc] = useState('');
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [bgImageLoaded, setBgImageLoaded] = useState(false);
  const id = getUrlParamsByName('id');
  const { t } = useI18n();

  console.log(avatar, 'avatar....avatar')
  // console.log(window.FBInstant, 'window.FBInstant')

  // console.log(currData, 'currData');

  useEffect(() => {
    // console.log('currIdx', currIdx);
    setImgSrc('');
    setCurrImg('');
    setBgImageLoaded(false);
    setAvatarLoaded(false);
  }, [currIdx]);

  
  useEffect(() => {
    console.log('currData 123456789')
    log('fb_quiz_templ_export', {
      from: gameStore?.moduleFrom || '',
      type: currData?.module_type,
      id: currData?.img_name,
      code: currData?.isNew === '1' ? 'new' : currData?.isHot === '1' ? 'hot' : 'normal'
    })
    console.log('aImgSrc', 1);
    
    // 添加超时机制
    const timeout = 10000; // 10秒超时
    let avatarTimeout: NodeJS.Timeout;
    let bgTimeout: NodeJS.Timeout;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      clearTimeout(avatarTimeout);
      const containerWidth = 187.5;
      const containerHeight = 350;
      
      // 检查原图尺寸
      if (img.width === 0 || img.height === 0) {
        console.error('图片尺寸获取失败');
        setAvatarLoaded(true); // 即使失败也标记为已加载，避免卡住
        return;
      }
      
      const imgRatio = img.width / img.height;
      const containerRatio = containerWidth / containerHeight;
      
      console.log('图片比例:', imgRatio, '容器比例:', containerRatio);
      
      // 计算背景尺寸和位置
      let bgSize, bgPosition;
      
      if (imgRatio > containerRatio) {
        // 图片较宽，使用100% auto
        bgSize = 'auto 100%';
        bgPosition = 'center center';
      } else {
        // 图片较高，使用100% auto
        bgSize = '100% auto';
        bgPosition = 'center center';
      }
      
      console.log('背景样式:', bgSize, bgPosition);
      
      setBgStyle({
        backgroundImage: `url(${avatar})`,
        backgroundSize: bgSize,
        backgroundPosition: bgPosition,
        backgroundRepeat: 'no-repeat'
      });
      
      // 标记头像图片已加载
      setAvatarLoaded(true);
    };
    img.onerror = (err) => {
      clearTimeout(avatarTimeout);
      console.error('头像图片加载失败:', err);
      // 即使失败也标记为已加载，避免卡住
      setAvatarLoaded(true);
    };
    
    // 设置超时
    avatarTimeout = setTimeout(() => {
      console.error('头像图片加载超时');
      setAvatarLoaded(true);
    }, timeout);
    
    img.src = avatar;

    // 预加载背景图片
    const bImg = new Image();
    bImg.crossOrigin = "anonymous";
    bImg.onload = () => {
      clearTimeout(bgTimeout);
      setBgImageLoaded(true);
    };
    bImg.onerror = (err) => {
      clearTimeout(bgTimeout);
      console.error('背景图片加载失败:', err);
      // 即使失败也标记为已加载，避免卡住
      setBgImageLoaded(true);
    };
    
    // 设置超时
    bgTimeout = setTimeout(() => {
      console.error('背景图片加载超时');
      setBgImageLoaded(true);
    }, timeout);
    
    bImg.src = `${BASE_URL}${currData?.img_name}_${currIdx}.jpg?alt=media`

    // 清理函数
    return () => {
      clearTimeout(avatarTimeout);
      clearTimeout(bgTimeout);
    };
  }, [avatar, currData, currIdx]);

  const rem2px = (rem: number) => {
    return rem * 16;
  }

  const handleCapture = async () => {
    if (!targetRef.current) return;
    
    const maxRetries = 3;
    const retryDelay = 100;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 截取整个targetRef元素
        const canvas = await html2canvas(targetRef.current, {
          useCORS: true,
          scale: 2,
          logging: true,
          backgroundColor: null
        });
        console.log('截图成功');
        // 输出图片
        const image = canvas.toDataURL('image/png');
        // 打印 image 大小 KB
        console.log('image size', image.length / 1024);
        setImgSrc(image);
        setCurrImg(image);
        const container = document.getElementById('details-container');
        const editorContainer = document.getElementById('editor-container');
        const navBar = document.getElementById('nav-bar');
        console.log('editorContainer', container, editorContainer, navBar)
        const editorContainerTop = editorContainer?.offsetTop || 0;
        const navBarHeight = navBar?.getBoundingClientRect().height || 0;
        console.log('editorContainerTop', editorContainerTop, navBarHeight)
        if (container) {
          // 滚动到距离顶部200px的位置
          container.scrollTo({
            top: editorContainerTop - navBarHeight,
            behavior: 'instant'
          });

          setTimeout(() => {
            showAds('module_show')
          }, 1000);
        }
        // 成功则退出重试循环
        return;
      } catch (error) {
        console.error(`截图失败 (第${attempt}次尝试):`, error);
        
        if (attempt === maxRetries) {
          // 最后一次尝试失败，记录日志
          log('fb_quiz_templ_fail', {
            from: gameStore.moduleFrom,
            type: currData?.module_type,
            id: currData?.img_name,
            code: currData?.isNew === '1' ? 'new' : currData?.isHot === '1' ? 'hot' : 'normal'
          });
          console.error('截图最终失败，已重试3次');
        } else {
          // 等待100ms后重试
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
  };


  useEffect(() => {
    console.log('bgImageLoaded', bgImageLoaded);
    console.log('avatarLoaded', avatarLoaded);
    if (bgImageLoaded && avatarLoaded) {
      console.log('所有图片加载完成，开始截图');
      const timer = setTimeout(() => {
        handleCapture();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [bgImageLoaded, avatarLoaded]);

  const needTranslateList = ['F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'Q']

  const getText = (currIdx: number) => {
    if (needTranslateList.includes(currData?.module_type)) {
      return currData?.[`text${currIdx}`];
    }
    return '';
  }

  const getSplitText = (text: string) => {
    const splitText = text?.split('||||');
    const text1 = splitText?.[0];
    const text2 = splitText?.[1];
    return { text1, text2 };
  }

  const renderModule = () => {
    switch (currData?.module_type) {
      case 'A':
        return <AModule bgStyle={bgStyle} cropContainerRef={cropContainerRef} />;
      case 'B':
        return <BModule bgStyle={bgStyle} cropContainerRef={cropContainerRef} />;
      case 'C':
        return <CModule bgStyle={bgStyle} cropContainerRef={cropContainerRef} />;
      case 'D':
        return <DModule bgStyle={bgStyle} cropContainerRef={cropContainerRef} />;
      case 'E':
        return <EModule bgStyle={bgStyle} cropContainerRef={cropContainerRef} name={name} />;
      case 'F':
        return <FModule bgStyle={bgStyle} cropContainerRef={cropContainerRef} name={name} text={t(getText(currIdx))}/>;
      case 'G':
        return <GModule bgStyle={bgStyle} cropContainerRef={cropContainerRef} name={name} text={t(getText(currIdx))}/>;
      case 'H':
        return <HModule bgStyle={bgStyle} cropContainerRef={cropContainerRef} name={name} text={t(getText(currIdx))}/>;
      case 'I':
        return <IModule bgStyle={bgStyle} cropContainerRef={cropContainerRef} name={name} text={t(getText(currIdx))}/>;
      case 'J':
        return <JModule bgStyle={bgStyle} cropContainerRef={cropContainerRef} name={name} text={t(getText(currIdx))}/>;
      case 'K':
        return <KModule bgStyle={bgStyle} cropContainerRef={cropContainerRef} name={name} text={t(getText(currIdx))}/>;
      case 'L':
        return <LModule bgStyle={bgStyle} cropContainerRef={cropContainerRef} name={name} text={t(getText(currIdx))}/>;
      case 'M':
        return <MModule text={t(getText(currIdx))}/>;
      case 'N':
        return <NModule text1={t(getSplitText(getText(currIdx))?.text1)} text2={t(getSplitText(getText(currIdx))?.text2)} />;
      case 'O':
        return <OModule text={t(getText(currIdx))}/>;
      case 'P':
        return <PModule bgStyle={bgStyle} cropContainerRef={cropContainerRef} name={name} text={commonStore.currInput}/>;
      case 'Q':
        return <QModule text1={commonStore.currInput} text2={t(getSplitText(getText(currIdx))?.text2)} />;
      default:
        return null;
    }
  }


  return (
    <>    
      {imgSrc && <img src={imgSrc} alt="Left Arrow" className="w-[375px] h-[470px] relative" />}
      {!imgSrc && 
        <div className={`w-[375px] h-[470px] relative animated-gradient-halo mb-[5px]`}>
          <div className="absolute inset-0 left-[50%] translate-x-[-50%] top-[50%] translate-y-[-50%]">
            <span className="typewriter text-[20px] font-bold flex items-center justify-center text-[#fff]" style={{
              fontWeight: 600
            }}>{t('Don\'t blink…')}</span>
          </div>
        </div>
      }
      {!imgSrc && <div className='absolute top-[-9999px] left-[-9999px] w-[375px] h-[470px]'>
        <div 
          className="w-[375px] h-[470px] relative animated-gradient" 
          id='test' 
          ref={targetRef}
        >
          {renderModule()}
          <img 
            src={`${BASE_URL}${currData?.img_name}_${currIdx}.jpg?alt=media`} 
            alt="Left Arrow" 
            className="w-[375px] h-[470px]" 
          />
        </div>
      </div>}
    </>
  );
};

export default observer(ModuleEditor);