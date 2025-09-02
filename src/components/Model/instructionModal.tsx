import React, { useState, useEffect, useRef } from 'react';
import Modal from './base';
import LANGUAGE_BTN_BG_CHOOSE from '../../assets/img/language_btn_bg_choose.png';
import LANGUAGE_BTN_BG_UNCHOOSE from '../../assets/img/language_btn_bg.png';
import { languages } from '../../constant';
import { commonStore } from '../../stores/CommonStore';
import { useI18n } from '../../hooks/useI18n';
import BTN_CLOSE from '../../assets/img/btn_close.png';
import { observer } from 'mobx-react-lite';
import PIC_TUTORIAL from '../../assets/img/pic_tutorial.png';
import { log } from '../../utils/firebase/firebase';

const InstructionModal: React.FC = () => {
  const { t } = useI18n();

  const textStyle = {
    fontWeight: '700',
    fontFamily: 'Roboto',
    lineHeight: '100%',
  }

  return (
      <Modal
        isOpen={commonStore.isInstructionModalVisible}
        onClose={() => commonStore.setIsInstructionModalVisible(false)}
        className="max-w-lg"
      >
        <div className='w-[330px] h-[500px] bg-[#fff] rounded-[15px] absolute top-[40%] left-[50%] translate-x-[-50%] translate-y-[-50%]'>
          <img src={PIC_TUTORIAL} alt="pic_tutorial" className='w-[299px] h-[417.5px] absolute top-[64px] left-[15.5px]' /> 
          <div className='w-[330px] h-[50px] bg-[#4F1FFF] flex items-center justify-center rounded-t-[15px]'>
            <span className='text-[20px] text-[#fff]' style={{
              fontFamily: 'Roboto',
              fontWeight: '700',
              lineHeight: '100%',
            }}>{t('Card Hunt Game')}</span>
          </div>
            <div className='w-[294px] text-[11px] absolute top-[71px] left-[19px] text-[#4F1FFF]' style={ textStyle}>
            {t('🔍Discover 4 different versions of this template.')}
          </div>

          <div className='w-[294px] text-[11px] absolute top-[178px] left-[19px] text-[#4F1FFF]' style={textStyle}>
            {t('😺Each time you retry, you\'ll unlock a new card!')}
          </div>

          <div className='w-[294px] text-[11px] absolute top-[286px] left-[19px] text-[#4F1FFF]' style={textStyle}>
            {t('🔓Collect all 4 to reveal the Hidden ONE.')}
          </div>

          <div className='w-[294px] text-[11px] absolute top-[392px] left-[19px] text-[#4F1FFF]' style={textStyle}>
            {t('💡Tap the hidden card to unlock with an Ad')}
          </div>
          <img src={BTN_CLOSE} alt="btn_close" className='w-[40px] h-[40px] absolute bottom-[-65px] left-[50%] translate-x-[-50%]' onClick={() => {
            commonStore.setIsInstructionModalVisible(false)
            log('fb_quiz_tutorial_close')
          }} />
        </div>
      </Modal>
  );
};

export default observer(InstructionModal);