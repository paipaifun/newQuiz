import React from 'react';
import { getCurrentDate } from '../utils';

const EModule: React.FC<{bgStyle: React.CSSProperties, cropContainerRef: React.RefObject<HTMLDivElement>, name?: string}> = ({bgStyle, cropContainerRef, name}) => {
 
  return (
    <>    
      <div 
        className="w-[75px] h-[75px] absolute left-[50%] translate-x-[-50%] top-[37px] z-10 rounded-full border-2 border-[#fff]"
        ref={cropContainerRef}
        style={bgStyle}
      />
      <div className="w-[100%] h-[30px] absolute top-[116px] left-0 z-10 text-center text-[#000] Roboto text-[22x] leading-[30px] font-semibold" style={{
        fontWeight: 600
      }}>{name}</div>
      <div className="w-[100%] h-[30px] absolute bottom-[50px] left-0 z-10 text-center text-[#000] Roboto text-[22x] leading-[30px] font-semibold" style={{
        fontWeight: 600
      }}>{getCurrentDate()}</div>
    </>
  );
};

export default EModule;