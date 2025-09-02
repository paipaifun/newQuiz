import React, { useEffect, useState, useRef } from 'react';
import { getUrlParamsByName } from '../utils';
import { moduleData } from '../constant/module-data';
import ModuleEditor from '../components/ModuleEditor';
import List from '../components/list';

import BTN_PINK_BG_1 from '../assets/img/btn_pink_bg_1.png';
import BTN_SHARE_BG_1 from '../assets/img/btn_share_bg_1.png';
import ListTest from '../components/list-test';
import LINE3 from '../assets/img/line3.png';
import { useNavigate } from 'react-router-dom';
import { gameStore } from '../stores/GameStore';
import { log } from '../utils/firebase/firebase';
import { showAds, showBanner, showRewardVideoAd } from '../utils/ads';
import LIST_BTN_BG_SELECT from '../assets/img/list_btn_bg_select.png';
import LIST_BTN_BG from '../assets/img/list_btn_bg.png';
import { BASE_URL } from '../constant/module-data';
import BTN_PINK_BIG_BG from '../assets/img/btn_pink_big_bg.png'

// import { showTransparentModal, hideTransparentModal } from '../components/Model/transparentModal';
import BASIC_BTN_CLEAN from '../assets/img/basic_btn_clean.png';

// import { AdProxy } from '../utils/ads_new';

import { useI18n } from '../hooks/useI18n';
import NavBar from '../components/NavBar';
import { commonStore } from '../stores/CommonStore';
import { observer } from 'mobx-react-lite';

import IC_ARROW from '../assets/img/ic_arrow.png';

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

  const getNum = (moduleType: string) => {
    if (moduleType === 'P') {
      return 20
    } else if (moduleType === 'Q') {
      return 70
    }
    return 20
  }
  

  const [currData, setCurrData] = useState<any>(null);
  const [currIdx, setCurrIdx] = useState<number>(0);
  const [avatar, setAvatar] = useState<string>('');
  const [currImg, setCurrImg] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [retryCount, setRetryCount] = useState<number>(0);
  const id = getUrlParamsByName('id');
  const interactionType = getUrlParamsByName('interaction_type');
  const [currInteractionData, setCurrInteractionData] = useState<any>(null);
  const [currInput, setCurrInput] = useState<string>('');
  const [generated, setGenerated] = useState<boolean>(false);

  // const [cardList, setCardList] = useState<boolean[]>([false, false, false, false]);


  // useEffect(() => {
  //   if (!currImg) {
  //     return
  //   }
  //   const newCardList = [...cardList]
  //   const currCardListState = cardList.filter((item: boolean) => item).length
  //   newCardList[currIdx - 1] = true
  //   const newCardListState = newCardList.filter((item: boolean) => item).length
  //   if (newCardListState === 4 &&  currCardListState === 3) {
  //     log('fb_quiz_card_unlock_all', {
  //       id: currData?.img_name,
  //     })
  //   }
  //   // setCardList(newCardList)
  //   localStorage.setItem(currData?.img_name, JSON.stringify(newCardList))
  // }, [currIdx, currImg])



  useEffect(() => {
    showBanner('interaction_details')
  }, [])

  useEffect(() => {
    if (!id) {
      return
    }
    const data = moduleData.find((item: any) => item.img_name === id);
    setCurrData(data);
    log('fb_quiz_interact_shown', {
      from: gameStore.moduleFrom,
      type: data?.module_type,
      interaction_type: data?.interaction_type,
      id: data?.img_name,
    })

    // setCurrInteractionData(data);
    setCurrIdx(0)
    setCurrImg('')
    setGenerated(false)
    setCurrInteractionData(null)
    setRetryCount(0)
    setCurrInput('')
    commonStore.setCurrInput('')
    fetchAvatar()
  }, [id]);


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

  const scrollToTop = () => {
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
        behavior: 'smooth'
      });
    }
  }

  const handleChoose = (idx: number) => {
    if (idx === currIdx) {
      return
    }
    
    if (currImg || !generated) {
      // showAds('choose')
      
      log('fb_quiz_interact_click', {
        from: gameStore.moduleFrom,
        type: currData?.module_type,
        id: currData?.img_name,
      })

      console.log(currData, 'currData')
      setGenerated(true)
      setCurrInteractionData(currData)
      setCurrIdx(idx)

      setTimeout(() => {
        scrollToTop()
      }, 200)
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
        {currData?.interaction_type === 'text' && <div className='w-[calc(100%-20px)] mx-[10px]'>
            {/* 长度为5的数组遍历 */}
            {Array.from({length: 5}).map((_, index) => {
              return (
                <div key={index} onClick={() => handleChoose(index + 1)} className='w-[100%] h-[40px] mb-[5px] relative'>
                  {/* {index + 1} */}
                  <img src={currIdx === index + 1 ? LIST_BTN_BG_SELECT : LIST_BTN_BG} alt="" className='w-[100%] h-[40px] absolute' />
                  <div className='w-[100%] h-[40px] flex flex-row items-center'>
                    <div className='text-[16px] leading-[40px] text-[#fff] z-999 ellipsis pl-[14px]' style={{
                      fontWeight: 900,
                      fontFamily: 'Roboto',
                      opacity: currImg || !generated ? 1 : 0.5,
                      // 描边
                      textShadow: currIdx === index + 1 ? '0px 2px 0px #6B0676, 0px -2px 0px #6B0676, 2px 0px 0px #6B0676, -2px 0px 0px #6B0676' : '0px 2px 0px #000000, 0px -2px 0px #000000, 2px 0px 0px #163296, -2px 0px 0px #000000'
                    }}>
                      {index + 1 === 1 ? 'A.' : index + 1 === 2 ? 'B.' : index + 1 === 3 ? 'C.' : index + 1 === 4 ? 'D.' : 'E.'} {t(currData?.[`choose_${index + 1}`])}
                    </div>
                  </div>
                </div>
              )
            })}
        </div>}

        {currData?.interaction_type === 'image' && <div className='w-[calc(100%-20px)] mx-[10px] flex flex-row items-center justify-center flex-wrap'>
            {/* 长度为5的数组遍历 */}
            {Array.from({length: 5}).map((_, index) => {
              return (
                <div key={index} onClick={() => handleChoose(index + 1)} className='w-[91px] h-[92px] m-[5px] relative bg-[#E0E0E0] rounded-[6px] p-[5px] flex flex-row items-top justify-center'
                  style={{
                    border: currIdx === index + 1 ? '2px solid #C021FF' : '2px solid #E0E0E0',
                    backgroundColor: currIdx === index + 1 ? '#F5E1FF' : '#E0E0E0',
                    opacity: currImg || !generated ? 1 : 0.5,

                  }}
                >
                  <div className='text-[14px] text-[#000] text-center leading-[14px] mr-[2px]'>
                    {index + 1 === 1 ? 'A.' : index + 1 === 2 ? 'B.' : index + 1 === 3 ? 'C.' : index + 1 === 4 ? 'D.' : 'E.'} {t(currData?.[`choose_${index + 1}`])}
                  </div>
                  <img src={`${BASE_URL}${currData?.img_name}_${index + 1}.jpg?alt=media`}  alt="" className='w-[100%] h-[100%] object-cover rounded-[4px]' />
                </div>
              )
            })}
        </div>}

        {currData?.interaction_type === 'input' &&<>
         <div className='bg-[#F5E1FF] w-[calc(100%-20px)] mx-[10px] h-[110px] rounded-[10px] overflow-hidden relative pb-[28px]'>
            <textarea
              className='resize-none details-textarea bg-[#F5E1FF] w-[100%] h-[100%] text-[14px] border-none outline-none text-[#000] leading-[14px] pt-[15px] px-[10px] box-border' 
              maxLength={getNum(currData?.module_type)}
              onChange={(e) => {
                commonStore.setCurrInput(e.target.value)
              }}
              value={commonStore.currInput}
              placeholder={t(currData?.guide_text)} 
            >
            </textarea>
            <div className='absolute right-[10px] bottom-[10px] flex flex-row items-center'>
              <div className='text-[12px] text-[#976EB3]'>
                {commonStore.currInput.length}/{getNum(currData?.module_type)} |
              </div>
              <img src={BASIC_BTN_CLEAN} alt="" className='w-[15px] h-[15px] object-cover ml-[5px]' onClick={() => {
                commonStore.setCurrInput('')
              }}/>
            </div>
          </div>
          <div className='w-[204px] h-[58.5px] mx-auto mt-[0px] rounded-[10px] overflow-hidden relative pb-[28px] box-border mb-[10px]'
            onClick={() => {
              console.log('generate', !currImg && generated)

              if (!currImg && generated) {
                return
              }
              setTimeout(() => {
                scrollToTop()
              }, 200)
              log('fb_quiz_interact_click', {
                from: gameStore.moduleFrom,
                type: currData?.module_type,
                interaction_type: currData?.interaction_type,
                id: currData?.img_name,
              })
              setGenerated(true)
              setCurrInteractionData(currData)

              setCurrIdx(currIdx + 1 > 5 ? 1 : currIdx + 1)
              // showAds('generate')
            }}
            style={{
              opacity: currImg || !generated ? 1 : 0.5,
            }}
          >
            <img src={BTN_PINK_BIG_BG} alt="" className='w-[100%] h-[100%] absolute' />
            <div className='text-[20px] text-[#fff] text-center z-999 relative leading-[58.5px]' style={{
              fontWeight: 700,
              fontFamily: 'Roboto',
              textShadow: '0px 2px 0px #6B0676, 0px -2px 0px #6B0676, 2px 0px 0px #6B0676, -2px 0px 0px #6B0676',
            }}>{t('Generate')}</div>
          </div>
         </>
         }

       
        <div id="editor-container" onClick={() => {
          handleShare()
        }}>
          {currInteractionData && currIdx > 0 && <ModuleEditor name={name} currIdx={currIdx} currData={currData} avatar={avatar} setCurrImg={(img: string) => {
            setCurrImg(img)
          }}/>}
        </div>
        <div className='flex flex-row items-center justify-center text-[14px] mt-[4px] mb-[6px] underline' style={{
          color: '#EA48FF',
          fontWeight: 700,
          display: generated ? 'flex' : 'none',
        }}
        onClick={() => {
          if (!currImg) {
            return
          }
          log('fb_quiz_spin_show', {
            from: 'result_page'
          })
          commonStore.setDailyFreeModalVisible(true)
        }}
        >
          {t(`🔮How's your fortune today?`)}
          <img src={IC_ARROW} alt="" className="w-[10px] h-[10px] ml-[2px]" />
        </div>
        
        <div className="w-[330px] h-[55px] mx-auto mt-[0px] text-[12px] text-[#787878] text-center leading-[14px]" style={{
          fontWeight: 700,
          fontFamily: 'Roboto',
          display: generated && currIdx > 0 ? 'block' : 'none',
          height: generated && currIdx > 0 ? '55px' : '0px',
        }}>
          <div className='w-[330px] h-[55px] relative flex flex-row justify-center mt-[4px]'>
            <div className='w-[170px] h-[36.5px] flex flex-row items-center justify-center mr-[30px]' onClick={handleShare}>
              <img src={BTN_SHARE_BG_1} alt="" className='w-[170px] h-[36.5px] absolute' />
              <div className='text-[16px] text-[#fff] text-center z-10 absolute ' style={{
                fontWeight: 700,
                fontFamily: 'Roboto',
                textShadow: '0px 2px 0px #000000',
                opacity: currImg ? 1 : 0.5
              }}>{t('share')}</div>
            </div>
            <div className='w-[170px] h-[36.5px] flex flex-row items-center justify-center breathing-fast' style={{
              opacity: currImg ? 1 : 0.5,
            }} onClick={() => {
              // if (currData?.module_type === 'P') {
              //   return
              // }
              // console.log('retry')
              if (!currImg) {
                return
              }
              commonStore.setCurrInput('')
              setCurrIdx(0)
              // setCurrIdx(0)
              const detailsContainer = document.getElementById('details-container')
              detailsContainer?.scrollTo({
                top: 0,
                behavior: 'smooth'
              })

              log('fb_quiz_templ_retry', {
                from: gameStore.moduleFrom,
                type: currData?.module_type,
                id: currData?.img_name,
                code: currData?.isNew === '1' ? 'new' : currData?.isHot === '1' ? 'hot' : 'normal',
                amount: currIdx
              })
              setTimeout(() => {
                showAds('retry')
              }, 1000)
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
        <img src={LINE3} alt="" className="w-[100%] h-[1px] mt-[10px]" />
        <div className="w-[100vw] z-10 bg-[#f2f4f7] mt-[15px] px-[5px] pb-[60px] box-border overflow-y-auto scrollbar-hide">
          <div className="w-[100%] text-[#000] text-[17.5px] leading-[16px] font-semibold mb-[8px]" style={{
            fontWeight: 700,
          }}>
            {t('More meme for you')}
          </div>
          

          {commonStore.isTestListCountry && <ListTest rerender={() => {
            setCurrImg('')
            // handleRefresh()
            // setTimeout(() => {
            //   handleScrollEnd()
            // }, 200);
          }} containerId="details-container" />}
          {!commonStore.isTestListCountry && <List rerender={() => {
            setCurrImg('')
            // handleRefresh()
            // setTimeout(() => {
            //   handleScrollEnd()
            // }, 200);
          }} containerId="details-container" />}
        </div>
      </div>
    </div>
  );
};

export default observer(Details); 
