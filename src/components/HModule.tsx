import React from 'react';
import { getCurrentDate } from '../utils';

const HModule: React.FC<{bgStyle: React.CSSProperties, cropContainerRef: React.RefObject<HTMLDivElement>, text: string, name?: string}> = ({bgStyle, cropContainerRef, text, name}) => {

  return (
    <>
      <div 
        className="w-[131.5px] h-[131.5px] absolute right-[28px] top-[53px] z-10 rounded-[6px]"
        ref={cropContainerRef}
        style={bgStyle}
      />
      <div className="w-[135px] h-[46px] absolute top-[293px] left-[44.5px] z-10 flex flex-grow text-left text-[#FFF] Roboto text-[15px] leading-[22.5px]  items-center justify-left" style={{
        fontWeight: 500
      }}>{text}</div>
    </>
  );
};

export default HModule;