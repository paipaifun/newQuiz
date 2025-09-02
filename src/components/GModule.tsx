import React from 'react';
import { getCurrentDate } from '../utils';

const GModule: React.FC<{bgStyle: React.CSSProperties, cropContainerRef: React.RefObject<HTMLDivElement>, text: string, name?: string}> = ({bgStyle, cropContainerRef, text, name}) => {
  console.log(text, 'text');
  return (
    <>
      <div 
        className="w-[75px] h-[75px] absolute right-[20px] top-[20px] z-10 rounded-full border-2 border-[#fff]"
        ref={cropContainerRef}
        style={bgStyle}
      />
      <div className="w-[230px] h-[73px] absolute top-[21.5px] left-[22px] z-10 flex flex-grow text-left text-[#fff] Roboto text-[24px] leading-[32.5px]  items-center justify-left" style={{
        fontWeight: 700
      }}>{text}</div>
    </>
  );
};

export default GModule;