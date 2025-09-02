import React from 'react';
import { getCurrentDate2 } from '../utils';

const JModule: React.FC<{bgStyle: React.CSSProperties, cropContainerRef: React.RefObject<HTMLDivElement>, name?: string, text?: string}> = ({bgStyle, cropContainerRef, name, text}) => {
 
  return (
    <>    
      <div 
        className="w-[54px] h-[54px] absolute left-[16px] top-[19px] z-10 rounded-full"
        ref={cropContainerRef}
        style={bgStyle}
      />
      <div className="w-[220px] h-[27px] absolute top-[22.5px] left-[81px] z-10 text-left text-[#000] Roboto text-[18x] leading-[27px] font-semibold" style={{
        fontWeight: 700,
        fontSize: '18px',
        color: '#353535'
      }}>{text}</div>
      <div className="w-[220px] h-[21px] absolute top-[48px] left-[81px] z-10 text-left text-[#000] Roboto text-[14x] leading-[21px] font-semibold" style={{
        fontWeight: 700,
        fontSize: '14px',
        color: '#8D8EAA'
      }}>{getCurrentDate2()}</div>
    </>
  );
};

export default JModule;