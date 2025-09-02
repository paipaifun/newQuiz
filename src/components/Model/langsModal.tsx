import React, { useState, useEffect, useRef } from 'react';
import Modal from './base';
import LANGUAGE_BTN_BG_CHOOSE from '../../assets/img/language_btn_bg_choose.png';
import LANGUAGE_BTN_BG_UNCHOOSE from '../../assets/img/language_btn_bg.png';
import { languages } from '../../constant';
import { commonStore } from '../../stores/CommonStore';
import { useI18n } from '../../hooks/useI18n';
import BTN_CLOSE from '../../assets/img/btn_close.png';
import { observer } from 'mobx-react-lite';

const LangsModal: React.FC = () => {
  const { changeLanguage, t } = useI18n();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleLanguageClick = (language: string) => {
    // console.log('language', language);
    changeLanguage(language);
  }

  // 当弹窗打开时，滚动到当前选中的语言位置
  useEffect(() => {
    console.log('commonStore.isLangsModalVisible', commonStore.isLangsModalVisible);
    console.log('scrollContainerRef.current', scrollContainerRef.current);
    if (commonStore.isLangsModalVisible) {
      // 添加延迟确保DOM已经渲染完成
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const currentLanguageIndex = languages.findIndex(lang => lang.value === commonStore.language);
          console.log('currentLanguageIndex', currentLanguageIndex);
          if (currentLanguageIndex !== -1) {
            const languageElement = scrollContainerRef.current.children[currentLanguageIndex] as HTMLElement;
            if (languageElement) {
              languageElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
            }
          }
        }
      }, 100); // 100ms延迟
    }
  }, [commonStore.isLangsModalVisible]);

  return (
      <Modal
        isOpen={commonStore.isLangsModalVisible}
        onClose={() => commonStore.setIsLangsModalVisible(false)}
        className="max-w-lg"
      >
        <div className='w-[265px] h-[300px] bg-[#fff] rounded-[15px] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]'>
          <div className='w-[265px] h-[40px] bg-[#4F1FFF] flex items-center justify-center rounded-t-[15px]'>
            <span className='text-[16px] text-[#fff]'>{t('language')}</span>
          </div>
          <div className='w-[265px - 32px] h-[225px] mt-[16px] mx-[16px] mb-[20px] overflow-y-auto box-border scrollbar-hide' ref={scrollContainerRef}>
            {languages.map((language) => (
              <div className='w-[233px] h-[37.5px] flex items-center justify-center  mb-[15px]' style={{
                  backgroundImage: commonStore.language === language.value ? `url(${LANGUAGE_BTN_BG_CHOOSE})` : `url(${LANGUAGE_BTN_BG_UNCHOOSE})`,
                  backgroundSize: '100% 100%',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
                onClick={() => handleLanguageClick(language.value)}
              >
                <span className='text-[12px] text-[#fff] h-[37.5px] leading-[35.5px] '>{language.label}</span>
              </div>
            ))}
          </div>
          <img src={BTN_CLOSE} alt="btn_close" className='w-[40px] h-[40px] absolute bottom-[-65px] left-[50%] translate-x-[-50%]' onClick={() => commonStore.setIsLangsModalVisible(false)} />
        </div>
      </Modal>
  );
};

export default observer(LangsModal);