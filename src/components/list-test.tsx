import React, { useState, useEffect } from 'react';
import HOT from '../assets/img/hot.png';
import NEW from '../assets/img/new.png';
// import { moduleData } from '../constant/module-data';
import { useNavigate } from 'react-router-dom';
import { useIntersectionObserver } from '../hooks/useObserver'
import { log } from '../utils/firebase/firebase'
import { getUrlParamsByName } from '../utils/index'
import { gameStore } from '../stores/GameStore'
import { observer } from 'mobx-react-lite'
// import { AdProxy } from '../utils/ads_new'
import { showAds } from '../utils/ads'
import COVER_LOADING from '../assets/img/cover_loading.jpg'
import { useI18n } from '../hooks/useI18n'
import { commonStore } from '../stores/CommonStore'

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

const List: React.FC<{rerender?: () => void, containerId?: string}> = ({rerender, containerId}) => {
  const navigate = useNavigate();
  const id = getUrlParamsByName('id');
  const [_moduleData, setModuleData] = useState((commonStore?.moduleData || []).sort((a: any, b: any) => a.sort - b.sort));
  const { t } = useI18n();

  useEffect(() => {
    // console.log('commonStore.moduleData', commonStore.moduleData);
    if (commonStore?.moduleData) {
      setModuleData(commonStore.moduleData.sort((a: any, b: any) => a.sort - b.sort));
    }
  }, [commonStore?.moduleData]);

  // // 主卡片曝光上报
  // const [mainObserverRef] = useIntersectionObserver({
  //   once: true,
  //   onVisible: () => {
  //     const item = _moduleData[0];
  //     log('fb_quiz_templ_show', {
  //       from: id ? 'temp_result' : 'home_feed',
  //       type: item.module_type,
  //       id: item.img_name,
  //       code: item.isNew === '1' ? 'new' : item.isHot === '1' ? 'hot' : 'normal'
  //     })
  //   },
  // });

  useEffect(() => {
    // 将 gameStore.clicked_module_id 排序移到最后，其他保持不变
    const clicked_module_id = gameStore.clicked_module_id;
    if (commonStore?.moduleData) {
      const newModuleData = commonStore.moduleData.filter((item: any) => !clicked_module_id.includes(item.img_name));
      const clickedItems = commonStore.moduleData.filter((item: any) => clicked_module_id.includes(item.img_name));
      setModuleData([...newModuleData.sort((a: any, b: any) => a.sort - b.sort), ...clickedItems]);
    }
  }, [gameStore.clicked_module_id?.length, commonStore?.moduleData]);
  
  const handleClick = (item: any) => {
    // AdProxy.showCommonAd('module_click')
    showAds('module_click')
    gameStore.addClickedModuleId(item.img_name);
    log('fb_quiz_templ_click', {
      from: id ? 'temp_result' : 'home_feed',
      type: item.module_type,
      id: item.img_name,
      code: item.isNew === '1' ? 'new' : item.isHot === '1' ? 'hot' : 'normal'
    })
    gameStore.setModuleFrom(id ? 'temp_result' : 'home_feed');
    if (item.interaction_type) {
      navigate(`/interaction_details?id=${item.img_name}&interaction_type=${item.interaction_type}`);
    } else {
      navigate(`/details?id=${item.img_name}`);
    }
    log('fb_quiz_card_unlock_suc', {
      id: item.img_name,
      amount: JSON.parse(localStorage.getItem(item.img_name) || '[false, false, false, false]').filter((item: boolean) => item).length + 1,
      type: rerender ? 'detail_click' : 'home_click'
    })
    if(rerender) {
      rerender();
      const container = document.getElementById(containerId || '');
      if(container) {
        container.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        // setTimeout(() => {
        //   showAds('module_show')
        // }, 1000);
      }
    }
  }

  return(
    <div className="w-[calc(100vw-10px)] flex flex-row flex-wrap">
      {_moduleData.map((item: any, index: number) => (
        <Item key={item.img_name} item={item} index={index} handleClick={() => handleClick(item)}/>
        ))}
    </div>
  )
};

const Item = ({item, index, handleClick}: {item: any, index: number, handleClick: () => void}) => {
  const id = getUrlParamsByName('id');
  const { t } = useI18n();
  const [itemWidth, setItemWidth] = useState(48);

  const [observerRef] = useIntersectionObserver({
    once: true,
    onVisible: () => {
      log('fb_quiz_templ_show', {
        from: id ? 'temp_result' : 'home_feed',
        type: item.module_type,
        id: item.img_name,
        code: item.isNew === '1' ? 'new' : item.isHot === '1' ? 'hot' : 'normal'
      })
    },
  })

  // 监听屏幕变化时，打印id为nav-bar的元素宽度
  useEffect(() => {
    const handleResize = () => {
      const bodyWidth = document.body.clientWidth;
      console.log(bodyWidth, 'bodyWidth');
      if(bodyWidth <= 235) {
        setItemWidth(47.4);
      } else if(bodyWidth <= 288) {
        setItemWidth(47.6);
      } else if (bodyWidth < 375) {
        setItemWidth(47.8);
      } else {
        setItemWidth(48);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div ref={observerRef as any} className={`h-[235px] w-full bg-[#fff] rounded-[8px] mb-[5px] mr-[5px] overflow-hidden relative`} style={{
    marginRight: '0px',
    boxShadow: '0px 2px 6px 0px #00000033',
  }} onClick={handleClick}>
    <LazyImage
      src={item.cover}
      className="w-[100%] h-[170px]"
      style={{
        borderRadius: '8px 8px 0px 0px'
      }}
    />
    <div className="w-[calc(100%)] h-[60px] leading-[24px] px-[12.5px] py-[9px] text-left font-semibold text-[20px] box-border flex items-center" style={{
      display: '-webkit-box',
      WebkitLineClamp: '2',
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      fontWeight: 600,
      fontFamily: 'Roboto'
    }}>
      {t(item.title)}
    </div>
    {item.isHot === '1' && <img src={HOT} alt="hot" className="w-[30px] h-[30px] absolute top-[5px] left-[5px]" />}
    {item.isNew === '1' && <img src={NEW} alt="new" className="w-[40px] h-[30px] absolute top-[5px] left-[5px]" />}
  </div>
}

export default observer(List);
