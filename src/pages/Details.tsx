import React, { useEffect, useState, useRef } from 'react';
import HEADER_IMG from '../assets/img/header.png';
import { getUrlParamsByName } from '../utils';
import { moduleData } from '../constant/module-data';
import BTN_SHARE_BG from '../assets/img/btn_share_bg.png';
import ModuleEditor from '../components/ModuleEditor';
import FB_ICON from '../assets/img/fb_icon.png';
import List from '../components/list';

import CARD_HIDE from '../assets/img/card_hide.png';
import CARD_LOCK from '../assets/img/card_lock.png';
import CARD_OPEN from '../assets/img/card_open.png';
import IC_HIDE_STAR from '../assets/img/ic_hide_star.png';

import BTN_PINK_BG_1 from '../assets/img/btn_pink_bg_1.png';
import BTN_SHARE_BG_1 from '../assets/img/btn_share_bg_1.png';
import ListTest from '../components/list-test';
import LINE3 from '../assets/img/line3.png';
import { useNavigate } from 'react-router-dom';
import { gameStore } from '../stores/GameStore';
import { log } from '../utils/firebase/firebase';
import { showAds, showBanner, showRewardVideoAd } from '../utils/ads';


// import { AdProxy } from '../utils/ads_new';

import { useI18n } from '../hooks/useI18n';
import NavBar from '../components/NavBar';
import CARD_BOX from '../assets/img/card_box.png';
import TIPS_BG from '../assets/img/tips_bg.png';
import IC_ADS from '../assets/img/ic_ads.png';
import { showLoading, hideLoading } from '../components/Model/Loading';
import { commonStore } from '../stores/CommonStore';
import { showToast } from '../components/Toast';
import { observer } from 'mobx-react-lite';

import SHARE_BTN from '../assets/img/btn_share.png';
import BTN_PINK_BG_2 from '../assets/img/btn_pink_bg_2.png';
import BTN_RETRY from '../assets/img/btn_retry.png';
import IC_ARROW from '../assets/img/ic_arrow.png';

import { debounce } from 'lodash';

const Details: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const getRandomNonTrueIndex = (arr: boolean[]) => {
    // 过滤出所有不是 true 的项的下标
    const nonTrueIndices = arr.reduce((indices: number[], item: boolean, index: number) => {
      if (item !== true) {
        indices.push(index);
      }
      return indices;
    }, []);
    
    // 如果没有非 true 的项，返回 null
    if (nonTrueIndices.length === 0) {
      return Math.floor(Math.random() * 4);
    }
    
    // 随机选择一个非 true 项的下标
    const randomIndex = Math.floor(Math.random() * nonTrueIndices.length);
    console.log(nonTrueIndices[randomIndex], 'nonTrueIndices[randomIndex]', arr)
    return nonTrueIndices[randomIndex];
  }
  

  const [currData, setCurrData] = useState<any>(null);
  const [currIdx, setCurrIdx] = useState<number>(1);
  const [avatar, setAvatar] = useState<string>('');
  const [currImg, setCurrImg] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [retryCount, setRetryCount] = useState<number>(0);
  const [textIndex, setTextIndex] = useState<number>(0);
  const id = getUrlParamsByName('id');
  const [showUnlockTips, setShowUnlockTips] = useState<boolean>(false);
  const [unlock, setUnlock] = useState<boolean>(false);
  const [showUnlock, setShowUnlock] = useState<boolean>(true);

  const [cardList, setCardList] = useState<boolean[]>([false, false, false, false]);
  const [hideCard, setHideCard] = useState<boolean>(false);


  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 简单的滚动状态管理，配合CSS实现透明度渐变
  const handleScroll = () => {
    const cardBox = document.getElementById('details-card-box')
    cardBox?.classList.add('scrolling')
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      console.log('remove scrolling')
      cardBox?.classList.remove('scrolling')
    }, 200)
  }


  useEffect(() => {
    // if (commonStore.isShowedDailyFree) {
    //   return
    // }
    // log('fb_quiz_spin_show', {
    //   from: 'auto'
    // })
    // commonStore.setDailyFreeModalVisible(true)
    // commonStore.setIsShowedDailyFree(true)
  }, [])

  useEffect(() => {
    const detailsPage = document.getElementById('details-container')
    if (detailsPage) {
      detailsPage.addEventListener('scroll', handleScroll, { passive: true })
    }
    return () => {
      if (detailsPage) {
        detailsPage.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])


  // 页面滚动的时候 details-card-box 加上透明度，滚动结束的时候 details-card-box 恢复透明度
  // 滚动结束的时候，500ms后恢复透明度



  useEffect(() => {
    if (!currImg) {
      return
    }
    if (currImg && currIdx === 5) {
      setHideCard(true)
      return
    }
    const newCardList = [...cardList]
    const currCardListState = cardList.filter((item: boolean) => item).length
    newCardList[currIdx - 1] = true
    const newCardListState = newCardList.filter((item: boolean) => item).length
    if (newCardListState === 4 &&  currCardListState === 3) {
      log('fb_quiz_card_unlock_all', {
        id: currData?.img_name,
      })
    }
    setCardList(newCardList)
    // const cardListStr = JSON.stringify(newCardList)
    localStorage.setItem(currData?.img_name, JSON.stringify(newCardList))


  }, [currIdx, currImg])



  useEffect(() => {
    fetchAvatar()
    // AdProxy.showBannerAd('details')
    showBanner('details')
    console.log(showUnlockTips, 'showUnlockTips')
    setShowUnlockTips(true)
    // const isInstructionModalVisible = localStorage.getItem('isInstructionModalVisible')
    // if (isInstructionModalVisible !== 'true' && commonStore.localeInited && !commonStore.isPtUser) {
    //   commonStore.setIsInstructionModalVisible(true);
    //   localStorage.setItem('isInstructionModalVisible', 'true')
    // }
    setTimeout(() => {
      setShowUnlockTips(false)
      commonStore.setShowUnlockTips(true)
    }, 5000)
  }, [])

  useEffect(() => {
    setHideCard(false)
    setCardList([false, false, false, false])
    const data = moduleData.find((item: any) => item.img_name === id);
    const cardList = localStorage.getItem(data?.img_name || '') || '[false, false, false, false]'
    const newCardList = JSON.parse(cardList)
    setCardList(newCardList)
    setCurrData(data);
    const randomIndex = getRandomNonTrueIndex(newCardList) + 1
    setCurrIdx(randomIndex)
    const hideCard = localStorage.getItem(`${data?.img_name}_hide`)
    console.log(hideCard, 'hideCard')
    if (hideCard === 'true') {
      setHideCard(true)
    }
    // console.log('A 触发')
    // console.log(randomIndex, newCardList[randomIndex], 'newCardList[randomIndex]')
    // if (newCardList[randomIndex] === false) {
    //   console.log('B 触发')
      // log('fb_quiz_card_unlock_suc', {
      //   id: currData?.img_name || data?.img_name || getUrlParamsByName('id'),
      //   amount: newCardList.filter((item: boolean) => item).length + 1,
      //   type: commonStore.type
      // })
    // }
    // console.log(data?.img_name, 'hideCard')
    log('fb_quiz_card_show', {
      // id（模板原图名），例如female_test_love1
      id: data?.img_name,
    })
  }, [id]);

  // 文本轮播效果
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % 2);
    }, 3000); // 每3秒切换一次
    return () => clearInterval(interval);
  }, []);



  const handleRefresh = () => {
    if (!currImg) {
      return;
    }
    const cardList = localStorage.getItem(currData?.img_name || '') || '[false, false, false, false]'
    const newCardList = JSON.parse(cardList)
    const randomIndex = getRandomNonTrueIndex(newCardList)
    console.log(randomIndex + 1, 'randomIndex')
    // if (newCardList[randomIndex] === false) {
    //   console.log('B 触发')
    //   log('fb_quiz_card_unlock_suc', {
    //     id: currData?.img_name,
    //     amount: newCardList.filter((item: boolean) => item).length + 1,
    //     type: commonStore.type
    //   })
    // }
    setCurrIdx(randomIndex + 1)
  }


  const handleShare = () => {
    if (!currImg) {
      return
    }
    log('fb_quiz_share_click', {
      from: gameStore.moduleFrom,
      type: currData?.module_type,
      id: currData?.img_name,
    })
    if (!currImg) {
      return;
    }
    log('fb_quiz_share_show', {
      from: gameStore.moduleFrom,
      type: currData?.module_type,
      id: currData?.img_name,
    })
    console.log(currImg, 'currImg')
    window.FBInstant.shareAsync({
      intent: 'INVITE',
      image: currImg,
      text: '',
      data: {
        fromUser: window.FBInstant.player.getID(),
      },
    }).then(() => {
      console.log('share success');
      log('fb_quiz_share_share', {
        from: gameStore.moduleFrom,
        type: currData?.module_type,
        id: currData?.img_name,
      })
      
    })
  }

  const fetchAvatar = async () => {
    // window.onFBGameStarted()
    console.log(window.FBInstant, 'window.FBInstant')
    const avatar = window.FBInstant.player.getPhoto() || '123456789'
    const name = window.FBInstant.player.getName() || 'QUIZ'
    console.log(avatar, 'avatar', name, 'name')
    setAvatar(avatar)
    setName(name)
  }

  const handleWatchAdToUnlock = async () => {
    if (!currImg) {
      return
    }
    showLoading()
    
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    // 设置新的定时器
    timeoutRef.current = setTimeout(() => {
      hideLoading()
      timeoutRef.current = null
    }, 8000)

    try {
      // const adRes = await AdProxy.showRewardAd('watch_ad_to_unlock')
      const adRes = await showRewardVideoAd('watch_ad_to_unlock')
      hideLoading()
      // 清除定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      if (adRes) {
        showToast(t('Card Unlocked'))
        setCurrImg('')
        setCurrIdx(5)
        localStorage.setItem(`${currData?.img_name}_hide`, 'true')
        log('fb_quiz_hide_unlock_suc', {
          id: currData?.img_name,
          type: 'ad_click'
        })
      } else {
        log('fb_quiz_hide_unlock_fail', {
          id: currData?.img_name,
        })
        showToast(t('Keep watching—the hidden card unlocks after the full ad!'))
      }
    } catch (error) {
      log('fb_quiz_hide_unlock_fail', {
        id: currData?.img_name,
      })
      hideLoading()
      // 清除定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      console.log(error)
      showToast(t('Network error, please try again later'))
    }
  }


  return (
    <div className="w-[100vw] h-[100vh] fixed top-0 left-0 z-0">
      {/* <Loading /> */}
      <NavBar />
      <div className="w-[100vw] h-[calc(100vh-30px)] z-10 bg-[#f2f4f7] mt-[50px] pt-[12.5px] pb-[60px] box-border overflow-y-auto scrollbar-hide" id="details-container">
        <div style={{
          minHeight: '84px'
        }}>
          {/* #标签 */}
          <div className="w-[calc(100%-20px)] h-[15px] mb-[5px] mx-[10px] text-[#1765FF] text-[13px] leading-[15px]" style={{
            fontWeight: 600
          }}>
            {/* #Prediction */}
            #{t(currData?.tab)}
          </div>
          {/* 标题 */}
          <div className="w-[calc(100%-20px)] mx-[10px] mb-[5px] text-[#000] text-[17px] leading-[20px]"
            style={{
              fontWeight: '600'
            }}
          >
            {t(currData?.title)}
          </div>
          {/* 副标题 */}
          <div className="w-[calc(100%-20px)] mx-[10px] mb-[4px] text-[#787878] text-[12px] leading-[14px]">
            {t(currData?.subtitle)}
          </div>
        </div>
        <div id="editor-container" onClick={() => {
          handleShare()
        }}>
          {currData && <ModuleEditor name={name} currIdx={currIdx} currData={currData} avatar={avatar} setCurrImg={setCurrImg}/>}
        </div>
        <div className='flex flex-row items-center justify-center text-[14px] mt-[4px] mb-[6px] underline' style={{
          color: '#EA48FF',
          fontWeight: 700,
        }}
        onClick={() => {
          log('fb_quiz_spin_show', {
            from: 'result_page'
          })
          commonStore.setDailyFreeModalVisible(true)
        }}
        >
          {t(`🔮How's your fortune today?`)}
          <img src={IC_ARROW} alt="" className="w-[10px] h-[10px] ml-[2px]" />
        </div>
        {
          commonStore.localeInited && !commonStore.isPtUser ? <div className="relative w-[330px] h-[55px] mx-auto mt-[0px]" >
            <img src={BTN_SHARE_BG} alt="" className="absolute top-[0px] left-[0px] w-[330px] h-[55px]" onClick={handleShare} style={{
              cursor: currImg ? 'pointer' : 'default',
              opacity: currImg ? 1 : 0.5
            }} />
            <div style={{
              cursor: currImg ? 'pointer' : 'default',
              opacity: currImg ? 1 : 0.5
            }} className='flex flex-row items-center justify-center' onClick={handleShare}>
              <img src={FB_ICON} alt="" className="w-[25px] h-[25px] mr-[2px] z-10 mt-[0px]" />
              <div className="h-[50px] leading-[51px] text-center text-[#fff] text-[17px] z-10" style={{
                fontWeight: '600',
                textShadow: '0px 2px 0px #000000'
              }}>
                {t('share')}
              </div>
            </div>
          </div> :
          <>
            <div className="w-[330px] h-[55px] mx-auto mt-[0px] text-[12px] text-[#787878] text-center leading-[14px]" style={{
              fontWeight: 700,
              fontFamily: 'Roboto',
            }}>
              
              <div className='w-[330px] h-[55px] relative flex flex-row justify-center mt-[4px]'>
                <div className='w-[170px] h-[36.5px] flex flex-row items-center justify-center mr-[30px]' onClick={handleShare}>
                  <img src={BTN_SHARE_BG_1} alt="" className='w-[170px] h-[36.5px] absolute' />
                  <div className='text-[16px] text-[#fff] text-center z-10 absolute ' style={{
                    fontWeight: 700,
                    fontFamily: 'Roboto',
                    textShadow: '0px 2px 0px #000000'
                  }}>{t('share')}</div>
                </div>
                <div className='w-[170px] h-[36.5px] flex flex-row items-center justify-center breathing-fast' onClick={() => {
                  console.log('retry')
                  if (!currImg) {
                    return
                  }
                  showAds('retry') 
                  // AdProxy.showCommonAd('retry') 
                  setCurrImg('')
                  setRetryCount(retryCount + 1)
                  commonStore.setType('retry')
                  log('fb_quiz_templ_retry', {
                    from: gameStore.moduleFrom,
                    type: currData?.module_type,
                    id: currData?.img_name,
                    code: currData?.isNew === '1' ? 'new' : currData?.isHot === '1' ? 'hot' : 'normal',
                    amount: currIdx
                  })
                  handleRefresh() 
                }}> 
                  <img src={BTN_PINK_BG_1} alt="" className='w-[170px] h-[36.5px] absolute' />
                  <div className='text-[16px] text-[#fff] text-center z-10' style={{
                    fontWeight: 700,
                    fontFamily: 'Roboto',
                    textShadow: '0px 2px 0px #000000'
                  }}>{t('retry')}</div>
                </div>
              </div>
            </div>
          </>
        }
        <img src={LINE3} alt="" className="w-[100%] h-[1px] mt-[10px]" />
        <div className="w-[100vw] z-10 bg-[#f2f4f7] mt-[15px] px-[5px] pb-[60px] box-border overflow-y-auto scrollbar-hide">
          <div className="w-[100%] text-[#000] text-[17.5px] leading-[16px] font-semibold mb-[8px]" style={{
            fontWeight: 700
          }}>
            {t('More meme for you')}
          </div>
          

          {commonStore.isTestListCountry && <ListTest rerender={() => {
            setCurrImg('')
            handleRefresh()
            // setTimeout(() => {
            //   handleScrollEnd()
            // }, 200);
          }} containerId="details-container" />}
          {!commonStore.isTestListCountry && <List rerender={() => {
            setCurrImg('')
            handleRefresh()
            // setTimeout(() => {
            //   handleScrollEnd()
            // }, 200);
          }} containerId="details-container" />}
        </div>
      </div>
        {
          commonStore.localeInited && !commonStore.isPtUser && <div id="details-card-box" className='fixed bottom-[88px] left-[50%] translate-x-[-50%] w-[360px] h-[150px] z-10 scroll-fade-card' style={{
            backgroundImage: `url(${CARD_BOX})`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}>
            <div className='w-[100%] text-[12px] mt-[6px] text-[#fff] text-center' style={{
              fontWeight: 700,
              fontFamily: 'Roboto',
            }}>
              {t('Not satisfied with this result? Click Retry ⬇️')}
            </div>
            <div className='w-[100%] flex flex-row h-[69.5px] mt-[6px]'>
    
              <div className='w-[293.5px] flex flex-row items-center justify-center ml-[33.5px] mt-[2.5px]'>
                
                {
                  cardList.map((item, index) => {
                    return (
                      <div key={index} className='w-[50px] h-[65px] mr-[7px] relative' style={{
                        opacity: currImg ? 1 : 0.5
                      }} onClick={() => {
                        if (!currImg) {
                          return
                        }
                        if (index + 1 === currIdx) {
                          return
                        }
                        // AdProxy.showCommonAd('card')
                        showAds('card')
                        setCurrImg('')
                        setCurrIdx(index + 1)
                        if (!cardList[index]) {
                          log('fb_quiz_card_unlock', {
                            id: currData?.img_name,
                            amount: cardList.filter((item: boolean) => item).length + 1
                          })
                          log('fb_quiz_card_unlock_suc', {
                            id: currData?.img_name,
                            amount: cardList.filter((item: boolean) => item).length + 1,
                            type: 'ad_click'
                          })
                        }
    
                        // setTimeout(() => {
                        // }, 3000);
                        
    
                      }}>
                        <div 
                          className='w-[100%] h-[100%] relative'
                          style={{
                            transformStyle: 'preserve-3d',
                            transition: 'transform 0.6s ease-in-out'
                          }}
                        >
                          {/* 背面 - 锁定状态 */}
                          <div 
                            className='w-[100%] h-[100%] absolute'
                            style={{
                              backfaceVisibility: 'hidden',
                              transform: item ? 'rotateY(180deg)' : 'rotateY(0deg)',
                              transition: 'transform 0.6s ease-in-out'
                            }}
                          >
                            <img src={CARD_LOCK} alt="" className='w-[100%] h-[100%]' />
                          </div>
                          {/* 正面 - 解锁状态 */}
                          <div 
                            className='w-[100%] h-[100%] absolute'
                            style={{
                              backfaceVisibility: 'hidden',
                              transform: item ? 'rotateY(0deg)' : 'rotateY(-180deg)',
                              transition: 'transform 0.6s ease-in-out'
                            }}
                          >
                            <img src={CARD_OPEN} alt="" className='w-[100%] h-[100%]' />
                            <div className='text-[7px] text-[#fff] absolute top-[43px] left-[50%] translate-x-[-50%]'>{t('Unlocked')}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
              <div
                    className='w-[51px] h-[100%] relative ml-[15px]'
                    style={{ opacity: currImg ? 1 : 0.5 }}
                    onClick={() => {
    
                      if (!currImg) {
                        return
                      }
                      const showHideCard = () => {
                        setUnlock(true)
                        setTimeout(() => {
                          setShowUnlock(false)
                        }, 5000)
                      }
                      if (hideCard) {
                        setCurrImg('')
                        setCurrIdx(5)
                        localStorage.setItem(`${currData?.img_name}_hide`, 'true')
                        return
                      }
                      const isAllUnlock = cardList.findIndex((item: boolean) => !item) === -1
                      if (isAllUnlock) {
                        console.log('isAllUnlock')
    
                        log('fb_quiz_hide_unlock_suc', {
                          id: currData?.img_name,
                          type: 'all_unlock'
                        })
                        setCurrImg('')
                        setCurrIdx(5)
                        localStorage.setItem(`${currData?.img_name}_hide`, 'true')
                        return
                      }
                      if (unlock) {
                        log('fb_quiz_hide_unlock', {
                          id: currData?.img_name,
                          code: 1
                        })
                        handleWatchAdToUnlock()
                      } else {
                        log('fb_quiz_hide_unlock', {
                          id: currData?.img_name,
                          code: 0
                        })
                        showHideCard()
                      }
                    }}
                  >
                    <div
                      className="w-[100%] h-[100%] relative"
                      style={{
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.6s ease-in-out',
                        transform: hideCard ? 'rotateY(180deg)' : 'rotateY(0deg)'
                      }}
                    >
                      {/* 正面 - 隐藏卡片 */}
                      <div
                        className="w-[100%] h-[100%] absolute"
                        style={{
                          backfaceVisibility: 'hidden',
                          transition: 'transform 0.6s ease-in-out'
                        }}
                      >
                        <img src={IC_HIDE_STAR} className='absolute w-[17px] h-[17px] left-[-5px] top-[-5px]'/>
                        <img src={CARD_HIDE} alt="" className='w-[100%] h-[100%]' />
                      </div>
                      {/* 反面 - 打开卡片 */}
                      <div
                        className="w-[100%] h-[100%] absolute"
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                          transition: 'transform 0.6s ease-in-out'
                        }}
                      >
                        <img src={IC_HIDE_STAR} className='absolute w-[17px] h-[17px] left-[-5px] top-[-5px]'/>
                        <img src={CARD_OPEN} alt="" className='w-[100%] h-[100%]' />
                      </div>
                    </div>
              </div>
              </div>
            </div>
            <div className='w-[100%] flex flex-row h-[38px] mt-[6px] justify-center' style={{
              opacity: currImg ? 1 : 0.5
            }}>
                <img src={SHARE_BTN} alt="" className='w-[38px] h-[38px] mr-[14px]' onClick={handleShare}/>
                <div className='w-[190px] h-[38px] mr-[14px] relative breathing-fast' onClick={() => {
                  if (!currImg) {
                    return
                  }
                  // AdProxy.showCommonAd('retry') 
                  showAds('retry')
                  // setCurrImg('')
                  setRetryCount(retryCount + 1)
                  commonStore.setType('retry')
                  log('fb_quiz_templ_retry', {
                    from: gameStore.moduleFrom,
                    type: currData?.module_type,
                    id: currData?.img_name,
                    code: currData?.isNew === '1' ? 'new' : currData?.isHot === '1' ? 'hot' : 'normal',
                    amount: currIdx
                  })
                  handleRefresh()
                }}>
                  <img src={BTN_PINK_BG_2} alt="" className='w-[100%] h-[100%] absolute top-[0px] left-[0px]' />
                  <div className='w-[100%] h-[100%] flex flex-row relative justify-center '>
                    <div className='text-[16px] text-[#fff] leading-[35px] text-shadow' style={{
                      fontWeight: 900,
                    }}>{t('Click To Draw')}</div>
                  </div>
                </div>
                <img src={BTN_RETRY} alt="" className='w-[38px] h-[38px]' onClick={() => {
                  if (!currImg) {
                    return
                  }
                  showAds('retry') 
                  // AdProxy.showCommonAd('retry') 
                  setCurrImg('')
                  setRetryCount(retryCount + 1)
                  commonStore.setType('retry')
                  log('fb_quiz_templ_retry', {
                    from: gameStore.moduleFrom,
                    type: currData?.module_type,
                    id: currData?.img_name,
                    code: currData?.isNew === '1' ? 'new' : currData?.isHot === '1' ? 'hot' : 'normal',
                    amount: currIdx
                  })
                  handleRefresh() 
                }}/>
            </div>
            {
              currImg && unlock && showUnlock && <div className='w-[140px] min-h-[60px] text-[9px] absolute bottom-[90%] px-[7px] py-[5px] pb-[10px] right-[0px] box-border text-center text-[#fff] flex flex-col items-center justify-center' style={{
                backgroundImage: `url(${TIPS_BG})`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                fontFamily: 'Roboto',
              }}>
                <img src={IC_ADS} alt="" className='w-[25px] h-[25px] mt-[2px]' />
                <div>{t('Watch an Ad and unlock it!')}</div>
              </div>
            }
            {
              !commonStore.showUnlockTips && showUnlockTips && <div className='w-[140px] min-h-[60px] text-[10px] absolute bottom-[85%] px-[7px] py-[5px] pb-[12px] right-[-6px] box-border text-center text-[#fff]  flex flex-col items-center justify-center' style={{
                backgroundImage: `url(${TIPS_BG})`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                fontFamily: 'Roboto',
              }}>
                <div>✨️{t('This is a rare hidden card.')}</div>
                <div>{t('You need to unlock all cards first!')}</div>
              </div>
            }
            
          </div>
        }
     
    </div>
  );
};

export default observer(Details); 
