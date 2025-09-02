import React from 'react';
import { getCurrentDate } from '../utils';

const FModule: React.FC<{bgStyle: React.CSSProperties, cropContainerRef: React.RefObject<HTMLDivElement>, text: string, name?: string}> = ({bgStyle, cropContainerRef, text, name}) => {

  return (
    <>
      <div className="w-[100%] h-[30px] absolute top-[196px] left-0 z-10 text-center text-[#000] Roboto text-[22x] leading-[30px] font-semibold" style={{
        fontWeight: 600
      }}>{name}</div>
      <div className="w-[163px] h-[30px] absolute top-[239px] left-[50%] translate-x-[-50%] z-10 text-center text-[#000] Roboto text-[20x] leading-[30px] font-semibold" style={{
        fontWeight: 600
      }}>{text}</div>
    </>
  );
};

export default FModule;